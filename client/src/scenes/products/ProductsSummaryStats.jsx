/**
 * @file ProductsSummaryStats.jsx
 * @description Displays responsive stat cards for products summary using API stats.
 */

import React from "react";
import { Package, Layers, Hash, DollarSign } from "lucide-react";
import StatCard from "@/components/common/StatCard";

/**
 * @typedef {Object} ProductsSummaryStatsProps
 * @property {Object} stats - API stats object.
 * @property {number} stats.totalCategories
 * @property {number} stats.totalHSN
 * @property {number} stats.totalProducts
 * @property {number} stats.totalStockValue
 */

/**
 * ProductsSummaryStats - Renders a responsive grid of StatCards.
 *
 * @param {ProductsSummaryStatsProps} props
 * @returns {JSX.Element}
 */
const ProductsSummaryStats = ({ stats }) => {
  const items = [
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      subtitle: "All active products",
      icon: Package,
      color: "default"
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories ?? 0,
      subtitle: "Product categories",
      icon: Layers,
      color: "success"
    },
    {
      title: "Unique HSN Codes",
      value: stats?.totalHSN ?? 0,
      subtitle: "HSN classifications",
      icon: Hash,
      color: "warning"
    },
    {
      title: "Total Stock Value",
      value: stats?.totalStockValue?.toLocaleString() ?? 0,
      subtitle: "Inventory worth (₹)",
      icon: DollarSign,
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

export default ProductsSummaryStats;
export { ProductsSummaryStats };