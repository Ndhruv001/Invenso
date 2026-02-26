/**
 * @file PartySummaryStats.jsx
 * @description Displays responsive stat cards for party summary using API stats.
 */

import React from "react";
import { Users, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

/**
 * @typedef {Object} PartySummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalParties
 * @property {number} stats.totalReceivable
 * @property {number} stats.totalPayable
 * @property {number} stats.totalOpeningBalance
 */

/**
 * PartySummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {PartySummaryStatsProps} props
 * @returns {JSX.Element}
 */
const PartySummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalParties ?? 0,
      subtitle: "Active registered parties",
      icon: Users,
      color: "default"
    },
    {
      title: "Total Receivable",
      value: formatCurrency(stats?.totalReceivable) ?? 0,
      subtitle: "Balance type: RECEIVABLE",
      icon: ArrowDownRight,
      color: "success"
    },
    {
      title: "Total Payable",
      value: formatCurrency(stats?.totalPayable) ?? 0,
      subtitle: "Balance type: PAYABLE",
      icon: ArrowUpRight,
      color: "danger"
    },
    {
      title: "Opening Balance",
      value: formatCurrency(stats?.openingBalance?.receivableOpeningBalance) ?? 0,
      secondaryValue: formatCurrency(stats?.openingBalance?.payableOpeningBalance) ?? 0,
      secondaryLabel: "Payable",
      subtitle: "Sum of opening balances",
      icon: Wallet,
      color: "warning"
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

export default PartySummaryStats;
export { PartySummaryStats };
