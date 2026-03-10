import prisma from "../src/config/prisma.js";

async function main() {
  console.log("🌱 Seeding categories...");

  // ----------------------------
  // PRODUCT CATEGORIES
  // ----------------------------
  const productCategories = [
    "APP",
    "ACP",
    "Aluminium",
    "Board",
    "Hardware",
    "Glass",
    "Rubber",
    "Sunboard"
  ];

  for (const name of productCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        type: "PRODUCT"
      }
    });

    console.log(`✅ Product category added: ${name}`);
  }

  // ----------------------------
  // EXPENSE CATEGORIES
  // ----------------------------
  const expenseCategories = [
    "Transport Charges",
    "Labour Charges",
    "Electricity Bill",
    "Rent",
    "Internet",
    "Maintenance",
    "Office Supplies",
    "Fuel",
    "Packing Material",
    "Miscellaneous"
  ];

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        type: "EXPENSE"
      }
    });

    console.log(`💸 Expense category added: ${name}`);
  }

  console.log("🎉 Category seeding completed!");
}

main()
  .catch(e => {
    console.error("❌ Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
