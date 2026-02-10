/**
 * dashboardServices.js
 * Prisma-based services for Dashboard metrics.
 *
 * Style mirrors expenseServices.js & paymentServices.js:
 * - Explicit logic
 * - Clear sections
 * - Read-optimized queries
 * - UI-ready response
 */

import prisma from "../config/prisma.js";

/* -------------------------------------------------------------------------- */
/*                         Dashboard Summary Metrics                           */
/* -------------------------------------------------------------------------- */
/*
  Includes:
  1. Total Sales (Today / This Month)
  2. Total Purchase (Today / This Month)
  3. Net Profit
  4. Total Payment (Cash Received / Paid)
  5. Outstanding Receivables
  6. Outstanding Payables
*/

async function getDashboardSummary() {
  /* -------------------- Date Ranges -------------------- */

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  /* -------------------- DB Aggregations -------------------- */

  const [
    salesTodayAgg,
    salesMonthAgg,

    purchaseTodayAgg,
    purchaseMonthAgg,

    profitAgg,
    profitLossAgg,

    paymentReceivedAgg,
    paymentPaidAgg,

    receivableAgg,
    payableAgg
  ] = await prisma.$transaction([
    /* -------------------- Sales -------------------- */

    prisma.sale.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),

    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    /* -------------------- Purchases -------------------- */

    prisma.purchase.aggregate({
      where: { date: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),

    prisma.purchase.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),

    /* -------------------- Profit -------------------- */

    prisma.sale.aggregate({
      _sum: { totalProfit: true }
    }),

    prisma.saleReturn.aggregate({
      _sum: { totalProfitLoss: true }
    }),

    /* -------------------- Payments -------------------- */

    prisma.payment.aggregate({
      where: { type: "RECEIVED" },
      _sum: { amount: true }
    }),

    prisma.payment.aggregate({
      where: { type: "PAID" },
      _sum: { amount: true }
    }),

    /* -------------------- Outstanding -------------------- */

    prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
        receivedAmount: true
      }
    }),

    prisma.purchase.aggregate({
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    })
  ]);

  /* -------------------- Normalize Values -------------------- */

  const totalSalesToday = Number(salesTodayAgg._sum.totalAmount || 0);
  const totalSalesMonth = Number(salesMonthAgg._sum.totalAmount || 0);

  const totalPurchaseToday = Number(purchaseTodayAgg._sum.totalAmount || 0);
  const totalPurchaseMonth = Number(purchaseMonthAgg._sum.totalAmount || 0);

  const totalProfit = Number(profitAgg._sum.totalProfit || 0);
  const totalProfitLoss = Number(profitLossAgg._sum.totalProfitLoss || 0);

  const netProfit = totalProfit - totalProfitLoss;

  const cashReceived = Number(paymentReceivedAgg._sum.amount || 0);
  const cashPaid = Number(paymentPaidAgg._sum.amount || 0);

  const totalSaleAmount = Number(receivableAgg._sum.totalAmount || 0);
  const totalSaleReceived = Number(receivableAgg._sum.receivedAmount || 0);

  const totalPurchaseAmount = Number(payableAgg._sum.totalAmount || 0);
  const totalPurchasePaid = Number(payableAgg._sum.paidAmount || 0);

  /* -------------------- Derived Metrics -------------------- */

  const outstandingReceivables = totalSaleAmount - totalSaleReceived;
  const outstandingPayables = totalPurchaseAmount - totalPurchasePaid;

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

    profit: {
      net: netProfit
    },

    cash: {
      received: cashReceived,
      paid: cashPaid
    },

    outstanding: {
      receivables: outstandingReceivables,
      payables: outstandingPayables
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                            Sales Trend (Line Chart)                         */
/* -------------------------------------------------------------------------- */

async function getSalesTrend(days = 7) {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 7 + 1);
  startDate.setHours(0, 0, 0, 0);

  /* -------------------- Group Sales by Date -------------------- */

  const sales = await prisma.sale.groupBy({
    by: ["date"],
    where: {
      date: { gte: startDate }
    },
    _sum: {
      totalAmount: true
    },
    orderBy: {
      date: "asc"
    }
  });

  /* -------------------- Normalize for Chart -------------------- */

  return sales.map(row => ({
    date: row.date,
    amount: Number(row._sum.totalAmount || 0)
  }));
}

/* -------------------------------------------------------------------------- */
/*                              Low Stock Alerts                               */
/* -------------------------------------------------------------------------- */

async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      currentStock: {
        lt: prisma.product.fields.threshold
      }
    },
    select: {
      id: true,
      name: true,
      currentStock: true,
      threshold: true
    },
    orderBy: {
      currentStock: "asc"
    }
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    currentStock: Number(p.currentStock),
    threshold: Number(p.threshold)
  }));
}

/* -------------------------------------------------------------------------- */
/*                          Top Selling Products (Qty)                         */
/* -------------------------------------------------------------------------- */

async function getTopSellingProducts(limit = 5) {
  const items = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: "desc"
      }
    },
    take: 5
  });

  /* -------------------- Fetch Product Names -------------------- */

  const productIds = items.map(i => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  });

  const productMap = new Map(products.map(p => [p.id, p.name]));

  /* -------------------- Final Shape -------------------- */

  return items.map(item => ({
    productId: item.productId,
    productName: productMap.get(item.productId) || "Unknown",
    quantity: Number(item._sum.quantity || 0)
  }));
}

/* -------------------------------------------------------------------------- */
/*                              Recent Payments                                */
/* -------------------------------------------------------------------------- */

async function getRecentPayments(limit = 5) {
  const payments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      date: "desc"
    },
    include: {
      party: {
        select: { name: true }
      }
    }
  });

  return payments.map(p => ({
    id: p.id,
    date: p.date,
    partyName: p.party?.name || "—",
    type: p.type,
    amount: Number(p.amount),
    mode: p.paymentMode
  }));
}

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
};

export default {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
};
