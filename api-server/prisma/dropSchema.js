import prisma from "../src/config/prisma.js";

async function main() {
  console.log("🧹 Clearing all database data...");

  // Fetch all tables from public schema
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public';
  `);

  // Disable foreign key checks temporarily
  await prisma.$executeRawUnsafe(`
    SET session_replication_role = replica;
  `);

  for (const { tablename } of tables) {
    // Skip Prisma migration table
    if (tablename === "_prisma_migrations") continue;

    console.log(`Clearing table: ${tablename}`);

    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "public"."${tablename}"
      RESTART IDENTITY CASCADE;
    `);
  }

  // Re-enable constraints
  await prisma.$executeRawUnsafe(`
    SET session_replication_role = DEFAULT;
  `);

  console.log("✅ All data deleted successfully!");
}

main()
  .catch(e => {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
