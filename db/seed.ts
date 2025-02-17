import { OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import { funds } from "@/db/schema";

export async function seedDatabase(db: OPSQLiteDatabase) {
  const existingFunds = await db.select().from(funds).all();

  if (existingFunds.length === 0) {
    db.insert(funds)
      .values([
        {
          name: "S&P 500 Index Fund",
          description:
            "Tracks the S&P 500 index, providing broad exposure to large U.S. companies",
        },
        {
          name: "Global Bond Fund",
          description:
            "Diversified portfolio of government and corporate bonds from around the world",
        },
        {
          name: "Real Estate Investment Trust",
          description:
            "Investment in commercial and residential real estate properties",
        },
        {
          name: "Emerging Markets Fund",
          description:
            "Focuses on stocks from developing economies with high growth potential",
        },
        {
          name: "Technology Sector Fund",
          description:
            "Concentrated in technology companies across hardware, software, and services",
        },
        {
          name: "Dividend Growth Fund",
          description:
            "Invests in companies with history of increasing dividend payments",
        },
        {
          name: "Green Energy Fund",
          description:
            "Focuses on renewable energy and sustainable technology companies",
        },
      ])
      .run();
  }
}
