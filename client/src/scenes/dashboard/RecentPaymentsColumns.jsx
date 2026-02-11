// Recent Payments Table
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { Calendar, Users } from "lucide-react";

const RecentPaymentsColumns = () => {
  const { theme } = useTheme();
  const baseColumns = [
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3" style={{ color: theme.text.muted }} />
          <span style={{ color: theme.text.muted }}>{formatDate(getValue())}</span>
        </div>
      )
    },
    {
      header: "Party",
      accessorKey: "partyName",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="font-medium" style={{ color: theme.text.primary }}>
            {getValue()}
          </span>
        </div>
      )
    },
    {
      header: "Payment Type",
      accessorKey: "type",
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${theme.border} border`}
          style={{ color: theme.text.secondary }}
        >
          {getValue()}
        </span>
      )
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ getValue }) => (
        <span className="font-bold" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      )
    },
    {
      header: "Payment Mode",
      accessorKey: "paymentMode",
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${theme.border} border`}
          style={{ color: theme.text.secondary }}
        >
          {getValue()}
        </span>
      )
    }
  ];

  return baseColumns;
};

export default RecentPaymentsColumns;
export { RecentPaymentsColumns };