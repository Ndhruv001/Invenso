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
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="font-medium" style={{ color: theme.text.primary }}>
            {getValue()}
          </span>
        </div>
      )
    },
    {
      header: "Current Stock",
      accessorKey: "currentStock",
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
      header: "Threshold",
      accessorKey: "threshold",
      cell: ({ getValue }) => <span style={{ color: theme.text.muted }}>{getValue()}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const isOutOfStock = status === "Out of Stock";
        const isCritical = status === "Critical";
        const isLow = status === "Low";

        return (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isOutOfStock
                ? "bg-red-100 text-red-800"
                : isCritical
                  ? "bg-orange-100 text-orange-800"
                  : isLow
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
            }`}
          >
            {(isOutOfStock || isCritical || isLow) && <AlertTriangle className="w-3 h-3" />}
            {status}
          </span>
        );
      }
    }
  ];

  return baseColumns;
};

export default LowStockColumns;
export { LowStockColumns };
