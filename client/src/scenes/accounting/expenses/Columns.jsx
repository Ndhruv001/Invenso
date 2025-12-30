import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  CreditCard,
  Layers,
  Hash
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Table column definitions for Expense resource.
 * Excludes createdAt and updatedAt.
 */
const Columns = (showSelection = false) => {
  const { theme } = useTheme();

  const baseColumns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-semibold text-gray-400">
          #{String(getValue()).padStart(4, "0")}
        </span>
      ),
      size: 80
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) =>
        getValue ? (
          <span className="font-medium text-sm" style={{ color: theme.text.primary }}>
            {getValue()?.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 140
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-sm" style={{ color: theme.text.primary }}>
          {formatDate(getValue())}
        </span>
      ),
      size: 120
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 120,
      meta: { align: "right" }
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
      cell: ({ getValue }) => {
        
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {getValue()
            ? String(getValue())
                .replace(/_/g, " ")
                .replace(/\b(\w)/g, c => c.toUpperCase())
            : ""}
        </span>;
      },
      size: 110
    },
    {
      accessorKey: "paymentReference",
      header: "Reference",
      cell: ({ getValue }) => {
        return getValue ? (
          <span className="font-mono text-xs bg-white px-2 py-0.5 rounded">{getValue()}</span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        );
      },
      size: 120
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ getValue }) =>
        getValue ? (
          <span className="text-sm" title={getValue}>
            {getValue()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 180
    },
  ];

  if (showSelection) {
    baseColumns.unshift({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-500"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          ref={el => {
            if (el)
              el.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-500"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select row ${row.index + 1}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50
    });
  }

  return baseColumns;
};

export default Columns;
export { Columns };
