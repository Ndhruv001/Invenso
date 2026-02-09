import React from "react";
import { formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * InventoryLog columns – centered, high-contrast, audit friendly
 */
const Columns = () => {
  const { theme } = useTheme();

  const numberCell = value =>
    value != null ? <span className="font-mono text-sm">{Number(value).toFixed(3)}</span> : "—";

  return [
    {
      accessorKey: "id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ getValue }) => (
        <div className="text-center font-mono text-xs opacity-70">#{getValue()}</div>
      ),
      size: 70
    },

    {
      accessorKey: "createdAt",
      header: () => <div className="text-center">Timestamp</div>,
      cell: ({ getValue }) => (
        <div className="text-center text-xs whitespace-nowrap">{formatDate(getValue())}</div>
      ),
      size: 140
    },

    {
      accessorKey: "product",
      header: () => <div className="text-center">Product</div>,
      cell: ({ getValue }) =>
        getValue?.name ? (
          <div
            className="text-center text-sm font-medium truncate"
            style={{ color: theme.text.primary }}
          >
            {getValue().name}
          </div>
        ) : (
          <div className="text-center text-xs opacity-50">N/A</div>
        ),
      size: 200
    },

    {
      accessorKey: "type",
      header: () => <div className="text-center">Log Type</div>,
      cell: ({ getValue }) => (
        <div className="text-center">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#3B82F6" }} // blue-500 (visible on light & dark)
          >
            {getValue()}
          </span>
        </div>
      ),
      size: 100
    },

    {
      accessorKey: "quantity",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ getValue }) => <div className="text-center">{numberCell(getValue())}</div>,
      size: 100
    },

    {
      accessorKey: "referenceType",
      header: () => <div className="text-center">Ref Type</div>,
      cell: ({ getValue }) => <div className="text-center text-xs">{getValue()}</div>,
      size: 120
    },

    {
      accessorKey: "referenceId",
      header: () => <div className="text-center">Ref ID</div>,
      cell: ({ getValue }) => (
        <div className="text-center font-mono text-xs opacity-70">{getValue() || "—"}</div>
      ),
      size: 100
    },

    {
      accessorKey: "balanceBefore",
      header: () => <div className="text-center">Before</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center font-mono text-sm"
          style={{ color: "#F59E0B" }} // amber-500
        >
          {numberCell(getValue())}
        </div>
      ),
      size: 110
    },

    {
      accessorKey: "balanceAfter",
      header: () => <div className="text-center">After</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center font-mono text-sm font-semibold"
          style={{ color: "#22C55E" }} // green-500
        >
          {numberCell(getValue())}
        </div>
      ),
      size: 110
    },

    {
      accessorKey: "remark",
      header: () => <div className="text-center">Remark</div>,
      cell: ({ getValue }) => (
        <div
          className="text-center text-xs truncate max-w-[220px]"
          title={getValue()}
          style={{ color: theme.text.secondary }}
        >
          {getValue() || "—"}
        </div>
      ),
      size: 220
    }
  ];
};

export default Columns;
export { Columns };
