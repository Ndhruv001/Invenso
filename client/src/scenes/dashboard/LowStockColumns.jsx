// Low Stock Table
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { Package, AlertTriangle } from "lucide-react";

const LowStockColumns = () => {
  const { theme } = useTheme();
  const baseColumns = [
    {
      header: "Product Name",
      accessorKey: "name",
      cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className={`font-medium ${theme.text.primary}`}>{value}</span>
        </div>
      )
    },
    {
      header: "Current Stock",
      accessorKey: "currentStock",
      cell: ({ value }) => <span className={`font-semibold ${theme.text.secondary}`}>{value}</span>
    },
    {
      header: "Threshold",
      accessorKey: "threshold",
      cell: ({ value }) => <span className={theme.text.muted}>{value}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const isLow = row.original.currentStock < row.original.threshold;
        return (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {isLow && <AlertTriangle className="w-3 h-3" />}
            {isLow ? "Low Stock" : "Good"}
          </span>
        );
      }
    }
  ];

  return baseColumns;
};

export default LowStockColumns;
export { LowStockColumns };
