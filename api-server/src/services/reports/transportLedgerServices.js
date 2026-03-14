import prisma from "../../config/prisma.js";
import axios from "axios";

const getTransportLedger = async (filters = {}) => {
  const { partyId, dateFrom, dateTo } = filters;
  const limit = 10;

  if (!partyId) throw new Error("Party ID is required");
  if (!dateFrom || !dateTo) throw new Error("From and To date required");

  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);

  if (startDate > endDate) throw new Error("Invalid date range");

  // -----------------------------
  // 1️⃣ Get Party
  // -----------------------------
  const party = await prisma.party.findUnique({
    where: { id: Number(partyId) }
  });

  if (!party) throw new Error("Party not found");

  // -----------------------------
  // 2️⃣ Fetch Data
  // -----------------------------
  const [transports, payments] = await Promise.all([
    prisma.transport.findMany({
      where: {
        partyId: Number(partyId),
        date: { gte: startDate, lte: endDate }
      }
    }),

    prisma.payment.findMany({
      where: {
        partyId: Number(partyId),
        referenceType: "TRANSPORT",
        date: { gte: startDate, lte: endDate }
      }
    })
  ]);

  // -----------------------------
  // 3️⃣ Ledger Format
  // -----------------------------
  const ledger = [];

  transports.forEach(t => {
    ledger.push({
      date: t.date,
      from: t.fromLocation,
      to: t.toLocation,
      amount: Number(t.amount),
      voucherType: "Transport",
      voucherNumber: `TR-${t.id}`,
      type: "TRANSPORT"
    });
  });

  // -----------------------------
  // 4️⃣ Sort Ledger
  // -----------------------------
  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  // -----------------------------
  // 5️⃣ Stats
  // -----------------------------
  const totalTransport = transports.reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const outstanding = totalTransport - totalPayment;

  const stats = {
    totalTransport,
    totalPayment,
    outstanding
  };

  const totalRows = ledger.length;
  const totalPages = Math.ceil(totalRows / limit);

  return {
    data: ledger,
    stats,
    pagination: {
      totalRows,
      totalPages
    }
  };
};

async function getTransportLedgerPdf(filters = {}) {
  const { partyId, dateFrom, dateTo } = filters;

  if (!partyId) throw new Error("Party ID is required");

  // 1️⃣ Get ledger
  const ledgerResult = await getTransportLedger(filters);

  const { data: ledger, stats } = ledgerResult;

  // 2️⃣ Get party
  const party = await prisma.party.findUnique({
    where: { id: Number(partyId) }
  });

  if (!party) throw new Error("Party not found");

  // 3️⃣ Build rows
  const ledgerRows = ledger
    .map(row => {
      const amountText =
        row.type === "PAYMENT" ? `-${row.amount.toFixed(2)}` : row.amount.toFixed(2);

      return `
      <tr>
      <td class="text-center">${row.voucherType}</td>
      <td class="text-center">${row.voucherNumber}</td>
        <td class="text-center">${new Date(row.date).toLocaleDateString("en-IN")}</td>
        <td>${row.from}</td>
        <td>${row.to}</td>
        <td class="text-right">${amountText}</td>
      </tr>
      `;
    })
    .join("");

  // 4️⃣ Template data
  const data = {
    partyName: party.name,
    partyPhone: party.phone ?? "-",

    fromDate: new Date(dateFrom).toLocaleDateString("en-IN"),
    toDate: new Date(dateTo).toLocaleDateString("en-IN"),

    ledgerRows,

    totalTransport: stats.totalTransport.toFixed(2),
    totalPayment: stats.totalPayment.toFixed(2),
    outstanding: stats.outstanding.toFixed(2)
  };

  // 5️⃣ Generate PDF

  const response = await axios.post(
    process.env.PDF_SERVICE_URL + "/pdf/generate-pdf",
    {
      templateName: "transportLedgerTemplate.html",
      data
    },
    { responseType: "arraybuffer" }
  );

  const pdfBuffer = response.data;

  return pdfBuffer;
}

export default { getTransportLedger, getTransportLedgerPdf };
export { getTransportLedger, getTransportLedgerPdf };
