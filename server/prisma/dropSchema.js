import prisma from "../src/config/prisma.js";

async function main() {
  await prisma.$executeRawUnsafe(`DROP SCHEMA invenso_dev CASCADE;`);
  console.log("Schema invenso_dev has been dropped!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
