/**
 * @file PaymentsSummaryStats.jsx
 * @description Displays responsive stat cards for payments summary using API stats.
 */

import React from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import StatCard from "@/components/common/StatCard";

/**
 * @typedef {Object} PaymentsSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalAmount - Sum of all filtered payments.
 * @property {number} stats.totalCredit - Total credits (RECEIVED).
 * @property {number} stats.totalDebit - Total debits (PAID).
 */

/**
 * PaymentsSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {PaymentsSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const PaymentsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Amount",
      value: stats?.totalAmount?.toLocaleString() ?? 0,
      subtitle: "All filtered payments",
      icon: Wallet,
      color: "default"
    },
    {
      title: "Total Credit",
      value: stats?.totalCredit?.toLocaleString() ?? 0,
      subtitle: "Received payments (IN)",
      icon: ArrowDownCircle,
      color: "success"
    },
    {
      title: "Total Debit",
      value: stats?.totalDebit?.toLocaleString() ?? 0,
      subtitle: "Paid payments (OUT)",
      icon: ArrowUpCircle,
      color: "danger"
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

export default PaymentsSummaryStats;
export { PaymentsSummaryStats };
