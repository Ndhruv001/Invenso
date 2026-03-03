/**
 * @file PurchaseReturnsSummaryStats.jsx
 * @description Displays responsive stat cards for purchase returns summary using API stats.
 */

import React from "react";
import {
  RotateCcw,
  DollarSign,
  CreditCard,
  Wallet
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const PurchaseReturnsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Purchase Returns",
      value: stats?.totalPurchaseReturns ?? 0,
      subtitle: "Number of return bills",
      icon: RotateCcw,
      color: "primary"
    },
    {
      title: "Gross Purchase Returns",
      value: formatCurrency(stats?.grossPurchaseReturns ?? 0),
      subtitle: "Total returned purchase value (₹)",
      icon: DollarSign,
      color: "warning"
    },
    {
      title: "Refund Received",
      value: formatCurrency(stats?.totalRefundReceived ?? 0),
      subtitle: "Amount received from suppliers (₹)",
      icon: CreditCard,
      color: "success"
    },
    {
      title: "Pending Supplier Refund",
      value: formatCurrency(stats?.pendingRefundFromSupplier ?? 0),
      subtitle: "Refund yet to be received (₹)",
      icon: Wallet,
      color: "danger"
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

export default PurchaseReturnsSummaryStats;
export { PurchaseReturnsSummaryStats };