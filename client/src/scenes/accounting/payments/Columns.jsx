import React from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to represent payment type (Received / Paid).
 */
const PaymentTypeBadge = ({ type }) => {
  const isReceived = type === "RECEIVED";

  return (
    <div className="flex items-center gap-2">
      {isReceived ? (
        <ArrowDownCircle size={14} className="text-green-600" />
      ) : (
        <ArrowUpCircle size={14} className="text-red-600" />
      )}
      <span className={`text-xs font-medium ${isReceived ? "text-green-600" : "text-red-600"}`}>
        {isReceived ? "Received" : "Paid"}
      </span>
    </div>
  );
};

/**
 * Badge for payment mode.
 */
const PaymentModeBadge = ({ mode }) => {
  if (!mode) return null;

  const label = mode.replace(/_/g, " ");

  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
      {label}
    </span>
  );
};

/**
 * Badge for reference type.
 */
const ReferenceTypeBadge = ({ type }) => {
  if (!type) return null;

  const label = type.replace(/_/g, " ");

  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-indigo-600">
      {label}
    </span>
  );
};

/**
 * Table column definitions for Payments.
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
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="font-medium text-sm text-left" style={{ color: theme.text.primary }}>
          {formatDate(getValue())}
        </span>
      ),
      size: 100
    },
    {
      accessorKey: "party",
      header: "Party",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-medium text-sm text-right" style={{ color: theme.text.primary }}>
            {getValue().name}
          </span>
        ) : (
          <span className="text-xs text-gray-400 text-center">N/A</span>
        ),
      size: 160
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => <PaymentTypeBadge type={getValue()} />,
      size: 120
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-center" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 130,
      meta: { align: "right" }
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
      cell: ({ getValue }) => <PaymentModeBadge mode={getValue()} />,
      size: 120
    },
    {
      accessorKey: "paymentReference",
      header: "Reference",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-sm block text-center" style={{ color: theme.text.primary }}>
            {getValue()}
          </span>
        ) : (
          <span className="text-xs block text-center text-gray-400">N/A</span>
        ),
      size: 130
    },
    {
      accessorKey: "referenceType",
      header: "Reference Type",
      cell: ({ getValue }) => <ReferenceTypeBadge type={getValue()} />,
      size: 140
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-sm truncate max-w-xs" title={getValue()}>
            {getValue()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
      size: 200
    }
  ];

  if (showSelection) {
    baseColumns.unshift({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 cursor-pointer"
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
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 cursor-pointer"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
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
