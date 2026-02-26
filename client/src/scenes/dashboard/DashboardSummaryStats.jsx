/**
 * DashboardSummaryStats.jsx
 * Displays key summary statistics for the dashboard in a card format.
 * Each card shows a specific metric with an icon, primary value (today), and secondary value (this month).
 */

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const DashboardSummaryStats = ({ stats }) => {
  console.log("🚀 ~ DashboardSummaryStats ~ stats:", stats);
  const items = [
    {
      title: "Total Sales",
      value: formatCurrency(stats?.sales?.today ?? 0),
      secondaryValue: formatCurrency(stats?.sales?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Revenue from sales",
      icon: DollarSign,
      color: "purple"
    },
    {
      title: "Total Purchases",
      value: formatCurrency(stats?.purchases?.today ?? 0),
      secondaryValue: formatCurrency(stats?.purchases?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Amount spent on purchases",
      icon: ShoppingCart,
      color: "blue"
    },
    {
      title: "Net Profit",
      value: formatCurrency(stats?.netProfit?.today ?? 0),
      secondaryValue: formatCurrency(stats?.netProfit?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Profit after expenses",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.expenses?.today ?? 0),
      secondaryValue: formatCurrency(stats?.expenses?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Operating expenses",
      icon: Receipt,
      color: "orange"
    },
    {
      title: "Received",
      value: formatCurrency(stats?.received?.today ?? 0),
      secondaryValue: formatCurrency(stats?.received?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Payments received",
      icon: ArrowDownRight,
      color: "info"
    },
    {
      title: "Paid",
      value: formatCurrency(stats?.paid?.today ?? 0),
      secondaryValue: formatCurrency(stats?.paid?.thisMonth ?? 0),
      secondaryLabel: "This Month",
      subtitle: "Payments made",
      icon: ArrowUpRight,
      color: "red"
    },
    {
      title: "Total Receivables",
      value: formatCurrency(stats?.receivables?.total ?? 0),
      subtitle: "Amount to be received",
      icon: Wallet,
      color: "success"
    },
    {
      title: "Total Payables",
      value: formatCurrency(stats?.payables?.total ?? 0),
      subtitle: "Amount to be paid",
      icon: CreditCard,
      color: "danger"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default DashboardSummaryStats;
export { DashboardSummaryStats };
