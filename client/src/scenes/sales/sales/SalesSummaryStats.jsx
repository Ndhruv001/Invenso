/**
 * @file SalesSummaryStats.jsx
 * @description Displays key sales summary statistics with visual hierarchy.
 */

import React from "react";
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const SalesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Net Sales",
      value: formatCurrency(stats?.netSales ?? 0),
      subtitle: "After returns deduction (₹)",
      icon: TrendingUp,
      color: "success"
    },
    {
      title: "Total Received",
      value: formatCurrency(stats?.totalReceived ?? 0),
      subtitle: "Payments received (₹)",
      icon: CreditCard,
      color: "warning"
    },
    {
      title: "Outstanding Receivable",
      value: formatCurrency(stats?.outstandingReceivable ?? 0),
      subtitle: "Pending customer payments (₹)",
      icon: Wallet,
      color: "danger"
    },
    {
      title: "Total Profit",
      value: formatCurrency(stats?.totalProfit ?? 0),
      subtitle: "Net profit after returns (₹)",
      icon: TrendingUp,
      color: "success"
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

export default SalesSummaryStats;
export { SalesSummaryStats };