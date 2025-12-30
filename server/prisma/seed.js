// prisma/seedPayment.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function ensureParties() {
  const existing = await prisma.party.findMany();
  if (existing.length >= 3) return existing;
  console.log("⚠️ Creating 3 fallback parties (needed for FK references)...");
  await prisma.party.createMany({
    data: [
      { name: "ABC Traders", type: "SUPPLIER" },
      { name: "Festive Retail", type: "CUSTOMER" },
      { name: "Star Logistics", type: "DRIVER" },
    ],
    skipDuplicates: true,
  });
  return await prisma.party.findMany();
}

async function ensureSales(parties) {
  // we will create sales with invoiceNumber 101..110 so payment.referenceId can point to them
  const invoiceBase = 101;
  const needed = Array.from({ length: 10 }).map((_, i) => invoiceBase + i); // 101..110

  // find already existing invoiceNumbers
  const existing = await prisma.sale.findMany({
    where: { invoiceNumber: { in: needed } },
    select: { invoiceNumber: true },
  });
  const existingNums = new Set(existing.map(s => s.invoiceNumber));

  const toCreate = needed
    .filter(n => !existingNums.has(n))
    .map((invoiceNumber, idx) => ({
      invoiceNumber,
      partyId: parties[idx % parties.length]?.id || parties[0].id,
      totalAmount: 1000 + idx * 200, // simple varying totals
      totalGstAmount: 0,
      totalTaxableAmount: 1000 + idx * 200,
      receivedAmount: 0,
      paymentMode: "NONE",
      remarks: `Auto sale ${invoiceNumber}`,
    }));

  if (toCreate.length) {
    console.log(`➡️ Creating ${toCreate.length} Sale rows (invoiceNumbers ${toCreate.map(x=>x.invoiceNumber).join(", ")})`);
    // createMany works fine and lets us set invoiceNumber explicitly
    await prisma.sale.createMany({ data: toCreate, skipDuplicates: true });
  }
}

async function ensurePurchases(parties) {
  // create purchases with invoiceNumber 201..206 (we used these referenceIds in payments)
  const needed = [201, 202, 203, 204, 205, 206];

  const existing = await prisma.purchase.findMany({
    where: { invoiceNumber: { in: needed } },
    select: { invoiceNumber: true },
  });
  const existingNums = new Set(existing.map(p => p.invoiceNumber));

  const toCreate = needed
    .filter(n => !existingNums.has(n))
    .map((invoiceNumber, idx) => ({
      invoiceNumber,
      partyId: parties[idx % parties.length]?.id || parties[0].id,
      totalAmount: 2000 + idx * 300,
      totalGstAmount: 0,
      totalTaxableAmount: 2000 + idx * 300,
      paidAmount: 0,
      paymentMode: "NONE",
      remarks: `Auto purchase ${invoiceNumber}`,
    }));

  if (toCreate.length) {
    console.log(`➡️ Creating ${toCreate.length} Purchase rows (invoiceNumbers ${toCreate.map(x=>x.invoiceNumber).join(", ")})`);
    await prisma.purchase.createMany({ data: toCreate, skipDuplicates: true });
  }
}

async function main() {
  console.log("🌱 Starting Payment seed (safe, creates required Sales/Purchases if missing)...");

  // 1. Ensure parties exist
  const parties = await ensureParties();

  // 2. Ensure Sales and Purchases exist for referenced invoiceNumbers
  await ensureSales(parties);
  await ensurePurchases(parties);

  // refetch parties to ensure consistent indexing
  const allParties = await prisma.party.findMany();

  // 3. Prepare payments (20 rows) — referenceIds point to existing sale/purchase invoice numbers above
  const payments = [
    { date: new Date("2025-01-05"), partyId: allParties[0]?.id || 1, type: "RECEIVED", amount: 2500.0, paymentReference: "INV-1001", remark: "Sale payment received", referenceType: "SALE", referenceId: 101, paymentMode: "CASH" },
    { date: new Date("2025-01-07"), partyId: allParties[1]?.id || 1, type: "PAID", amount: 1800.5, paymentReference: "PUR-2001", remark: "Supplier payment", referenceType: "PURCHASE", referenceId: 201, paymentMode: "BANK_TRANSFER" },
    { date: new Date("2025-01-10"), partyId: allParties[2]?.id || 1, type: "RECEIVED", amount: 3200.0, paymentReference: "INV-1002", remark: "Advance from customer", referenceType: "SALE", referenceId: 102, paymentMode: "UPI" },
    { date: new Date("2025-01-12"), partyId: allParties[0]?.id || 1, type: "PAID", amount: 750.0, paymentReference: "EXP-3001", remark: "Transport fuel expense", referenceType: "TRANSPORT", referenceId: null, paymentMode: "CASH" },
    { date: new Date("2025-01-13"), partyId: allParties[1]?.id || 1, type: "RECEIVED", amount: 4200.0, paymentReference: "INV-1003", remark: "Full payment received", referenceType: "SALE", referenceId: 103, paymentMode: "CASH" },
    { date: new Date("2025-01-15"), partyId: allParties[2]?.id || 1, type: "PAID", amount: 980.0, paymentReference: "PUR-2002", remark: "Advance for material", referenceType: "PURCHASE", referenceId: 202, paymentMode: "UPI" },
    { date: new Date("2025-01-18"), partyId: allParties[0]?.id || 1, type: "RECEIVED", amount: 3100.0, paymentReference: "INV-1004", remark: "Partial payment", referenceType: "SALE", referenceId: 104, paymentMode: "CARD" },
    { date: new Date("2025-01-19"), partyId: allParties[1]?.id || 1, type: "PAID", amount: 2600.0, paymentReference: "PUR-2003", remark: "Purchase settlement", referenceType: "PURCHASE", referenceId: 203, paymentMode: "CHEQUE" },
    { date: new Date("2025-01-20"), partyId: allParties[2]?.id || 1, type: "RECEIVED", amount: 4500.0, paymentReference: "INV-1005", remark: "Final invoice payment", referenceType: "SALE", referenceId: 105, paymentMode: "ONLINE" },
    { date: new Date("2025-01-22"), partyId: allParties[0]?.id || 1, type: "PAID", amount: 1250.0, paymentReference: "EXP-3002", remark: "Transport maintenance", referenceType: "TRANSPORT", referenceId: null, paymentMode: "CASH" },
    { date: new Date("2025-01-24"), partyId: allParties[1]?.id || 1, type: "RECEIVED", amount: 3800.0, paymentReference: "INV-1006", remark: "Sale payment received", referenceType: "SALE", referenceId: 106, paymentMode: "CASH" },
    { date: new Date("2025-01-26"), partyId: allParties[2]?.id || 1, type: "PAID", amount: 2050.0, paymentReference: "PUR-2004", remark: "Material purchase", referenceType: "PURCHASE", referenceId: 204, paymentMode: "BANK_TRANSFER" },
    { date: new Date("2025-01-28"), partyId: allParties[0]?.id || 1, type: "RECEIVED", amount: 2950.0, paymentReference: "INV-1007", remark: "Customer advance", referenceType: "SALE", referenceId: 107, paymentMode: "UPI" },
    { date: new Date("2025-01-30"), partyId: allParties[1]?.id || 1, type: "PAID", amount: 850.0, paymentReference: "PUR-2005", remark: "Misc material cost", referenceType: "PURCHASE", referenceId: 205, paymentMode: "CASH" },
    { date: new Date("2025-02-02"), partyId: allParties[2]?.id || 1, type: "RECEIVED", amount: 5100.0, paymentReference: "INV-1008", remark: "Final payment cleared", referenceType: "SALE", referenceId: 108, paymentMode: "ONLINE" },
    { date: new Date("2025-02-05"), partyId: allParties[0]?.id || 1, type: "PAID", amount: 1900.0, paymentReference: "EXP-3003", remark: "Driver wage payment", referenceType: "TRANSPORT", referenceId: null, paymentMode: "CASH" },
    { date: new Date("2025-02-07"), partyId: allParties[1]?.id || 1, type: "RECEIVED", amount: 3400.0, paymentReference: "INV-1009", remark: "Customer partial", referenceType: "SALE", referenceId: 109, paymentMode: "CARD" },
    { date: new Date("2025-02-09"), partyId: allParties[2]?.id || 1, type: "PAID", amount: 2200.0, paymentReference: "PUR-2006", remark: "Transport materials", referenceType: "PURCHASE", referenceId: 206, paymentMode: "BANK_TRANSFER" },
    { date: new Date("2025-02-11"), partyId: allParties[0]?.id || 1, type: "RECEIVED", amount: 4700.0, paymentReference: "INV-1010", remark: "Sale invoice payment", referenceType: "SALE", referenceId: 110, paymentMode: "UPI" },
    { date: new Date("2025-02-13"), partyId: allParties[1]?.id || 1, type: "PAID", amount: 1350.0, paymentReference: "EXP-3004", remark: "Utility expense", referenceType: "GENERAL", referenceId: null, paymentMode: "CASH" },
  ];

  // 4. Insert payments
  console.log("➡️ Inserting payments...");
  await prisma.payment.createMany({ data: payments, skipDuplicates: true });

  console.log("✅ 20 Payment records inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding payments:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Prisma disconnected.");
  });
