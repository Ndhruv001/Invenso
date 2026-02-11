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
  1. Total Sales (Today / This Month)
  2. Total Purchase (Today / This Month)
  3. Total Received (Today / This Month)
  4. Total Paid (Today / This Month)
  5. Net Profit (Today / This Month)
  6. Total Receivables (Today / This Month)
  7. Total Payables (Today / This Month)
  8. Total Expense (Today / This Month)
*/

async function getDashboardSummary() {
  /* -------------------- Date Ranges -------------------- */

  const now = new Date();

  // Start of today: 00:00:00
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Start of this month: 1st day at 00:00:00
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  /* -------------------- Database Aggregations -------------------- */

  const [
    // Sales
    salesToday,
    salesMonth,
    salesAllTime,

    // Purchases
    purchaseToday,
    purchaseMonth,
    purchaseAllTime,

    // Payments Received
    receivedToday,
    receivedMonth,

    // Payments Paid
    paidToday,
    paidMonth,

    // Profit from Sales
    profitToday,
    profitMonth,
    profitAllTime,

    // Profit Loss from Sale Returns
    profitLossToday,
    profitLossMonth,
    profitLossAllTime,

    // Expenses
    expenseToday,
    expenseMonth,

    // Outstanding calculations need all-time data
    receivablesAllTime,
    payablesAllTime
  ] = await prisma.$transaction([
    /* -------------------- Sales Aggregations -------------------- */

    // Today
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),

    // This Month
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    // All Time (for receivables calculation)
    prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
        receivedAmount: true
      }
    }),

    /* -------------------- Purchase Aggregations -------------------- */

    // Today
    prisma.purchase.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),

    // This Month
    prisma.purchase.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    // All Time (for payables calculation)
    prisma.purchase.aggregate({
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    }),

    /* -------------------- Payments Received -------------------- */

    // Today
    prisma.payment.aggregate({
      where: {
        type: "RECEIVED",
        date: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),

    // This Month
    prisma.payment.aggregate({
      where: {
        type: "RECEIVED",
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    /* -------------------- Payments Paid -------------------- */

    // Today
    prisma.payment.aggregate({
      where: {
        type: "PAID",
        date: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),

    // This Month
    prisma.payment.aggregate({
      where: {
        type: "PAID",
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    /* -------------------- Profit from Sales -------------------- */

    // Today
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalProfit: true }
    }),

    // This Month
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalProfit: true }
    }),

    // All Time
    prisma.sale.aggregate({
      _sum: { totalProfit: true }
    }),

    /* -------------------- Profit Loss from Sale Returns -------------------- */

    // Today
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalProfitLoss: true }
    }),

    // This Month
    prisma.saleReturn.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalProfitLoss: true }
    }),

    // All Time
    prisma.saleReturn.aggregate({
      _sum: { totalProfitLoss: true }
    }),

    /* -------------------- Expenses -------------------- */

    // Today
    prisma.expense.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { amount: true }
    }),

    // This Month
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    }),

    /* -------------------- Receivables (Today & This Month) -------------------- */

    // Sales with outstanding from today
    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: {
        totalAmount: true,
        receivedAmount: true
      }
    }),

    // Sales with outstanding from this month
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: {
        totalAmount: true,
        receivedAmount: true
      }
    })
  ]);

  // Continue transaction for Payables (Today & This Month)
  const [payablesToday, payablesMonth] = await prisma.$transaction([
    // Purchases with outstanding from today
    prisma.purchase.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    }),

    // Purchases with outstanding from this month
    prisma.purchase.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    })
  ]);

  /* -------------------- Normalize to Numbers -------------------- */

  // Sales
  const totalSalesToday = Number(salesToday._sum.totalAmount || 0);
  const totalSalesMonth = Number(salesMonth._sum.totalAmount || 0);

  // Purchases
  const totalPurchaseToday = Number(purchaseToday._sum.totalAmount || 0);
  const totalPurchaseMonth = Number(purchaseMonth._sum.totalAmount || 0);

  // Payments Received
  const totalReceivedToday = Number(receivedToday._sum.amount || 0);
  const totalReceivedMonth = Number(receivedMonth._sum.amount || 0);

  // Payments Paid
  const totalPaidToday = Number(paidToday._sum.amount || 0);
  const totalPaidMonth = Number(paidMonth._sum.amount || 0);

  // Profit
  const grossProfitToday = Number(profitToday._sum.totalProfit || 0);
  const grossProfitMonth = Number(profitMonth._sum.totalProfit || 0);

  // Profit Loss
  const profitLossTodayAmount = Number(profitLossToday._sum.totalProfitLoss || 0);
  const profitLossMonthAmount = Number(profitLossMonth._sum.totalProfitLoss || 0);

  // Expenses
  const totalExpenseToday = Number(expenseToday._sum.amount || 0);
  const totalExpenseMonth = Number(expenseMonth._sum.amount || 0);

  // Net Profit Calculation (Gross Profit - Profit Loss - Expenses)
  const netProfitToday = grossProfitToday - profitLossTodayAmount - totalExpenseToday;
  const netProfitMonth = grossProfitMonth - profitLossMonthAmount - totalExpenseMonth;

  // Receivables (Sales Amount - Received Amount)
  const totalReceivablesToday =
    Number(receivablesAllTime._sum.totalAmount || 0) -
    Number(receivablesAllTime._sum.receivedAmount || 0);

  const totalReceivablesMonth =
    Number(payablesMonth._sum.totalAmount || 0) - Number(payablesMonth._sum.receivedAmount || 0);

  // Payables (Purchase Amount - Paid Amount)
  const totalPayablesToday =
    Number(payablesToday._sum.totalAmount || 0) - Number(payablesToday._sum.paidAmount || 0);

  const totalPayablesMonth =
    Number(payablesMonth._sum.totalAmount || 0) - Number(payablesMonth._sum.paidAmount || 0);

  // All-time outstanding
  const totalReceivablesAllTime =
    Number(salesAllTime._sum.totalAmount || 0) - Number(salesAllTime._sum.receivedAmount || 0);

  const totalPayablesAllTime =
    Number(purchaseAllTime._sum.totalAmount || 0) - Number(purchaseAllTime._sum.paidAmount || 0);

  /* -------------------- Final Response -------------------- */

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
      today: totalReceivablesToday,
      thisMonth: totalReceivablesMonth,
      allTime: totalReceivablesAllTime
    },

    payables: {
      today: totalPayablesToday,
      thisMonth: totalPayablesMonth,
      allTime: totalPayablesAllTime
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
    where: {
      isActive: true
    },
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
