// /**
//  * DashboardSummaryStats.jsx
//  * Displays key summary statistics for the dashboard in a card format.
//  * Each card shows a specific metric with an icon, value, and description.
//  */

import React from "react";
import { ArrowUpRight, ArrowDownRight, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const DashboardSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Sales",
      value: formatCurrency(stats?.sales?.thisMonth ?? 0),
      subtitle: "Total revenue from sales",
      icon: DollarSign,
      color: "default"
    },
    {
      title: "Total Purchases",
      value: formatCurrency(stats?.purchases?.today ?? 0),
      subtitle: "Total amount spent on purchases",
      icon: DollarSign,
      color: "default"
    },
    {
      title: "Total Profit",
      value: formatCurrency(stats?.profit?.net ?? 0),
      subtitle: "Total profit/loss from sales and other transactions",
      icon: TrendingUp,
      color: "success"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.cash?.paid ?? 0),
      subtitle: "Total expenses incurred",
      icon: CreditCard,
      color: "danger"
    },
    {
      title: "Total Receivables",
      value: formatCurrency(stats?.outstanding?.receivables ?? 0),
      subtitle: "Total amount to be received",
      icon: ArrowUpRight,
      color: "success"
    },
    {
      title: "Total Payables",
      value: formatCurrency(stats?.outstanding?.payables ?? 0),
      subtitle: "Total amount to be paid",
      icon: ArrowDownRight,
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
