/**
 * @file PurchasesSummaryStats.jsx
 * @description Displays responsive stat cards for purchases summary using API stats.
 */

import React from "react";
import {
  FileText,
  Users,
  DollarSign,
  CreditCard,
  Wallet,
  TrendingDown
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const PurchasesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Gross Purchases",
      value: formatCurrency(stats?.grossPurchases ?? 0),
      subtitle: "Total billed purchase amount (₹)",
      icon: DollarSign,
      color: "info"
    },
    {
      title: "Net Purchases",
      value: formatCurrency(stats?.netPurchases ?? 0),
      subtitle: "After purchase returns (₹)",
      icon: TrendingDown,
      color: "warning"
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats?.totalPaid ?? 0),
      subtitle: "Amount paid to suppliers (₹)",
      icon: CreditCard,
      color: "success"
    },
    {
      title: "Outstanding Payable",
      value: formatCurrency(stats?.outstandingPayable ?? 0),
      subtitle: "Pending supplier payments (₹)",
      icon: Wallet,
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

export default PurchasesSummaryStats;
export { PurchasesSummaryStats };