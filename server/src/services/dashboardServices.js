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
  /* ─────────────────────────────────────────
     Date Ranges
  ───────────────────────────────────────── */
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  /* ─────────────────────────────────────────
     Single Transaction — All Queries at Once
  ───────────────────────────────────────── */
  const [
    salesToday, // 1
    salesMonth, // 2
    purchaseToday, // 3
    purchaseMonth, // 4
    receivedToday, // 5
    receivedMonth, // 6
    paidToday, // 7
    paidMonth, // 8
    profitToday, // 9
    profitMonth, // 10
    profitLossToday, // 11
    profitLossMonth, // 12
    expenseToday, // 13
    expenseMonth, // 14
    transportProfitToday, // 15
    transportProfitMonth, // 16
    partyBalances // 17 — single query, split in JS
  ] = await prisma.$transaction([
    /* 1-2 ── Sales ── */
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    /* 3-4 ── Purchases ── */
    prisma.purchase.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),
    prisma.purchase.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    /* 5-6 ── Payments Received ── */
    prisma.payment.aggregate({
      where: {
        type: "RECEIVED",
        date: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        type: "RECEIVED",
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    /* 7-8 ── Payments Paid ── */
    prisma.payment.aggregate({
      where: {
        type: "PAID",
        date: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        type: "PAID",
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    /* 9-10 ── Gross Profit from Sales ── */
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalProfit: true }
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalProfit: true }
    }),

    /* 11-12 ── Profit Loss from Sale Returns ── */
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalProfitLoss: true }
    }),
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalProfitLoss: true }
    }),

    /* 13-14 ── Expenses ── */
    prisma.expense.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    }),

    /* 15-16 ── Transport Revenue (for Net Profit) ──
       Transport income = payments received against transport invoices.
       These are already in payment table with referenceType=TRANSPORT, type=RECEIVED.
    ── */
    prisma.transport.aggregate({
      where: {
        date: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),
    prisma.transport.aggregate({
      where: {
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    /* 17 ── Party Balances (Receivables & Payables) ──
       currentBalance < 0 → party owes us    → Receivable
       currentBalance > 0 → we owe the party → Payable
       Always all-time (running total maintained on Party record).
       One groupBy-less aggregate isn't enough here; we need both sums
       so we use a raw grouping via two aggregates in the same call... 
       Actually Prisma can't do conditional SUM, so we do two queries
       but they're both on the tiny `parties` table — very fast.
    ── */
    prisma.party.aggregate({
      where: {
        currentBalance: { not: 0 }
      },
      _sum: { currentBalance: true }
      // We'll split positive/negative in JS after fetching both
    })
  ]);

  // Prisma can't do conditional SUM in one call, so we do the split
  // with two extra lightweight queries (parties table is tiny):
  const [payableSum, receivableSum] = await prisma.$transaction([
    // Parties that owe us money (positive balance)
    prisma.party.aggregate({
      where: {
        currentBalance: { gt: 0 }
      },
      _sum: { currentBalance: true }
    }),
    // Parties we owe money (negative balance)
    prisma.party.aggregate({
      where: {
        currentBalance: { lt: 0 }
      },
      _sum: { currentBalance: true }
    })
  ]);

  /* ─────────────────────────────────────────
     Normalize Decimals → Numbers
  ───────────────────────────────────────── */
  const n = val => Number(val || 0);

  // Sales
  const totalSalesToday = n(salesToday._sum.totalAmount);
  const totalSalesMonth = n(salesMonth._sum.totalAmount);

  // Purchases
  const totalPurchaseToday = n(purchaseToday._sum.totalAmount);
  const totalPurchaseMonth = n(purchaseMonth._sum.totalAmount);

  // Received
  const totalReceivedToday = n(receivedToday._sum.amount);
  const totalReceivedMonth = n(receivedMonth._sum.amount);

  // Paid
  const totalPaidToday = n(paidToday._sum.amount);
  const totalPaidMonth = n(paidMonth._sum.amount);

  // Expenses
  const totalExpenseToday = n(expenseToday._sum.amount);
  const totalExpenseMonth = n(expenseMonth._sum.amount);

  // Transport income
  const transportIncomeToday = n(transportProfitToday._sum.amount);
  const transportIncomeMonth = n(transportProfitMonth._sum.amount);

  // Gross profit from sales
  const grossProfitToday = n(profitToday._sum.totalProfit);
  const grossProfitMonth = n(profitMonth._sum.totalProfit);

  // Profit loss from sale returns
  const profitLossTodayAmt = n(profitLossToday._sum.totalProfitLoss);
  const profitLossMonthAmt = n(profitLossMonth._sum.totalProfitLoss);

  /* ─────────────────────────────────────────
     Net Profit
     = grossProfit (from sales)
     + transportIncome (payments received for transport)
     - profitLoss (from sale returns)
     - expenses
  ───────────────────────────────────────── */
  const netProfitToday =
    (grossProfitToday + transportIncomeToday) - (-profitLossTodayAmt + totalExpenseToday);

  const netProfitMonth =
    (grossProfitMonth + transportIncomeMonth) - (-profitLossMonthAmt + totalExpenseMonth);

  /* ─────────────────────────────────────────
     Receivables & Payables
     Sourced from Party.currentBalance (always all-time running total)
     Positive balance = party owes us   = Receivable
     Negative balance = we owe party    = Payable (store as positive number)
  ───────────────────────────────────────── */
  const totalReceivables = Math.abs(n(receivableSum._sum.currentBalance));
  const totalPayables = n(payableSum._sum.currentBalance); // convert negative to positive

  /* ─────────────────────────────────────────
     Final Response
  ───────────────────────────────────────── */
  return {
    sales: {
      today: totalSalesToday,
      thisMonth: totalSalesMonth
    },
    purchases: {
      today: totalPurchaseToday,
      thisMonth: totalPurchaseMonth
    },
    received: {
      today: totalReceivedToday,
      thisMonth: totalReceivedMonth
    },
    paid: {
      today: totalPaidToday,
      thisMonth: totalPaidMonth
    },
    netProfit: {
      today: netProfitToday,
      thisMonth: netProfitMonth
    },
    receivables: {
      total: totalReceivables // always all-time (no today/month split)
    },
    payables: {
      total: totalPayables // always all-time (no today/month split)
    },
    expenses: {
      today: totalExpenseToday,
      thisMonth: totalExpenseMonth
    }
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
