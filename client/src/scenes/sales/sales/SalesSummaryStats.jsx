/**
 * @file SalesSummaryStats.jsx
 * @description Displays key sales summary statistics with visual hierarchy.
 */

import React from "react";
import { FileText, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const SalesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Sales Amount",
      value: formatCurrency(stats?.sumTotalAmount) ?? 0,
      subtitle: "Gross sales value (₹)",
      icon: FileText,
      color: "primary"
    },
    {
      title: "Total Received",
      value: formatCurrency(stats?.sumTotalReceived) ?? 0,
      subtitle: "Cash received from customers (₹)",
      icon: CreditCard,
      color: "info"
    },
    {
      title: "Total GST",
      value: formatCurrency(stats?.sumTotalGst) ?? 0,
      subtitle: "GST collected on sales (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Profit",
      value: formatCurrency(stats?.sumTotalProfit) ?? 0,
      subtitle: "Net profit earned (₹)",
      icon: TrendingUp,
      color: "success" // 💚 highest emphasis
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

export default SalesSummaryStats;
export { SalesSummaryStats };
