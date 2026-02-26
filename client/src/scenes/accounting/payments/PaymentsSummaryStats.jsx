/**
 * @file PaymentsSummaryStats.jsx
 * @description Displays responsive stat cards for payments summary using API stats.
 */

import React from "react";
import { ArrowDownCircle, ArrowUpCircle, User } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

const PaymentsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Parties",
      value: stats?.totalParties ?? 0,
      subtitle: "All filtered parties",
      icon: User,
      color: "default"
    },
    {
      title: "Total Received",
      value: formatCurrency(stats?.totalReceived) ?? 0,
      subtitle: "Received payments (IN)",
      icon: ArrowDownCircle,
      color: "success"
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats?.totalPaid) ?? 0,
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
