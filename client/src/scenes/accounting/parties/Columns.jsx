import React from "react";
import { formatCurrency } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to display party type.
 * Subtle color difference for visual variety.
 */
const PartyTypeBadge = ({ type }) => {
  const colors = {
    CUSTOMER: "text-indigo-600",
    SUPPLIER: "text-amber-600",
    BOTH: "text-teal-600",
    EMPLOYEE: "text-blue-600",
    DRIVER: "text-emerald-600",
    OTHER: "text-gray-500"
  };

  return (
    <span className={`font-medium text-sm ${colors[type] || "text-gray-500"}`}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
};

/**
 * Party Columns — defines TanStack Table column configuration
 * Used in DataTable for Parties management
 */
const PartyColumns = (showSelection = false) => {
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
      size: 70
    },
    {
      accessorKey: "name",
      header: "Party Name",
      cell: ({ getValue }) => (
        <span
          className="font-semibold text-sm truncate max-w-[180px]"
          title={getValue()}
          style={{ color: theme.text.primary }}
        >
          {getValue()}
        </span>
      ),
      minSize: 180
    },
    {
      accessorKey: "identifier",
      header: "Identifier",
      cell: ({ getValue }) => (
        <span
          className="font-mono text-xs text-gray-500 truncate max-w-[160px]"
          title={getValue() || "N/A"}
        >
          {getValue() || "—"}
        </span>
      ),
      size: 150
    },
    {
      accessorKey: "type",
      header: "Party Type",
      cell: ({ getValue }) => <PartyTypeBadge type={getValue()} />,
      size: 120
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
          {getValue() || "—"}
        </span>
      ),
      size: 140
    },
    {
      accessorKey: "gstNumber",
      header: "GST Number",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
          {getValue() || "—"}
        </span>
      ),
      size: 140
    },
    {
      accessorKey: "openingBalance",
      header: "Opening Balance",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 140,
      meta: { align: "right" }
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: theme.text.primary }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 140,
      meta: { align: "right" }
    }
  ];

  // ✅ Prepend checkbox column if selection is enabled
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

export default PartyColumns;
export { PartyColumns };
