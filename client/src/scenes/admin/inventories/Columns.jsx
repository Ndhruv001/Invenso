import React from "react";
import { formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * InventoryLog columns for DataTable (minimal UI, read-only).
 */
const Columns = () => {
  const { theme } = useTheme();

  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-500">#{getValue()}</span>
      ),
      size: 60,
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ getValue }) =>
        getValue?.name ? (
          <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
            {getValue.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 180,
    },
    {
      accessorKey: "type",
      header: "Log Type",
      cell: ({ getValue }) => (
        <span className="text-xs px-2 py-1 rounded bg-gray-100 font-mono">
          {getValue()}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ getValue }) => (
        <span className="block text-sm text-right">{Number(getValue()).toFixed(3)}</span>
      ),
      size: 90,
      meta: { align: "right" },
    },
    {
      accessorKey: "referenceType",
      header: "Reference Type",
      cell: ({ getValue }) => (
        <span className="text-xs">{getValue()}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "referenceId",
      header: "Reference ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-500">{getValue() || "—"}</span>
      ),
      size: 90,
    },
    {
      accessorKey: "balanceBefore",
      header: "Before",
      cell: ({ getValue }) => (
        <span className="block text-sm text-right">{getValue() != null ? Number(getValue()).toFixed(3) : "—"}</span>
      ),
      size: 90,
      meta: { align: "right" },
    },
    {
      accessorKey: "balanceAfter",
      header: "After",
      cell: ({ getValue }) => (
        <span className="block text-sm text-right">{getValue() != null ? Number(getValue()).toFixed(3) : "—"}</span>
      ),
      size: 90,
      meta: { align: "right" },
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ getValue }) => (
        <span className="text-xs max-w-[200px] truncate" title={getValue()}>
          {getValue() || "—"}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ getValue }) => (
        <span className="text-xs">{formatDate(getValue())}</span>
      ),
      size: 120,
    },
  ];
};

export default Columns;
export { Columns };
