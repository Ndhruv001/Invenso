import React from "react";
import { Eye, Edit, Trash2, MoreHorizontal, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to display Payment Type (Received / Paid) with color.
 */
const PaymentTypeBadge = ({ type }) => {
  const color = type === "RECEIVED" ? "text-green-600" : "text-red-600";
  const label = type === "RECEIVED" ? "Received (IN)" : "Paid (OUT)";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      {type === "RECEIVED" ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
      {label}
    </span>
  );
};

/**
 * Badge for Payment Mode.
 */
const PaymentModeBadge = ({ mode }) => {
  if (!mode) return null;
  const displayLabel = mode.replace(/_/g, " ").replace(/\b(\w)/g, c => c.toUpperCase());
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {displayLabel}
    </span>
  );
};

/**
 * Badge for Reference Type.
 */
const ReferenceTypeBadge = ({ referenceType }) => {
  if (!referenceType) return null;
  const displayLabel = referenceType.replace(/_/g, " ").replace(/\b(\w)/g, c => c.toUpperCase());
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
      {displayLabel}
    </span>
  );
};

/**
 * Table column definitions for Payment resource.
 * @param {boolean} showSelection - If true, adds a selection checkbox column.
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
      size: 80,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="font-medium text-sm" style={{ color: theme.text.primary }}>
          {formatDate(getValue())}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "party",
      header: "Party",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-medium text-sm" style={{ color: theme.text.primary }}>
            {getValue().name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 150,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => <PaymentTypeBadge type={getValue()} />,
      size: 120,
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
      meta: { align: "right" },
    },
    {
      accessorKey: "paymentReference",
      header: "Reference",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-mono text-xs bg-white px-2 py-0.5 rounded">
            {getValue()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 120,
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-sm" title={getValue()}>
            {getValue()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 180,
    },
    {
      accessorKey: "referenceType",
      header: "Reference Type",
      cell: ({ getValue }) => <ReferenceTypeBadge referenceType={getValue()} />,
      size: 120,
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
      cell: ({ getValue }) => <PaymentModeBadge mode={getValue()} />,
      size: 110,
    },
    {
      accessorKey: "referenceId",
      header: "Reference ID",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-50">
            {getValue()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 100,
    },
    // Actions column (customize as per your onView, onEdit, onDelete handlers)
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => (
        <div className="flex gap-2 items-center">
          <button
            className="p-1 rounded hover:bg-slate-100"
            onClick={() => table.options.meta?.onView?.(row.original)}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-slate-100"
            onClick={() => table.options.meta?.onEdit?.(row.original)}
            aria-label="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-red-100"
            onClick={() => table.options.meta?.onDelete?.(row.original)}
            aria-label="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100" aria-label="More">
            <MoreHorizontal size={16} />
          </button>
        </div>
      ),
      size: 100,
      enableSorting: false,
      enableHiding: false,
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
      size: 50,
    });
  }

  return baseColumns;
};

export default Columns;
export { Columns };
