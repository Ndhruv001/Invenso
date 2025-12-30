/**
 * @file PurchasesSummaryStats.jsx
 * @description Displays responsive stat cards for purchases summary using API stats.
 */

import React from "react";
import { Users, CreditCard, DollarSign, FileText } from "lucide-react";
import StatCard from "@/components/common/StatCard";

/**
 * @typedef {Object} PurchasesSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalParties
 * @property {number} stats.sumTotalAmount
 * @property {number} stats.sumTotalGst
 * @property {number} stats.sumTotalPaid
 */

/**
 * PurchasesSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {PurchasesSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const PurchasesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalParties ?? 0,
      subtitle: "Vendors and suppliers",
      icon: Users,
      color: "success"
    },
    {
      title: "Total Purchase Amount",
      value: stats?.sumTotalAmount?.toLocaleString() ?? 0,
      subtitle: "Overall purchase value (₹)",
      icon: FileText,
      color: "primary"
    },
    {
      title: "Total GST",
      value: stats?.sumTotalGst?.toLocaleString() ?? 0,
      subtitle: "Total GST paid (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Paid Amount",
      value: stats?.sumTotalPaid?.toLocaleString() ?? 0,
      subtitle: "Total amount paid (₹)",
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

export default PurchasesSummaryStats;
export { PurchasesSummaryStats };
