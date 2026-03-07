/**
 * @file TransportLedgerSummaryStats.jsx
 * @description Displays responsive stat cards for transport report summary.
 */

import React from "react";
import { Truck, Wallet, Scale } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

/**
 * @typedef {Object} TransportLedgerSummaryStatsProps
 * @property {Object} stats
 * @property {number} stats.totalTransport
 * @property {number} stats.totalPayment
 * @property {number} stats.outstanding
 */

/**
 * TransportLedgerSummaryStats - Renders transport stat cards
 *
 * @param {TransportLedgerSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const TransportLedgerSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Transport",
      value: formatCurrency(stats?.totalTransport ?? 0),
      subtitle: "Total transport charges",
      icon: Truck,
      color: "default"
    },
    {
      title: "Total Payment",
      value: formatCurrency(stats?.totalPayment ?? 0),
      subtitle: "Total amount paid",
      icon: Wallet,
      color: "success"
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats?.outstanding ?? 0),
      subtitle: "Pending payment",
      icon: Scale,
      color: stats?.outstanding > 0 ? "warning" : "success"
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

export default TransportLedgerSummaryStats;
export { TransportLedgerSummaryStats };