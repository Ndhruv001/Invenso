import prisma from "../../config/prisma.js";
import {generatePdfFromTemplate} from "../pdfServices.js"

/**
 * Get Party Ledger
 */
const getPartyLedger = async (filters = {}) => {
  const { partyId, dateFrom, dateTo} = filters;
  const limit = 10;

  // -----------------------------
  // 1️⃣ Validation
  // -----------------------------
  if (!partyId) throw new Error("Party ID is required");
  if (!dateFrom || !dateTo) throw new Error("From and To date required");

  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);

  if (startDate > endDate) throw new Error("Invalid date range");

  // -----------------------------
  // 2️⃣ Get Party
  // -----------------------------
  const party = await prisma.party.findUnique({
    where: { id: Number(partyId) }
  });

  if (!party) throw new Error("Party not found");

  // -----------------------------
  // 3️⃣ Initialize Ledger
  // -----------------------------
  const ledger = [];

  // 🔥 Use stored opening balance directly
  const openingBalance = Number(party.openingBalance || 0);

  ledger.push({
    date: startDate,
    particulars: "Opening Balance",
    voucherType: "Opening",
    voucherNumber: "-",
    debit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
    credit: openingBalance > 0 ? openingBalance : 0
  });

  // -----------------------------
  // 4️⃣ Current Period Data
  // -----------------------------
  const [sales, purchases, payments, saleReturns, purchaseReturns] =
    await Promise.all([
      prisma.sale.findMany({
        where: {
          partyId: Number(partyId),
          date: { gte: startDate, lte: endDate }
        }
      }),
      prisma.purchase.findMany({
        where: {
          partyId: Number(partyId),
          date: { gte: startDate, lte: endDate }
        }
      }),
      prisma.payment.findMany({
        where: {
          partyId: Number(partyId),
          date: { gte: startDate, lte: endDate }
        }
      }),
      prisma.saleReturn.findMany({
        where: {
          partyId: Number(partyId),
          date: { gte: startDate, lte: endDate }
        }
      }),
      prisma.purchaseReturn.findMany({
        where: {
          partyId: Number(partyId),
          date: { gte: startDate, lte: endDate }
        }
      })
    ]);

  // -----------------------------
  // 5️⃣ Convert to Ledger Format
  // -----------------------------
  sales.forEach(s => {
    ledger.push({
      date: s.date,
      particulars: "Sale",
      voucherType: "Sale",
      voucherNumber: s.id,
      debit: Number(s.totalAmount),
      credit: 0
    });
  });

  purchases.forEach(p => {
    ledger.push({
      date: p.date,
      particulars: "Purchase",
      voucherType: "Purchase",
      voucherNumber: p.id,
      debit: 0,
      credit: Number(p.totalAmount)
    });
  });

  purchaseReturns.forEach(p => {
    ledger.push({
      date: p.date,
      particulars: "Purchase Return",
      voucherType: "Purchase Return",
      voucherNumber: p.id,
      debit: Number(p.totalAmount),
      credit: 0
    });
  });

  saleReturns.forEach(p => {
    ledger.push({
      date: p.date,
      particulars: "Sale Return",
      voucherType: "Sale Return",
      voucherNumber: p.id,
      debit: 0,
      credit: Number(p.totalAmount)
    });
  });

  payments.forEach(pay => {
    if (pay.type === "RECEIVED") {
      ledger.push({
        date: pay.date,
        particulars: "Payment Received",
        voucherType: "Receipt",
        voucherNumber: pay.id,
        debit: 0,
        credit: Number(pay.amount)
      });
    } else {
      ledger.push({
        date: pay.date,
        particulars: "Payment Paid",
        voucherType: "Payment",
        voucherNumber: pay.id,
        debit: Number(pay.amount),
        credit: 0
      });
    }
  });

  // -----------------------------
  // 6️⃣ Sort by Date
  // -----------------------------
  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  // -----------------------------
  // 7️⃣ Running Balance
  // -----------------------------
  let runningBalance = 0;

  const finalLedger = ledger.map(row => {
    runningBalance += row.credit - row.debit;

    return {
      ...row,
      balance: runningBalance
    };
  });

  // -----------------------------
  // 8️⃣ Stats
  // -----------------------------
  const totalDebit = finalLedger.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = finalLedger.reduce((sum, r) => sum + r.credit, 0);

  const stats = {
    totalDebit,
    totalCredit,
    closingBalance: runningBalance,
    balanceType: runningBalance < 0 ? "Receivable" : runningBalance > 0 ? "Payable" : "Settled"
  };

  // -----------------------------
  // 9️⃣ Pagination
  // -----------------------------
  const totalRows = finalLedger.length;
  const totalPages = Math.ceil(totalRows / limit);

  return {
    data: finalLedger,
    pagination: {
      totalRows,
      totalPages,
    },
    stats
  };
};

async function getPartyLedgerPdf(filters = {}) {
  const { partyId, dateFrom, dateTo } = filters;

  if (!partyId) throw new Error("Party ID is required");

  // 1️⃣ Get ledger data from service
  const ledgerResult = await getPartyLedger(filters);

  const { data: ledger, stats } = ledgerResult;

  // 2️⃣ Get party details
  const party = await prisma.party.findUnique({
    where: { id: Number(partyId) }
  });

  if (!party) throw new Error("Party not found");

  // 3️⃣ Opening row
  const openingRow = ledger[0];

  const openingDebit = openingRow.debit;
  const openingCredit = openingRow.credit;
  const openingBalance = openingRow.balance;

  // 4️⃣ Build Ledger Rows HTML (skip opening row)
  const ledgerRows = ledger
    .slice(1)
    .map(row => {
      const balanceText =
        row.balance < 0
          ? `${Math.abs(row.balance).toFixed(2)} Dr`
          : `${row.balance.toFixed(2)} Cr`;

      return `
      <tr>
        <td class="text-center">${new Date(row.date).toLocaleDateString("en-IN")}</td>
        <td>${row.particulars}</td>
        <td class="text-center">${row.voucherType}</td>
        <td class="text-center">${row.voucherNumber}</td>
        <td class="text-right">${row.debit ? row.debit.toFixed(2) : ""}</td>
        <td class="text-right">${row.credit ? row.credit.toFixed(2) : ""}</td>
        <td class="text-right">${balanceText}</td>
      </tr>
      `;
    })
    .join("");

  // 5️⃣ Closing balance
  const closingBalance =
    stats.closingBalance < 0
      ? `${Math.abs(stats.closingBalance).toFixed(2)} Dr`
      : `${stats.closingBalance.toFixed(2)} Cr`;

  // 6️⃣ Build template data
  const data = {

    partyName: party.name,
    partyPhone: party.phone ?? "-",

    fromDate: new Date(dateFrom).toLocaleDateString("en-IN"),
    toDate: new Date(dateTo).toLocaleDateString("en-IN"),

    openingDebit: openingDebit ? openingDebit.toFixed(2) : "",
    openingCredit: openingCredit ? openingCredit.toFixed(2) : "",
    openingBalance:
      openingBalance < 0
        ? `${Math.abs(openingBalance).toFixed(2)} Dr`
        : `${openingBalance.toFixed(2)} Cr`,

    ledgerRows,

    totalDebit: stats.totalDebit.toFixed(2),
    totalCredit: stats.totalCredit.toFixed(2),

    closingBalance
  };

  // 7️⃣ Generate PDF
  const pdfBuffer = await generatePdfFromTemplate(
    "partyLedgerTemplate.html",
    data
  );

  return pdfBuffer;
}

export default {getPartyLedger, getPartyLedgerPdf};
export { getPartyLedger, getPartyLedgerPdf };