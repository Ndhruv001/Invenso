/**
 * @file SaleReturnsSummaryStats.jsx
 * @description Displays responsive stat cards for sale returns summary using API stats.
 */

import React from "react";
import { Users, CreditCard, DollarSign, FileText } from "lucide-react";
import StatCard from "@/components/common/StatCard";

/**
 * @typedef {Object} SaleReturnsSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalParties
 * @property {number} stats.sumTotalAmount
 * @property {number} stats.sumTotalGst
 * @property {number} stats.sumTotalPaid
 */

/**
 * SaleReturnsSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {SaleReturnsSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const SaleReturnsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalParties ?? 0,
      subtitle: "Customers involved",
      icon: Users,
      color: "success"
    },
    {
      title: "Total Return Amount",
      value: stats?.sumTotalAmount?.toLocaleString() ?? 0,
      subtitle: "Overall sale return value (₹)",
      icon: FileText,
      color: "primary"
    },
    {
      title: "Total GST Reversed",
      value: stats?.sumTotalGst?.toLocaleString() ?? 0,
      subtitle: "Total GST reversed (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Paid Amount",
      value: stats?.sumTotalPaid?.toLocaleString() ?? 0,
      subtitle: "Total amount paid back to customers (₹)",
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

export default SaleReturnsSummaryStats;
export { SaleReturnsSummaryStats };
