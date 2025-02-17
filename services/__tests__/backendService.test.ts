import { describe, it, expect, beforeAll } from "@jest/globals";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import { seedDatabase } from "@/db/seed";
import { investmentEvents } from "@/db/schema";

import { BackendService } from "../backendService";

describe("BackendService", () => {
  let testDb: any;
  let service: BackendService;

  beforeAll(async () => {
    const client = createClient({
      url: "file:test.db",
    });
    testDb = drizzle(client);

    await migrate(testDb, { migrationsFolder: "./drizzle" });

    service = new BackendService(testDb);
  });

  beforeEach(async () => {
    await seedDatabase(testDb);
  });

  afterEach(async () => {
    await testDb.delete(investmentEvents);
  });

  it("should get all funds", async () => {
    const funds = await service.getFunds();

    expect(Array.isArray(funds)).toBe(true);
    expect(funds.length).toBeGreaterThan(0);
    expect(funds.length).toEqual(7);
  });

  it("should return an empty history initially", async () => {
    const history = await service.getTransactionHistory();

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toEqual(0);
  });

  it("should record a deposit in history", async () => {
    await service.makeDeposit(100);

    const history = await service.getTransactionHistory();

    expect(history.length).toEqual(1);
    expect(history[0]).toMatchObject({
      amount: 100,
      eventType: "deposit",
      fundId: null,
      fundName: null,
    });
  });

  it("should record a fund allocation in the transaction history", async () => {
    await service.makeDeposit(100);
    await service.makeAllocation(5, 1);

    const history = await service.getTransactionHistory();

    expect(history.length).toEqual(2);
    expect(history[1]).toMatchObject({
      amount: 5,
      eventType: "allocation",
      fundId: 1,
      fundName: "S&P 500 Index Fund",
    });
  });

  it("should not allow an allocation if the account has insufficient funds", async () => {
    await service.makeDeposit(100);
    await expect(service.makeAllocation(101, 1)).rejects.toThrow();
  });

  it("should not allow allow an allocation if the account lacks unallocated funds", async () => {
    await service.makeDeposit(100);
    await service.makeAllocation(50, 1);
    await expect(service.makeAllocation(51, 1)).rejects.toThrow();
  });

  it("should allow making a fund allocation", async () => {
    await service.makeDeposit(100);
    await service.makeAllocation(100, 1);

    const history = await service.getTransactionHistory();

    expect(history.length).toEqual(2);
    expect(history[1]).toMatchObject({
      amount: 100,
      eventType: "allocation",
      fundId: 1,
      fundName: "S&P 500 Index Fund",
    });
  });

  it("should return an empty isa initially", async () => {
    const isa = await service.getISA();

    expect(isa.totalValue).toEqual(0);
    expect(Array.isArray(isa.investments)).toBe(true);
    expect(isa.investments.length).toEqual(0);
  });

  it("should return total value", async () => {
    await service.makeDeposit(100);
    await service.makeAllocation(50, 1);

    const isa = await service.getISA();

    expect(isa.totalValue).toEqual(100);
    expect(Array.isArray(isa.investments)).toBe(true);
    expect(isa.investments.length).toEqual(1);
  });

  it("should return all fund allocations", async () => {
    await service.makeDeposit(100);
    await service.makeAllocation(50, 1);
    await service.makeAllocation(50, 2);

    const isa = await service.getISA();

    expect(isa.totalValue).toEqual(100);
    expect(Array.isArray(isa.investments)).toBe(true);
    expect(isa.investments.length).toEqual(2);

    expect(isa.investments[0]).toMatchObject({
      value: 50,
      fundId: 1,
      fundName: "S&P 500 Index Fund",
    });
    expect(isa.investments[1]).toMatchObject({
      value: 50,
      fundId: 2,
      fundName: "Global Bond Fund",
    });
  });

  it("should aggregate allocations to the same investment", async () => {
    await service.makeDeposit(120);
    await service.makeAllocation(50, 1);
    await service.makeAllocation(20, 1);
    await service.makeAllocation(50, 2);

    const isa = await service.getISA();

    expect(isa.totalValue).toEqual(120);
    expect(Array.isArray(isa.investments)).toBe(true);
    expect(isa.investments.length).toEqual(2);

    expect(isa.investments[0]).toMatchObject({
      value: 70,
      fundId: 1,
      fundName: "S&P 500 Index Fund",
    });
    expect(isa.investments[1]).toMatchObject({
      value: 50,
      fundId: 2,
      fundName: "Global Bond Fund",
    });
  });
});
