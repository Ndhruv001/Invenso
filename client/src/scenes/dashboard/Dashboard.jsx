import React, { useState, useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, AlertTriangle, CreditCard, Package } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
  useDashboardSummary,
  useSalesTrend,
  useLowStockProducts,
  useTopSellingProducts,
  useRecentPayments
} from "@/hooks/useDashboards";
import { formatCurrency, formatDate } from "@/lib/helpers/formatters";
import { LowStockColumns } from "./LowStockColumns";
import { TopProductsColumns } from "./TopProductsColumns";
import { RecentPaymentsColumns } from "./RecentPaymentsColumns";
import DashboardSummaryStats from "./DashboardSummaryStats";

const Dashboard = () => {
  const { theme } = useTheme();
  const [salesRange, setSalesRange] = useState("7d");
  const [topProductsLimit, setTopProductsLimit] = useState(5);
  const [paymentsLimit, setPaymentsLimit] = useState(5);

  // Fetch all dashboard data
  const {
    data: dashboardSummary,
    isLoading: summaryLoading,
    isError: summaryError
  } = useDashboardSummary();
  const {
    data: salesTrend,
    isLoading: trendLoading,
    isError: trendError
  } = useSalesTrend(salesRange);
    console.log("🚀 ~ Dashboard ~ salesTrend:", salesTrend)
  const { data: lowStock, isLoading: stockLoading, isError: stockError } = useLowStockProducts();
  const {
    data: topProducts,
    isLoading: topLoading,
    isError: topError
  } = useTopSellingProducts(topProductsLimit);
    console.log("🚀 ~ Dashboard ~ topProducts:", topProducts)
  const {
    data: recentPayments,
    isLoading: paymentsLoading,
    isError: paymentsError
  } = useRecentPayments(paymentsLimit);
    console.log("🚀 ~ Dashboard ~ recentPayments:", recentPayments)

  // Memoized column definitions
  const lowStockColumns = useMemo(() => LowStockColumns(), []);
  const topProductsColumns = useMemo(() => TopProductsColumns(), []);
  const recentPaymentsColumns = useMemo(() => RecentPaymentsColumns(), []);

  // Initialize tables
  const lowStockTable = useReactTable({
    data: lowStock,
    columns: lowStockColumns.length > 0 ? lowStockColumns : [{ accessorKey: "dummy", header: "" }],
    getCoreRowModel: getCoreRowModel()
  });

  const topProductsTable = useReactTable({
    data: topProducts,
    columns:
      topProductsColumns.length > 0 ? topProductsColumns : [{ accessorKey: "dummy", header: "" }],
    getCoreRowModel: getCoreRowModel()
  });

  const paymentsTable = useReactTable({
    data: recentPayments,
    columns:
      recentPaymentsColumns.length > 0
        ? recentPaymentsColumns
        : [{ accessorKey: "dummy", header: "" }],
    getCoreRowModel: getCoreRowModel()
  });

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className={`${theme.card} p-6 rounded-xl ${theme.border} border animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonTable = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded"></div>
      ))}
    </div>
  );

  const SkeletonChart = () => <div className="h-64 bg-gray-100 rounded"></div>;

  // Error Display
  const ErrorDisplay = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
      <AlertTriangle className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );

  // Empty State Component
  const EmptyState = ({ icon: Icon, message }) => (
    <div className={`text-center py-8 ${theme.text.muted}`}>
      <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>{message}</p>
    </div>
  );

  // Table Renderer Component
  const TableRenderer = ({ table, isLoading, isError, isEmpty, emptyIcon, emptyMessage }) => {
    console.log("🚀 ~ TableRenderer ~ isEmpty:", isEmpty)
    if (isLoading) return <SkeletonTable />;
    if (isError) return <ErrorDisplay message="Failed to load data" />;
    if (isEmpty) return <EmptyState icon={emptyIcon} message={emptyMessage} />;

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table?.getHeaderGroups()?.map(headerGroup => (
              <tr key={headerGroup.id} className={`${theme.border} border-b`}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`text-left py-3 px-2 text-xs font-semibold ${theme.text.muted} uppercase tracking-wider`}
                  >
                    {header.isPlaceholder ? null : header.column.columnDef.header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`${theme.border} border-b last:border-b-0 ${theme.hover} transition-colors`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-3 px-2">
                    {cell.column.columnDef.cell
                      ? typeof cell.column.columnDef.cell === "function"
                        ? cell.column.columnDef.cell({
                            getValue: () => cell.getValue(),
                            row: cell.row
                          })
                        : cell.column.columnDef.cell
                      : cell.getValue()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary} p-6`}
    >
      {/* Summary Stats - Top Section */}
      <DashboardSummaryStats stats={dashboardSummary} />

      {/* Sales Trend Chart - Middle Section */}
      <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
            <TrendingUp className="w-5 h-5" />
            Sales Trend
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSalesRange("7d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                salesRange === "7d"
                  ? `bg-gradient-to-r ${theme.accent} text-white shadow-md`
                  : `${theme.text.secondary} ${theme.hover}`
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSalesRange("30d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                salesRange === "30d"
                  ? `bg-gradient-to-r ${theme.accent} text-white shadow-md`
                  : `${theme.text.secondary} ${theme.hover}`
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {trendLoading ? (
          <SkeletonChart />
        ) : trendError ? (
          <ErrorDisplay message="Failed to load sales trend data" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesTrend || []}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: theme.name === "Dark" ? "#fff" : "#6b7280" }}
                tickFormatter={date =>
                  new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                }
              />
              <YAxis
                tick={{ fill: theme.name === "Dark" ? "#fff" : "#6b7280" }}
                tickFormatter={value => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.name === "Dark" ? "#1f2937" : "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
                labelFormatter={date => formatDate(date)}
                formatter={value => [formatCurrency(value), ""]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="salesAmount"
                stroke="url(#salesGradient)"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Sales Amount"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="url(#profitGradient)"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two Column Section - Top Products & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Selling Products
            </h2>
            <select
              value={topProductsLimit}
              onChange={e => setTopProductsLimit(Number(e.target.value))}
              className={`px-3 py-1 rounded-lg text-sm ${theme.card} ${theme.border} border ${theme.text.secondary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
            </select>
          </div>

          <TableRenderer
            table={topProductsTable}
            isLoading={topLoading}
            isError={topError}
            isEmpty={!topProducts || topProducts.length === 0}
            emptyIcon={Package}
            emptyMessage="No sales data available"
          />
        </div>

        {/* Recent Payments */}
        <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
              <CreditCard className="w-5 h-5 text-blue-500" />
              Recent Payments
            </h2>
            <select
              value={paymentsLimit}
              onChange={e => setPaymentsLimit(Number(e.target.value))}
              className={`px-3 py-1 rounded-lg text-sm ${theme.card} ${theme.border} border ${theme.text.secondary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value={5}>Last 5</option>
              <option value={10}>Last 10</option>
            </select>
          </div>

          <TableRenderer
            table={paymentsTable}
            isLoading={paymentsLoading}
            isError={paymentsError}
            isEmpty={!recentPayments || recentPayments.length === 0}
            emptyIcon={CreditCard}
            emptyMessage="No recent payments"
          />
        </div>
      </div>

      {/* Full Width Section - Low Stock Alerts */}
      <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
        <h2 className={`text-xl font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Low Stock Alerts
        </h2>

        <TableRenderer
          table={lowStockTable}
          isLoading={stockLoading}
          isError={stockError}
          isEmpty={!lowStock || lowStock.length === 0}
          emptyIcon={Package}
          emptyMessage="All products are well stocked"
        />
      </div>
    </div>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
