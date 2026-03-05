/**
 * @file ReportSummaryStats.jsx
 * @description Displays responsive stat cards for report summary using API stats.
 */

import React from "react";
import { ArrowDownLeft, ArrowUpRight, Scale, Wallet } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

/**
 * @typedef {Object} PartyLedgerSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalDebit
 * @property {number} stats.totalCredit
 * @property {number} stats.closingBalance
 * @property {string} stats.balanceType
 */

/**
 * PartyLedgerSummaryStats - Renders report stat cards
 *
 * @param {PartyLedgerSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const PartyLedgerSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Debit",
      value: formatCurrency(stats?.totalDebit ?? 0),
      subtitle: "Total outgoing amount",
      icon: ArrowDownLeft,
      color: "danger"
    },
    {
      title: "Total Credit",
      value: formatCurrency(stats?.totalCredit ?? 0),
      subtitle: "Total incoming amount",
      icon: ArrowUpRight,
      color: "success"
    },
    {
      title: "Closing Balance",
      value: formatCurrency(Math.abs(stats?.closingBalance ?? 0)),
      subtitle: stats?.balanceType ?? "Balance",
      icon: Scale,
      color:
        stats?.closingBalance < 0
          ? "warning"
          : stats?.closingBalance > 0
          ? "default"
          : "default"
    },
    {
      title: "Balance Type",
      value: stats?.balanceType ?? "-",
      subtitle: "Receivable / Payable",
      icon: Wallet,
      color:
        stats?.balanceType === "Receivable"
          ? "warning"
          : stats?.balanceType === "Payable"
          ? "default"
          : "default"
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

export default PartyLedgerSummaryStats;
export { PartyLedgerSummaryStats };