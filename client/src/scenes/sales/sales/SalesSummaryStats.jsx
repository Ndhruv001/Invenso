/**
 * @file SalesSummaryStats.jsx
 * @description Displays responsive stat cards for sales summary using API stats.
 */

import React from "react";
import { Users, CreditCard, DollarSign, FileText } from "lucide-react";
import StatCard from "@/components/common/StatCard";

/**
 * @typedef {Object} SalesSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalParties
 * @property {number} stats.sumTotalAmount
 * @property {number} stats.sumTotalGst
 * @property {number} stats.sumTotalReceived
 */

/**
 * SalesSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {SalesSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const SalesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalParties ?? 0,
      subtitle: "Customers and clients",
      icon: Users,
      color: "success"
    },
    {
      title: "Total Sales Amount",
      value: stats?.sumTotalAmount?.toLocaleString() ?? 0,
      subtitle: "Overall sales value (₹)",
      icon: FileText,
      color: "primary"
    },
    {
      title: "Total GST",
      value: stats?.sumTotalGst?.toLocaleString() ?? 0,
      subtitle: "Total GST collected (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Received Amount",
      value: stats?.sumTotalReceived?.toLocaleString() ?? 0,
      subtitle: "Total amount received (₹)",
      icon: CreditCard,
      color: "info"
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
