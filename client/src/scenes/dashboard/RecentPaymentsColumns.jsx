// Recent Payments Table
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { Calendar, Users } from "lucide-react";


const RecentPaymentsColumns = () => {
  const { theme } = useTheme();
  const baseColumns = [
    {
      header: "Party",
      accessorKey: "partyName",
      cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className={`font-medium ${theme.text.primary}`}>{value}</span>
        </div>
      )
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ value }) => (
        <span className={`font-bold ${theme.text.primary}`}>{formatCurrency(value)}</span>
      )
    },
    {
      header: "Payment Mode",
      accessorKey: "mode",
      cell: ({ value }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${theme.text.secondary} ${theme.border} border`}
        >
          {value}
        </span>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ value }) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className={theme.text.muted}>{formatDate(value)}</span>
        </div>
      )
    }
  ];

  return baseColumns;
};

export default RecentPaymentsColumns;
export { RecentPaymentsColumns };
