/**
 * @file SalesSummaryStats.jsx
 * @description Displays key sales summary statistics with visual hierarchy.
 */

import React from "react";
import { FileText, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/common/StatCard";

const SalesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Sales Amount",
      value: stats?.sumTotalAmount?.toLocaleString() ?? 0,
      subtitle: "Gross sales value (₹)",
      icon: FileText,
      color: "primary"
    },
    {
      title: "Total Received",
      value: stats?.sumTotalReceived?.toLocaleString() ?? 0,
      subtitle: "Cash received from customers (₹)",
      icon: CreditCard,
      color: "info"
    },
    {
      title: "Total GST",
      value: stats?.sumTotalGst?.toLocaleString() ?? 0,
      subtitle: "GST collected on sales (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Profit",
      value: stats?.sumTotalProfit?.toLocaleString() ?? 0,
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
