// Top Products Table
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/lib/helpers/formatters";``

const TopProductsColumns = () => {
  const { theme } = useTheme();
  const baseColumns = [
    {
        header: "Product Name",
        accessorKey: "productName",
        cell: ({ value }) => <span className={`font-medium ${theme.text.primary}`}>{value}</span>
      },
      {
        header: "Quantity Sold",
        accessorKey: "quantity",
        cell: ({ value }) => (
          <span className={`font-semibold ${theme.text.secondary}`}>{value}</span>
        )
      },
      {
        header: "Total Amount",
        accessorKey: "totalAmount",
        cell: ({ value }) => (
          <span
            className={`font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}
          >
            {formatCurrency(value)}
          </span>
        )
      }
  ];

  return baseColumns;
};

export default TopProductsColumns;
export { TopProductsColumns };
