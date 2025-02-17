import { openDatabaseSync } from "expo-sqlite";
// import { drizzle } from "drizzle-orm/expo-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { open } from "@op-engineering/op-sqlite";
const opsqlite = open({
  name: "db.db",
});
// const expoDb = openDatabaseSync("db.db");

export const db = drizzle(opsqlite);
