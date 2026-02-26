// Top Products Table
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/lib/helpers/formatters";

const TopProductsColumns = () => {
  const { theme } = useTheme();
  const baseColumns = [
    {
      header: "Product Name",
      accessorKey: "productName",
      cell: ({ getValue }) => (
        <span className="font-medium" style={{ color: theme.text.primary }}>
          {getValue()}
        </span>
      )
    },
    {
      header: "Quantity Sold",
      accessorKey: "quantity",
      cell: ({ getValue }) => (
        <span className="font-semibold" style={{ color: theme.text.secondary }}>
          {getValue()}
        </span>
      )
    },
    {
      header: "Unit",
      accessorKey: "unit",
      cell: ({ getValue }) => (
        <span className="font-medium text-xs uppercase" style={{ color: theme.text.muted }}>
          {getValue()}
        </span>
      )
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      cell: ({ getValue }) => (
        <span className="font-bold" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      )
    }
  ];

  return baseColumns;
};

export default TopProductsColumns;
export { TopProductsColumns };
