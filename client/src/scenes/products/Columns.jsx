import React from "react";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

/**
 * Badge to represent stock status with predefined color logic.
 */
const StockBadge = ({ stock, threshold }) => {
  const getStockStatus = (stock, threshold) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-600" };
    if (stock <= threshold) return { label: "Low Stock", color: "text-amber-600" };
    return { label: "In Stock", color: "text-green-600" };
  };

  const status = getStockStatus(stock, threshold);

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium" aria-label={`Stock count: ${stock}`}>
        {stock}
      </span>
      <span
        className={`text-xs font-medium ${status.color}`}
        aria-label={`Stock status: ${status.label}`}
      >
        {status.label}
      </span>
    </div>
  );
};

/**
 * Badge to display size, replacing "NONE" with "N/A".
 * Uses theme primary text color for consistency.
 */
const SizeBadge = ({ size }) => {
  const { theme } = useTheme();

  return (
    <span
      className="text-sm font-medium tracking-wide"
      style={{ color: theme.text.primary }}
      aria-label={`Size: ${size === "NONE" ? "N/A" : size}`}
    >
      {size === "NONE" ? "N/A" : size.replace("S", "")}
    </span>
  );
};

/**
 * Badge to display category name and type.
 * Uses theme colors; truncates long text for layout.
 */
const CategoryBadge = ({ category }) => {
  const { theme } = useTheme();
  if (!category) return null;

  return (
    <div
      className="font-medium text-sm truncate max-w-[120px]"
      title={category.name}
      style={{ color: theme.text.primary }}
      aria-label={`Category: ${category.name}`}
    >
      {category.name}
    </div>
  );
};

/**
 * Table column definitions with all cell rendering logic and actions.
 * `onView`, `onEdit`, `onDelete` callbacks are passed from parent.
 * `showSelection` toggles visibility of row selection checkbox column.
 */
const Columns = ( showSelection = false ) => {
  const { theme } = useTheme();

  // Common colors abstracted for reuse
  const colors = {
    red600: "#b91c1c",
    amber600: "#d97706",
    green600: "#16a34a",
    bgLightGray: theme.card.includes("white") ? "#f1f5f9" : "#1e293b",
    textMutedAlt: theme.text.muted === "text-gray-500" ? "#475569" : "#94a3b8"
  };

  // Calculate profit margin and color based on margin % thresholds
  const getMarginColor = margin => {
    if (margin < 5) return colors.red600;
    if (margin < 15) return colors.amber600;
    return colors.green600;
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
      accessorKey: "name",
      header: "Product Name",
      cell: ({ getValue, row }) => (
        <div className="flex flex-col max-w-xs">
          <span
            className="font-semibold truncate text-sm"
            title={getValue()}
            style={{ color: theme.text.primary }}
          >
            {getValue()}
          </span>
          {row.original.description && (
            <span className="text-xs truncate" style={{ color: theme.text.muted }}>
              {row.original.description}
            </span>
          )}
          <span className="text-xs text-gray-400">
            Updated: {formatDate(row.original.updatedAt)}
          </span>
        </div>
      ),
      minSize: 220
    },
    {
      accessorKey: "hsnCode",
      header: "HSN Code",
      cell: ({ getValue }) => (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono"
          style={{ backgroundColor: colors.bgLightGray, color: colors.textMutedAlt }}
        >
          {getValue() || "N/A"}
        </span>
      ),
      size: 100
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => <CategoryBadge category={getValue()} />,
      size: 140
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ getValue }) => <SizeBadge size={getValue()} />,
      size: 100
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
          {getValue()}
        </span>
      ),
      size: 80
    },
    {
      accessorKey: "openingStock",
      header: "Opening Stock",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: theme.text.primary }}>
          {Number(getValue())}
        </span>
      ),
      size: 120,
      meta: { align: "right" }
    },
    {
      accessorKey: "currentStock",
      header: "Current Stock",
      cell: ({ getValue, row }) => (
        <StockBadge stock={Number(getValue())} threshold={row.original.threshold} />
      ),
      size: 150,
      meta: { align: "right" }
    },
    {
      accessorKey: "threshold",
      header: "Threshold",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium block text-right" style={{ color: colors.amber600 }}>
          {getValue()}
        </span>
      ),
      size: 100,
      meta: { align: "right" }
    },
    {
      accessorKey: "avgCostPrice",
      header: "Avg Cost Price",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: colors.red600 }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 130,
      meta: { align: "right" }
    },
    {
      accessorKey: "avgSellPrice",
      header: "Avg Sell Price",
      cell: ({ getValue }) => (
        <span className="font-semibold block text-right" style={{ color: colors.green600 }}>
          {formatCurrency(getValue())}
        </span>
      ),
      size: 130,
      meta: { align: "right" }
    },
    {
      id: "profit_margin",
      header: "Profit Margin",
      cell: ({ row }) => {
        const costPrice = Number(row.original.avgCostPrice);
        const sellPrice = Number(row.original.avgSellPrice);
        const margin = costPrice > 0 ? ((sellPrice - costPrice) / costPrice) * 100 : 0;

        return (
          <span
            className="font-semibold block text-right"
            style={{ color: getMarginColor(margin) }}
          >
            {margin.toFixed(1)}%
          </span>
        );
      },
      size: 120,
      meta: { align: "right" }
    },
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
