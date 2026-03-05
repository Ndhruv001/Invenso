/**
 * dashboardServices.js
 * Prisma-based services for Dashboard metrics.
 *
 * Principles:
 * - Simple, readable code over clever solutions
 * - Explicit logic with clear sections
 * - Optimized database queries
 * - UI-ready responses
 */

import prisma from "../config/prisma.js";

/* -------------------------------------------------------------------------- */
/*                         Dashboard Summary Metrics                          */
/* -------------------------------------------------------------------------- */
/*
  Metrics:
  1. Total Sales (Today / This Month)  -- sales table only
  2. Total Purchase (Today / This Month) -- purchase table only
  3. Total Received (Today / This Month) -- payment table only filter by recieved
  4. Total Paid (Today / This Month) -- payment table only filter by paid
  5. Net Profit (Today / This Month) -- plus total profit of all sales + transport payment( filter payment table by transport ) - all expenses +  netLoss ( from sale return )
  6. Total Receivables (Today / This month) -- sum of totals pending amount : sales, purchase returns, transports, parties opening balance, 
  7. Total Payables (Today / This month) -- sum of totals pending amount : purchase, sale return, parties opening balance
  8. Total Expense (Today / This month) -- expense table only
*/

async function getDashboardSummary() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Helper to ensure we always have a number
  const n = val => Number(val || 0);

  const results = await prisma.$transaction([
    // [0, 1] SALES
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true, totalProfit: true }
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true, totalProfit: true }
    }),

    // [2, 3] SALE RETURNS
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true, totalProfitLoss: true }
    }),
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true, totalProfitLoss: true }
    }),

    // [4, 5] PURCHASES
    prisma.purchase.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),
    prisma.purchase.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    // [6, 7] PURCHASE RETURNS
    prisma.purchaseReturn.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),
    prisma.purchaseReturn.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    // [8, 9] PAYMENTS RECEIVED
    prisma.payment.aggregate({
      where: { type: "RECEIVED", date: { gte: startOfToday } },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { type: "RECEIVED", date: { gte: startOfMonth } },
      _sum: { amount: true }
    }),

    // [10, 11] PAYMENTS PAID
    prisma.payment.aggregate({
      where: { type: "PAID", date: { gte: startOfToday } },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { type: "PAID", date: { gte: startOfMonth } },
      _sum: { amount: true }
    }),

    // [12, 13] EXPENSES
    prisma.expense.aggregate({ where: { date: { gte: startOfToday } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),

    // [14, 15] TRANSPORT INCOME
    prisma.transport.aggregate({ where: { date: { gte: startOfToday } }, _sum: { amount: true } }),
    prisma.transport.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),

    // [16] RECEIVABLES
    prisma.party.aggregate({
      where: { currentBalance: { lt: 0 } },
      _sum: { currentBalance: true }
    }),

    // [17] PAYABLES
    prisma.party.aggregate({ where: { currentBalance: { gt: 0 } }, _sum: { currentBalance: true } })
  ]);

  // Map results for readability
  const [
    salesT,
    salesM,
    sReturnT,
    sReturnM,
    purT,
    purM,
    pReturnT,
    pReturnM,
    recT,
    recM,
    paidT,
    paidM,
    expT,
    expM,
    transT,
    transM,
    receivableAgg,
    payableAgg
  ] = results;

  // ─────────────────────────────
  // CALCULATION LOGIC
  // ─────────────────────────────

  // Net Revenue = Gross Sales - Returns
  const netSalesToday = n(salesT._sum.totalAmount) - n(sReturnT._sum.totalAmount);
  const netSalesMonth = n(salesM._sum.totalAmount) - n(sReturnM._sum.totalAmount);

  // Net Purchase = Total Purchase - Returns
  const netPurToday = n(purT._sum.totalAmount) - n(pReturnT._sum.totalAmount);
  const netPurMonth = n(purM._sum.totalAmount) - n(pReturnM._sum.totalAmount);

  // Cash Flow = Cash In - Cash Out
  const netCashToday = n(recT._sum.amount) - n(paidT._sum.amount);
  const netCashMonth = n(recM._sum.amount) - n(paidM._sum.amount);

  /**
   * NET PROFIT LOGIC:
   * (Gross Profit from Sales)
   * - (Profit lost from Returns)
   * + (Other Income like Transport)
   * - (Operating Expenses)
   */
  const netProfitToday =
    n(salesT._sum.totalProfit) -
    n(-sReturnT._sum.totalProfitLoss) +
    n(transT._sum.amount) -
    n(expT._sum.amount);
  const netProfitMonth =
    n(salesM._sum.totalProfit) -
    n(-sReturnM._sum.totalProfitLoss) +
    n(transM._sum.amount) -
    n(expM._sum.amount);

  // Receivables/Payables (Absolute values for clean UI)
  const totalReceivables = Math.abs(n(receivableAgg._sum.currentBalance));
  const totalPayables = Math.abs(n(payableAgg._sum.currentBalance));

  return {
    revenue: { today: netSalesToday, thisMonth: netSalesMonth },
    purchases: { today: netPurToday, thisMonth: netPurMonth },
    cashFlow: { today: netCashToday, thisMonth: netCashMonth },
    netProfit: { today: netProfitToday, thisMonth: netProfitMonth },
    receivables: { total: totalReceivables },
    payables: { total: totalPayables }
  };
}

/* -------------------------------------------------------------------------- */
/*                            Sales Trend (Line Chart)                        */
/* -------------------------------------------------------------------------- */
/*
  Returns daily sales data for specified period
  - date: ISO date string
  - salesAmount: total sales for that day
  - profit: net profit for that day (sales profit - sale returns loss)
*/

async function getSalesTrend(period = "week") {
  /* -------------------- Calculate Date Range -------------------- */

  const now = new Date();
  const startDate = new Date();

  // Determine how many days back based on period
  const daysBack = period === "week" ? 7 : 30;

  startDate.setDate(now.getDate() - daysBack + 1);
  startDate.setHours(0, 0, 0, 0);

  /* -------------------- Group Sales by Date -------------------- */

  const salesByDate = await prisma.sale.groupBy({
    by: ["date"],
    where: {
      date: { gte: startDate }
    },
    _sum: {
      totalAmount: true,
      totalProfit: true
    },
    orderBy: {
      date: "asc"
    }
  });

  /* -------------------- Group Sale Returns by Date -------------------- */

  const returnsbyDate = await prisma.saleReturn.groupBy({
    by: ["date"],
    where: {
      date: { gte: startDate }
    },
    _sum: {
      totalProfitLoss: true
    },
    orderBy: {
      date: "asc"
    }
  });

  /* -------------------- Merge Sales and Returns Data -------------------- */

  // Create a map of returns by date for quick lookup
  const returnsMap = new Map();
  returnsbyDate.forEach(ret => {
    const dateKey = ret.date.toISOString().split("T")[0];
    returnsMap.set(dateKey, Number(ret._sum.totalProfitLoss || 0));
  });

  /* -------------------- Build Final Dataset -------------------- */

  const trendData = salesByDate.map(sale => {
    const dateKey = sale.date.toISOString().split("T")[0];
    const salesProfit = Number(sale._sum.totalProfit || 0);
    const returnLoss = returnsMap.get(dateKey) || 0;

    return {
      date: sale.date,
      salesAmount: Number(sale._sum.totalAmount || 0),
      profit: salesProfit - returnLoss
    };
  });

  return trendData;
}

/* -------------------------------------------------------------------------- */
/*                          Top Selling Products                              */
/* -------------------------------------------------------------------------- */
/*
  Returns top selling products by quantity sold
  Columns: productName, quantity, unit, totalAmount
*/

async function getTopSellingProducts(limit = 5) {
  /* -------------------- Group by Product and Sum -------------------- */

  const topProducts = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
      amount: true
    },
    orderBy: {
      _sum: {
        quantity: "desc"
      }
    },
    take: limit
  });

  /* -------------------- Get Product Details -------------------- */

  const productIds = topProducts.map(item => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    },
    select: {
      id: true,
      name: true,
      unit: true
    }
  });

  /* -------------------- Create Product Map for Quick Lookup -------------------- */

  const productMap = new Map(products.map(p => [p.id, { name: p.name, unit: p.unit }]));

  /* -------------------- Build Final Response -------------------- */

  return topProducts.map(item => {
    const product = productMap.get(item.productId);

    return {
      productId: item.productId,
      productName: product?.name || "Unknown Product",
      quantity: Number(item._sum.quantity || 0),
      unit: product?.unit || "PCS",
      totalAmount: Number(item._sum.amount || 0)
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                              Recent Payments                               */
/* -------------------------------------------------------------------------- */
/*
  Returns recent payment transactions
  Columns: id, date, partyName, type, amount, paymentMode
*/

async function getRecentPayments(limit = 5) {
  const payments = await prisma.payment.findMany({
    take: limit,
    orderBy: {
      date: "desc"
    },
    include: {
      party: {
        select: {
          name: true
        }
      }
    }
  });

  /* -------------------- Format Response -------------------- */

  return payments.map(payment => ({
    id: payment.id,
    date: payment.date,
    partyName: payment.party?.name || "—",
    type: payment.type,
    amount: Number(payment.amount),
    paymentMode: payment.paymentMode
  }));
}

/* -------------------------------------------------------------------------- */
/*                              Low Stock Alerts                              */
/* -------------------------------------------------------------------------- */
/*
  Returns products where current stock is below threshold
  Columns: id, name, currentStock, threshold, unit, status
*/

async function getLowStockProducts() {
  /* -------------------- Raw SQL for Stock Comparison -------------------- */

  // Prisma doesn't support column-to-column comparison in where clause
  // So we fetch all active products and filter in application

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      currentStock: true,
      threshold: true,
      unit: true
    },
    orderBy: {
      currentStock: "asc"
    }
  });

  /* -------------------- Filter Low Stock Products -------------------- */

  const lowStockProducts = products.filter(
    product => Number(product.currentStock) < Number(product.threshold)
  );

  /* -------------------- Format Response with Status -------------------- */

  return lowStockProducts.map(product => {
    const current = Number(product.currentStock);
    const threshold = Number(product.threshold);

    // Calculate stock status
    let status = "Low";
    if (current === 0) {
      status = "Out of Stock";
    } else if (current < threshold * 0.5) {
      status = "Critical";
    }

    return {
      id: product.id,
      name: product.name,
      currentStock: current,
      threshold: threshold,
      unit: product.unit,
      status: status
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export {
  getDashboardSummary,
  getSalesTrend,
  getTopSellingProducts,
  getRecentPayments,
  getLowStockProducts
};

export default {
  getDashboardSummary,
  getSalesTrend,
  getTopSellingProducts,
  getRecentPayments,
  getLowStockProducts
};
