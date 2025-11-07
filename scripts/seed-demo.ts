import { createInMemoryDb, seedDemoData } from "@resume-copilot/shared-db";

async function main() {
  const db = createInMemoryDb();
  await seedDemoData(db);
  const journeys = await db.selectFrom("journeys").selectAll().execute();
  console.log(journeys);
}

main();
