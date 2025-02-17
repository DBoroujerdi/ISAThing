import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const investmentEventTypes = [
  "deposit",
  "allocation",
  "withdrawal",
  "reallocation",
] as const;

export const funds = sqliteTable("funds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const investmentEvents = sqliteTable("investment_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  eventType: text("event_type")
    .notNull()
    .$type<(typeof investmentEventTypes)[number]>(),
  fundId: integer("fund_id").references(() => funds.id),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
