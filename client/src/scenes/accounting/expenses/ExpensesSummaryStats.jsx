/**
 * @file ExpensesSummaryStats.jsx
 * @description Displays responsive stat cards for expense summary using API stats.
 */

import React from "react";
import { Layers, DollarSign } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/helpers/formatters";

/**
 * @typedef {Object} ExpensesSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalCategories - Distinct category count (type = EXPENSE).
 * @property {number} stats.totalExpenses - Total sum of all expenses in view.
 */

/**
 * ExpensesSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {ExpensesSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const ExpensesSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.totalAmount) ?? 0,
      subtitle: "Sum of all expenses",
      icon: DollarSign,
      color: "danger"
    },
    {
      title: "Expense Categories",
      value: stats?.totalCategories ?? 0,
      subtitle: "Distinct categories",
      icon: Layers,
      color: "default"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default ExpensesSummaryStats;
export { ExpensesSummaryStats };
