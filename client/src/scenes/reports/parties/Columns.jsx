import React from "react";
import { formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Party Ledger Columns – Tally Style, Audit Friendly
 */
const Columns = () => {
  const { theme } = useTheme();

  // Format currency numbers
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
      size: 120
    },

    // -----------------------------
    // PARTICULARS
    // -----------------------------
    {
      accessorKey: "particulars",
      header: () => <div className="text-center">Particulars</div>,
      cell: ({ row }) => {
        const value = row.original.particulars;
        const isOpening = value === "Opening Balance";

        return (
          <div
            className={`text-center text-sm truncate ${
              isOpening ? "font-semibold" : ""
            }`}
            style={{
              color: isOpening
                ? theme.accent.primary
                : theme.text.primary
            }}
          >
            {value}
          </div>
        );
      },
      size: 220
    },

    // -----------------------------
    // VOUCHER TYPE
    // -----------------------------
    {
      accessorKey: "voucherType",
      header: () => <div className="text-center">Voucher</div>,
      cell: ({ getValue }) => (
        <div className="text-center text-xs uppercase tracking-wide opacity-80">
          {getValue()}
        </div>
      ),
      size: 120
    },

    // -----------------------------
    // VOUCHER NUMBER
    // -----------------------------
    {
      accessorKey: "voucherNumber",
      header: () => <div className="text-center">No</div>,
      cell: ({ getValue }) => (
        <div className="text-center font-mono text-xs opacity-70">
          {getValue() || "—"}
        </div>
      ),
      size: 100
    },

    // -----------------------------
    // DEBIT
    // -----------------------------
    {
      accessorKey: "debit",
      header: () => <div className="text-center">Debit</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center font-mono text-sm"
          style={{ color: "#DC2626" }} // red-600
        >
          {amountCell(getValue())}
        </div>
      ),
      size: 120
    },

    // -----------------------------
    // CREDIT
    // -----------------------------
    {
      accessorKey: "credit",
      header: () => <div className="text-center">Credit</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center font-mono text-sm"
          style={{ color: "#16A34A" }} // green-600
        >
          {amountCell(getValue())}
        </div>
      ),
      size: 120
    },

    // -----------------------------
    // RUNNING BALANCE
    // -----------------------------
    {
      accessorKey: "balance",
      header: () => <div className="text-center">Balance</div>,
      cell: ({ getValue }) => {
        const value = Number(getValue());

        return (
          <div
            className="text-center font-mono text-sm font-semibold"
            style={{
              color:
                value > 0
                  ? "#DC2626" // red → party owes you
                  : value < 0
                  ? "#16A34A" // green → you owe party
                  : theme.text.primary
            }}
          >
            {value !== 0 ? value.toFixed(2) : "0.00"}
          </div>
        );
      },
      size: 130
    }
  ];
};

export default Columns;
export { Columns };