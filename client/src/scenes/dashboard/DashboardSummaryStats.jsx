/**
 * DashboardSummaryStats.jsx
 * Displays ERP-correct net business summary statistics.
 */

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowLeftRight
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const DashboardSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Net Revenue",
      value: formatCurrency(stats?.revenue?.today || 0),
      secondaryValue: formatCurrency(stats?.revenue?.thisMonth || 0),
      secondaryLabel: "This Month",
      subtitle: "Sales after returns",
      icon: DollarSign,
      color: "purple"
    },
    {
      title: "Net Purchases",
      value: formatCurrency(stats?.purchases?.today || 0),
      secondaryValue: formatCurrency(stats?.purchases?.thisMonth || 0),
      secondaryLabel: "This Month",
      subtitle: "Purchases after returns",
      icon: ShoppingCart,
      color: "blue"
    },
    {
      title: "Net Cash Flow",
      value: formatCurrency(stats?.cashFlow?.today || 0),
      secondaryValue: formatCurrency(stats?.cashFlow?.thisMonth || 0),
      secondaryLabel: "This Month",
      subtitle: "Received minus paid",
      icon: ArrowLeftRight,
      color: "info"
    },
    {
      title: "Net Profit",
      value: formatCurrency(stats?.netProfit?.today || 0),
      secondaryValue: formatCurrency(stats?.netProfit?.thisMonth || 0),
      secondaryLabel: "This Month",
      subtitle: "After returns & expenses",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Total Receivables",
      value: formatCurrency(stats?.receivables?.total || 0),
      subtitle: "Customers owe us",
      icon: Wallet,
      color: "success"
    },
    {
      title: "Total Payables",
      value: formatCurrency(stats?.payables?.total || 0),
      subtitle: "We owe suppliers",
      icon: CreditCard,
      color: "danger"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default DashboardSummaryStats;
export { DashboardSummaryStats };
