import { OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import { desc, eq } from "drizzle-orm";

import { funds, investmentEvents } from "@/db/schema";

export type FundInvestment = {
  fundId: number;
  fundName: string;
  value: number;
};

/**
 * Pretend this is my backend.
 * Contains the domain logic
 */
class BackendService {
  private db: OPSQLiteDatabase;

  constructor(db: OPSQLiteDatabase) {
    this.db = db;
  }

  async getFunds() {
    const availableFunds = await this.db.select().from(funds).all();
    return availableFunds;
  }

  async makeDeposit(amount: number) {
    await this.db.insert(investmentEvents).values({
      amount,
      eventType: "deposit",
    });
  }

  async makeAllocation(amount: number, fundId: number) {
    const transactions = await this.getTransactionHistory();

    const totalDeposits = transactions
      .filter((t) => t.eventType === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAllocations = transactions
      .filter((t) => t.eventType === "allocation")
      .reduce((sum, t) => sum + t.amount, 0);

    const unallocatedFunds = totalDeposits - totalAllocations;

    if (unallocatedFunds < amount) {
      throw new Error("Insufficient unallocated funds");
    }
    await this.db.insert(investmentEvents).values({
      fundId,
      amount,
      eventType: "allocation",
    });
  }

  async getTransactionHistory() {
    const history = await this.db
      .select({
        fundId: funds.id,
        fundName: funds.name,
        amount: investmentEvents.amount,
        eventType: investmentEvents.eventType,
      })
      .from(investmentEvents)
      .leftJoin(funds, eq(funds.id, investmentEvents.fundId))
      .all();

    return history;
  }

  async getISA() {
    const deposits = await this.db
      .select({
        amount: investmentEvents.amount,
        eventType: investmentEvents.eventType,
      })
      .from(investmentEvents)
      .where(eq(investmentEvents.eventType, "deposit"))
      .all();

    const investments = await this.db
      .select({
        fundId: funds.id,
        fundName: funds.name,
        amount: investmentEvents.amount,
        eventType: investmentEvents.eventType,
      })
      .from(investmentEvents)
      .where(eq(investmentEvents.eventType, "allocation"))
      .leftJoin(funds, eq(funds.id, investmentEvents.fundId))
      .orderBy(desc(investmentEvents.createdAt))
      .all();

    const fundInvestments = investments.reduce((acc, investment) => {
      const existingFund = acc.find(
        (fund) => fund.fundId === investment.fundId,
      );

      if (existingFund) {
        if (investment.eventType === "allocation") {
          existingFund.value += investment.amount;
        }
        return acc;
      }

      const newFund = {
        fundId: investment.fundId!,
        fundName: investment.fundName!,
        value: investment.amount,
      };

      return [...acc, newFund];
    }, [] as FundInvestment[]);

    const totalDeposited = deposits.reduce(
      (sum, deposit) => sum + deposit.amount,
      0,
    );

    const totalInvestments = fundInvestments.reduce(
      (sum, investment) => sum + investment.value,
      0,
    );

    const availableFunds = totalDeposited - totalInvestments;

    return {
      totalValue: availableFunds + totalInvestments,
      availableFunds,
      investments: fundInvestments,
    };
  }

  // this is just a test function
  async truncateInvestmentEvents() {
    await this.db.delete(investmentEvents);
  }
}

export { BackendService };
