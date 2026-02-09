import React from "react";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to represent payment status with predefined color logic.
 */
const PaymentStatusBadge = ({ amount, receivedAmount }) => {
  const getPaymentStatus = (amount, receivedAmount) => {
    const total = Number(amount);
    const received = Number(receivedAmount);
    
    if (received === 0) return { label: "Unpaid", color: "text-red-600" };
    if (received < total) return { label: "Partial", color: "text-amber-600" };
    return { label: "Paid", color: "text-green-600" };
  };

  const status = getPaymentStatus(amount, receivedAmount);
  const received = Number(receivedAmount);
  const total = Number(amount);
  const pending = total - received;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${status.color}`} aria-label={`Payment status: ${status.label}`}>
          {status.label}
        </span>
      </div>
      {pending > 0 && (
        <span className="text-xs text-gray-500" aria-label={`Pending amount: ${formatCurrency(pending)}`}>
          Pending: {formatCurrency(pending)}
        </span>
      )}
    </div>
  );
};

/**
 * Badge to display payment mode.
 */
const PaymentModeBadge = ({ paymentMode }) => {
  
  const getModeConfig = (mode) => {
    switch (mode) {
      case "CASH":
        return { label: "Cash", color: "text-green-600" };
      case "CHEQUE":
        return { label: "Cheque", color: "text-blue-600" };
      case "ONLINE":
        return { label: "Online", color: "text-purple-600" };
      case "NONE":
      default:
        return { label: "None", color: "text-gray-400" };
    }
  };

  const config = getModeConfig(paymentMode);

  return (
    <span
      className={`text-xs font-medium ${config.color}`}
      aria-label={`Payment mode: ${config.label}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Table column definitions with all cell rendering logic and actions.
 * `onView`, `onEdit`, `onDelete` callbacks are passed from parent.
 * `showSelection` toggles visibility of row selection checkbox column.
 */
const Columns = (showSelection = false) => {
  const { theme } = useTheme();

  // Common colors abstracted for reuse
  const colors = {
    red600: "#b91c1c",
    amber600: "#d97706",
    green600: "#16a34a",
    blue600: "#2563eb",
    bgLightGray: theme.card.includes("white") ? "#f1f5f9" : "#1e293b",
    textMutedAlt: theme.text.muted === "text-gray-500" ? "#475569" : "#94a3b8"
  };

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
        <div className="flex flex-col">
          <span className="font-semibold text-sm" style={{ color: theme.text.primary }}>
            {formatDate(getValue())}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(getValue()).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ),
      size: 140
    },
    {
      accessorKey: "party",
      header: "Party",
      cell: ({ getValue }) => (
        <div className="flex flex-col max-w-xs">
          <span
            className="font-semibold truncate text-sm"
            title={getValue()?.name}
            style={{ color: theme.text.primary }}
          >
            {getValue()?.name || "N/A"}
          </span>
          {getValue()?.phoneNumber && (
            <span className="text-xs truncate" style={{ color: theme.text.muted }}>
              {getValue().phoneNumber}
            </span>
          )}
        </div>
      ),
      minSize: 180
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ getValue }) => (
        <div className="flex flex-col max-w-xs">
          <span
            className="font-semibold truncate text-sm"
            title={getValue()?.name}
            style={{ color: theme.text.primary }}
          >
            {getValue()?.name || "N/A"}
          </span>
          {getValue()?.phoneNumber && (
            <span className="text-xs truncate" style={{ color: theme.text.muted }}>
              {getValue().phoneNumber}
            </span>
          )}
        </div>
      ),
      minSize: 180
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ getValue }) => (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: colors.bgLightGray, color: colors.textMutedAlt }}
        >
          {getValue() || "N/A"}
        </span>
      ),
      size: 100
    },
    {
      accessorKey: "fromLocation",
      header: "From",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium truncate text-left max-w-[150px]" title={getValue()} style={{ color: theme.text.primary }}>
          {getValue()}
        </span>
      ),
      size: 150
    },
    {
      accessorKey: "toLocation",
      header: "To",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-right truncate max-w-[150px]" title={getValue()} style={{ color: theme.text.primary }}>
          {getValue()}
        </span>
      ),
      size: 150
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
      accessorKey: "receivedAmount",
      header: "Received",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: colors.green600 }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 120,
      meta: { align: "right" }
    },
    {
      id: "payment_status",
      header: "Payment Status",
      cell: ({ row }) => (
        <PaymentStatusBadge 
          amount={row.original.amount} 
          receivedAmount={row.original.receivedAmount} 
        />
      ),
      size: 130
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
      cell: ({ getValue }) => <PaymentModeBadge paymentMode={getValue()} />,
      size: 120
    },
    {
      accessorKey: "paymentReference",
      header: "Reference",
      cell: ({ getValue }) => (
        <span
          className="text-xs font-mono truncate max-w-[120px]"
          title={getValue()}
          style={{ color: theme.text.muted }}
        >
          {getValue() || "-"}
        </span>
      ),
      size: 130
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ getValue }) => (
        <span
          className="text-xs truncate max-w-[150px]"
          title={getValue()}
          style={{ color: theme.text.muted }}
        >
          {getValue() || "-"}
        </span>
      ),
      size: 150
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-400">
          {formatDate(getValue())}
        </span>
      ),
      size: 120
    }
  ];

  // Prepend a selection checkbox column if selection is enabled
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