/**
 * @file SaleReturnsSummaryStats.jsx
 * @description Displays responsive stat cards for sale returns summary using API stats.
 */

import React from "react";
import {
  Users,
  DollarSign,
  CreditCard,
  TrendingDown
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const SaleReturnsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Gross Returns",
      value: formatCurrency(stats?.grossReturns ?? 0),
      subtitle: "Total returned amount (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Total Refunded",
      value: formatCurrency(stats?.totalRefunded ?? 0),
      subtitle: "Amount refunded to customers (₹)",
      icon: CreditCard,
      color: "info"
    },
    {
      title: "Pending Refund",
      value: formatCurrency(stats?.pendingRefund ?? 0),
      subtitle: "Refund yet to be paid (₹)",
      icon: Users,
      color: "danger"
    },
    {
      title: "Profit / Loss Impact",
      value: formatCurrency(stats?.totalProfitLoss ?? 0),
      subtitle: "Net loss due to returns (₹)",
      icon: TrendingDown,
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

export default SaleReturnsSummaryStats;
export { SaleReturnsSummaryStats };