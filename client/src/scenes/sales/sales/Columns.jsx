import React from "react";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to display party name with theme colors and truncation.
 */
const PartyBadge = ({ party }) => {
  const { theme } = useTheme();
  if (!party) return null;

  return (
    <div
      className="font-medium text-sm truncate max-w-[140px]"
      title={party.name}
      style={{ color: theme.text.primary }}
      aria-label={`Party: ${party.name}`}
    >
      {party.name}
    </div>
  );
};

/**
 * Sale table column definitions including all cell rendering logic and actions.
 * Pass `onView`, `onEdit`, `onDelete` callbacks and `showSelection`.
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
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm" style={{ color: theme.text.primary }}>
          {getValue() || "N/A"}
        </span>
      ),
      minSize: 180
    },
    {
      accessorKey: "party",
      header: "Party",
      cell: ({ getValue }) => <PartyBadge party={getValue()} />,
      size: 180
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        return (
          <span className="text-sm" style={{ color: theme.text.primary }}>
            {formatDate(getValue(), "long")}
          </span>
        );
      },
      size: 120
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ getValue }) => (
        <span className="font-semibold text-right block" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 140,
      meta: { align: "right" }
    },
    {
      accessorKey: "receivedAmount",
      header: "Received Amount",
      cell: ({ getValue }) => (
        <span className="font-semibold text-right block" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 140,
      meta: { align: "right" }
    },
    {
      accessorKey: "totalProfit",
      header: "Profit",
      cell: ({ getValue }) => {
        const profit = Number(getValue() || 0);
        const color = profit < 0 ? "#ef4444" : profit > 0 ? "#22c55e" : "#ca8a04";

        return (
          <span className="font-semibold text-right block" style={{ color }}>
            {formatCurrency(getValue())}
          </span>
        );
      },
      size: 140,
      meta: { align: "right" }
    },
    {
      accessorKey: "paymentMode",
      header: "Mode",
      cell: ({ getValue }) => (
        <span className="font-semibold text-right block" style={{ color: theme.text.primary }}>
          {getValue()}
        </span>
      ),
      size: 140,
      meta: { align: "right" }
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ getValue }) => (
        <span
          className="text-sm truncate block max-w-[200px]"
          style={{ color: theme.text.muted }}
          title={getValue()}
        >
          {getValue() || "-"}
        </span>
      ),
      size: 200
    }
  ];

  // Prepend selection checkbox column if enabled
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
