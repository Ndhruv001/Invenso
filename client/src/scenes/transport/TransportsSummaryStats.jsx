/**
 * @file TransportsSummaryStats.jsx
 * @description Displays responsive stat cards for transports summary using API stats.
 */

import React from "react";
import { Users, User, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

/**
 * @typedef {Object} TransportsSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalDistinctParty
 * @property {number} stats.totalDistinctDriver
 * @property {number} stats.totalAmount
 * @property {number} stats.totalReceived
 */

/**
 * TransportsSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {TransportsSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const TransportsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalDistinctParty ?? 0,
      subtitle: "Distinct parties",
      icon: Users,
      color: "default"
    },
    {
      title: "Total Drivers",
      value: stats?.totalDistinctDriver ?? 0,
      subtitle: "Distinct drivers",
      icon: User,
      color: "default"
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats?.totalAmount) ?? 0,
      subtitle: "Total transport amount (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Received",
      value: formatCurrency(stats?.totalReceived) ?? 0,
      subtitle: "Payments received (₹)",
      icon: TrendingUp,
      color: "success"
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

export default TransportsSummaryStats;
export { TransportsSummaryStats };
