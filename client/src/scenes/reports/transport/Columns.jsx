import React from "react";
import { formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Transport Ledger Columns
 */
const Columns = () => {
  const { theme } = useTheme();

  const amountCell = value =>
    value != null && value !== 0 ? (
      <span className="font-mono text-sm">
        {Number(value).toFixed(2)}
      </span>
    ) : (
      "—"
    );

  return [
    // -----------------------------
    // DATE
    // -----------------------------
    {
      accessorKey: "date",
      header: () => <div className="text-center">Date</div>,
      cell: ({ getValue }) => (
        <div className="text-center text-xs whitespace-nowrap">
          {formatDate(getValue(), "long")}
        </div>
      ),
      size: 130
    },

    // -----------------------------
    // FROM LOCATION
    // -----------------------------
    {
      accessorKey: "from",
      header: () => <div className="text-center">From</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center text-sm truncate"
          style={{ color: theme.text.primary }}
        >
          {getValue() || "—"}
        </div>
      ),
      size: 180
    },

    // -----------------------------
    // TO LOCATION
    // -----------------------------
    {
      accessorKey: "to",
      header: () => <div className="text-center">To</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center text-sm truncate"
          style={{ color: theme.text.primary }}
        >
          {getValue() || "—"}
        </div>
      ),
      size: 180
    },

    // -----------------------------
    // AMOUNT
    // -----------------------------
    {
      accessorKey: "amount",
      header: () => <div className="text-center">Amount</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center font-mono text-sm font-semibold"
          style={{ color: theme.accent.primary }}
        >
          {amountCell(getValue())}
        </div>
      ),
      size: 140
    },

    // -----------------------------
    // VOUCHER NUMBER
    // -----------------------------
    {
      accessorKey: "voucherNumber",
      header: () => <div className="text-center">Voucher No</div>,
      cell: ({ getValue }) => (
        <div className="text-center font-mono text-xs opacity-80">
          {getValue() || "—"}
        </div>
      ),
      size: 140
    },

    // -----------------------------
    // VOUCHER TYPE
    // -----------------------------
    {
      accessorKey: "voucherType",
      header: () => <div className="text-center">Voucher Type</div>,
      cell: ({ getValue }) => (
        <div className="text-center text-xs uppercase tracking-wide opacity-80">
          {getValue()}
        </div>
      ),
      size: 140
    }
  ];
};

export default Columns;
export { Columns };