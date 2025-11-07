import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";

export interface JourneyTable {
  id: string;
  userId: string;
  status: string;
  targetRole: string | null;
  updatedAt: string;
}

export interface DatabaseSchema {
  journeys: JourneyTable;
}

export function createInMemoryDb(): Kysely<DatabaseSchema> {
  const db = new Database(":memory:");
  const dialect = new SqliteDialect({ database: db });
  return new Kysely<DatabaseSchema>({ dialect });
}

export async function seedDemoData(db: Kysely<DatabaseSchema>) {
  await db.schema
    .createTable("journeys")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("userId", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("targetRole", "text")
    .addColumn("updatedAt", "text", (col) => col.notNull())
    .execute();

  await db
    .insertInto("journeys")
    .values({
      id: "demo-journey-001",
      userId: "user-001",
      status: "COMMON_DIMS_LOCKED",
      targetRole: "Tencent · CSIG · 产品经理",
      updatedAt: new Date().toISOString(),
    })
    .execute();
}

