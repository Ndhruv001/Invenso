/**
 * @file ChequesSummaryStats.jsx
 * @description Displays responsive stat cards for cheques summary using API stats.
 */

import React from "react";
import { 
  CheckCircle2, 
  Banknote, 
  Clock, 
  Ticket 
} from "lucide-react";
import StatCard from "@/components/common/StatCard";

const ChequesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Cleared",
      value: stats?.totalClearedAmount ?? 0,
      subtitle: "Cleared Inward Cheques",
      icon: CheckCircle2,
      color: "success"
    },
    {
      title: "Total Encashed",
      value: stats?.totalEncashedAmount ?? 0,
      subtitle: "Encashed Outward Cheques",
      icon: Banknote,
      color: "info"
    },
    {
      title: "Inward Pending",
      value: stats?.inwardPending ?? 0,
      subtitle: "Cheques yet to be cleared",
      icon: Clock,
      color: "warning"
    },
    {
      title: "Outward Pending",
      value: stats?.outwardPending ?? 0,
      subtitle: "Cheques yet to be encashed",
      icon: Ticket,
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

export default ChequesSummaryStats;
export { ChequesSummaryStats };