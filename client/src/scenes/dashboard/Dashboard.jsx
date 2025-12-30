import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Truck, 
  AlertTriangle,
  Plus,
  X,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Enhanced Theme Hook
const useTheme = () => ({
  // Backgrounds
  bg: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
    dark: 'bg-gray-900',
    card: 'bg-white'
  },
  
  // Text Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    white: 'text-white',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600'
  },

  // Borders
  border: {
    primary: 'border-gray-200',
    secondary: 'border-gray-300',
    light: 'border-gray-100'
  },

  // Interactive States
  hover: {
    bg: 'hover:bg-gray-50',
    shadow: 'hover:shadow-lg',
    text: 'hover:text-gray-900',
    border: 'hover:border-gray-300'
  },

  // Accent Colors
  accent: {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    light: 'bg-blue-50'
  },

  // Status Colors
  status: {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    }
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
});

// Dummy Data
const statsData = {
  todaySales: { value: 45200, trend: 12.5, isPositive: true },
  todayPurchases: { value: 28600, trend: -5.2, isPositive: false },
  paymentsIn: { value: 52800, trend: 8.9, isPositive: true },
  paymentsOut: { value: 31200, trend: 15.3, isPositive: false },
  profitLoss: { value: 14000, isProfit: true },
  todayExpense: { value: 8500 }
};

const transportationData = [
  { id: 1, vehicle: 'Truck A-123', cost: 2500, destination: 'Delhi - Mumbai', date: '2025-08-17', driver: 'Raj Kumar', status: 'In Transit' },
  { id: 2, vehicle: 'Van B-456', cost: 1200, destination: 'Local Delivery', date: '2025-08-17', driver: 'Amit Singh', status: 'Delivered' },
  { id: 3, vehicle: 'Truck C-789', cost: 3200, destination: 'Mumbai - Bangalore', date: '2025-08-17', driver: 'Suresh Patel', status: 'Loading' },
  { id: 4, vehicle: 'Bike D-101', cost: 500, destination: 'City Center', date: '2025-08-17', driver: 'Ravi Kumar', status: 'Completed' },
  { id: 5, vehicle: 'Truck E-202', cost: 4500, destination: 'Kolkata - Chennai', date: '2025-08-17', driver: 'Manoj Yadav', status: 'Scheduled' }
];

const stockAlertsData = [
  { id: 1, product: 'Widget A', currentStock: 0, minStock: 50, category: 'Electronics', location: 'Warehouse A' },
  { id: 2, product: 'Component B', currentStock: 5, minStock: 25, category: 'Hardware', location: 'Warehouse B' },
  { id: 3, product: 'Tool C', currentStock: 15, minStock: 20, category: 'Tools', location: 'Store 1' },
  { id: 4, product: 'Material D', currentStock: 0, minStock: 100, category: 'Raw Materials', location: 'Warehouse C' },
  { id: 5, product: 'Device E', currentStock: 8, minStock: 30, category: 'Electronics', location: 'Store 2' },
  { id: 6, product: 'Part F', currentStock: 3, minStock: 15, category: 'Hardware', location: 'Warehouse A' }
];

const salesPurchasesTrend = [
  { month: 'Jan', sales: 45000, purchases: 32000 },
  { month: 'Feb', sales: 52000, purchases: 38000 },
  { month: 'Mar', sales: 48000, purchases: 35000 },
  { month: 'Apr', sales: 61000, purchases: 42000 },
  { month: 'May', sales: 55000, purchases: 39000 },
  { month: 'Jun', sales: 67000, purchases: 48000 }
];

const categoryDistribution = [
  { name: 'Electronics', value: 35, color: '#3B82F6' },
  { name: 'Hardware', value: 25, color: '#10B981' },
  { name: 'Tools', value: 20, color: '#F59E0B' },
  { name: 'Raw Materials', value: 20, color: '#EF4444' }
];

const profitExpenseData = [
  { month: 'Jan', profit: 25000, expense: 18000 },
  { month: 'Feb', profit: 30000, expense: 22000 },
  { month: 'Mar', profit: 28000, expense: 20000 },
  { month: 'Apr', profit: 35000, expense: 26000 },
  { month: 'May', profit: 32000, expense: 24000 },
  { month: 'Jun', profit: 38000, expense: 29000 }
];

// Stat Card Component
const StatCard = ({ title, value, trend, icon: Icon, isPositive, isProfit, theme }) => (
  <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} ${theme.hover.shadow} transition-all duration-200 min-w-0`}>
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium truncate`}>{title}</p>
        <p className={`${theme.text.primary} text-lg lg:text-2xl font-bold mt-2 truncate`}>
          ₹{value?.toLocaleString()}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 mr-1 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-500 mr-1 flex-shrink-0" />
            )}
            <span className={`text-xs lg:text-sm font-medium ${isPositive ? theme.text.success : theme.text.danger}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
        {isProfit !== undefined && (
          <div className="flex items-center mt-2">
            <span className={`text-xs lg:text-sm font-medium ${isProfit ? theme.text.success : theme.text.danger}`}>
              {isProfit ? 'Profit' : 'Loss'}
            </span>
          </div>
        )}
      </div>
      <div className={`${theme.bg.secondary} p-2 lg:p-3 rounded-xl flex-shrink-0 ml-2`}>
        <Icon className={`h-4 w-4 lg:h-6 lg:w-6 ${theme.text.secondary}`} />
      </div>
    </div>
  </div>
);

// Expense Modal Component
const ExpenseModal = ({ isOpen, onClose, theme }) => {
  const [expense, setExpense] = useState({ description: '', amount: '', category: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.bg.primary} rounded-2xl p-4 lg:p-6 w-full max-w-md ${theme.shadow.lg} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`${theme.text.primary} text-lg font-semibold`}>Add Expense</h3>
          <button 
            onClick={onClose}
            className={`${theme.text.secondary} ${theme.hover.text} transition-colors p-1`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={`${theme.text.secondary} text-sm font-medium block mb-2`}>
              Description
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 ${theme.border.primary} border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
              placeholder="Enter expense description"
              value={expense.description}
              onChange={(e) => setExpense({...expense, description: e.target.value})}
            />
          </div>
          
          <div>
            <label className={`${theme.text.secondary} text-sm font-medium block mb-2`}>
              Amount
            </label>
            <input
              type="number"
              className={`w-full px-4 py-3 ${theme.border.primary} border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
              placeholder="Enter amount"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
            />
          </div>
          
          <div>
            <label className={`${theme.text.secondary} text-sm font-medium block mb-2`}>
              Category
            </label>
            <select
              className={`w-full px-4 py-3 ${theme.border.primary} border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
              value={expense.category}
              onChange={(e) => setExpense({...expense, category: e.target.value})}
            >
              <option value="">Select category</option>
              <option value="transport">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="supplies">Supplies</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 ${theme.border.primary} border rounded-xl ${theme.text.secondary} ${theme.hover.bg} transition-colors font-medium`}
          >
            Cancel
          </button>
          <button
            className={`flex-1 px-4 py-3 ${theme.accent.primary} ${theme.accent.hover} ${theme.text.white} rounded-xl transition-colors font-medium`}
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const theme = useTheme();
  const [chartView, setChartView] = useState('sales'); // 'sales' or 'purchases'
  const [timeFilter, setTimeFilter] = useState('month'); // 'day', 'week', 'month', 'year'
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  return (
    <div className={`min-h-screen ${theme.bg.secondary} overflow-x-auto`}>
      <div className="min-w-[1200px] p-4 lg:p-6">
        <div className="max-w-none space-y-6 lg:space-y-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className={`${theme.text.primary} text-2xl lg:text-3xl font-bold`}>Dashboard</h1>
              <p className={`${theme.text.secondary} text-base lg:text-lg mt-1`}>Welcome to Invenso Analytics</p>
            </div>
            <div className={`${theme.bg.primary} px-4 py-2 rounded-xl ${theme.border.primary} border flex items-center space-x-2 w-fit`}>
              <Calendar className={`h-5 w-5 ${theme.text.secondary}`} />
              <span className={`${theme.text.secondary} font-medium text-sm lg:text-base`}>Today: Aug 17, 2025</span>
            </div>
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
            <StatCard
              title="Today Sales"
              value={statsData.todaySales.value}
              trend={statsData.todaySales.trend}
              icon={TrendingUp}
              isPositive={statsData.todaySales.isPositive}
              theme={theme}
            />
            <StatCard
              title="Today Purchases"
              value={statsData.todayPurchases.value}
              trend={statsData.todayPurchases.trend}
              icon={Package}
              isPositive={statsData.todayPurchases.isPositive}
              theme={theme}
            />
            <StatCard
              title="Payments In"
              value={statsData.paymentsIn.value}
              trend={statsData.paymentsIn.trend}
              icon={TrendingUp}
              isPositive={statsData.paymentsIn.isPositive}
              theme={theme}
            />
            <StatCard
              title="Payments Out"
              value={statsData.paymentsOut.value}
              trend={statsData.paymentsOut.trend}
              icon={TrendingDown}
              isPositive={!statsData.paymentsOut.isPositive}
              theme={theme}
            />
            <StatCard
              title="Profit & Loss"
              value={statsData.profitLoss.value}
              icon={DollarSign}
              isProfit={statsData.profitLoss.isProfit}
              theme={theme}
            />
            <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} ${theme.hover.shadow} transition-all duration-200 min-w-0`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium truncate`}>Today Expense</p>
                  <p className={`${theme.text.primary} text-lg lg:text-2xl font-bold mt-2 truncate`}>
                    ₹{statsData.todayExpense.value.toLocaleString()}
                  </p>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className={`mt-3 flex items-center space-x-1 px-3 py-1.5 ${theme.accent.primary} ${theme.accent.hover} ${theme.text.white} rounded-lg text-xs lg:text-sm font-medium transition-colors`}
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className={`${theme.bg.secondary} p-2 lg:p-3 rounded-xl flex-shrink-0 ml-2`}>
                  <DollarSign className={`h-4 w-4 lg:h-6 lg:w-6 ${theme.text.secondary}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Sales/Purchases Trend Chart */}
            <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} min-w-0`}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3">
                  <LineChart className={`h-5 w-5 ${theme.text.secondary}`} />
                  <h3 className={`${theme.text.primary} text-lg font-semibold`}>Sales & Purchases Trend</h3>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className={`px-3 py-2 ${theme.border.primary} border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                  <div className={`flex ${theme.bg.secondary} rounded-lg p-1`}>
                    <button
                      onClick={() => setChartView('sales')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        chartView === 'sales' ? `${theme.accent.primary} ${theme.text.white}` : `${theme.text.secondary}`
                      }`}
                    >
                      Sales
                    </button>
                    <button
                      onClick={() => setChartView('purchases')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        chartView === 'purchases' ? `${theme.accent.primary} ${theme.text.white}` : `${theme.text.secondary}`
                      }`}
                    >
                      Purchases
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesPurchasesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey={chartView} 
                      stroke={chartView === 'sales' ? '#10b981' : '#3b82f6'} 
                      strokeWidth={3}
                      dot={{ fill: chartView === 'sales' ? '#10b981' : '#3b82f6', strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution */}
            <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} min-w-0`}>
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className={`h-5 w-5 ${theme.text.secondary}`} />
                <h3 className={`${theme.text.primary} text-lg font-semibold`}>Stock Distribution</h3>
              </div>
              <div className="w-full h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit vs Expense Analysis */}
            <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} min-w-0`}>
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className={`h-5 w-5 ${theme.text.secondary}`} />
                <h3 className={`${theme.text.primary} text-lg font-semibold`}>Profit vs Expense</h3>
              </div>
              <div className="w-full h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Alerts Chart */}
            <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md} min-w-0`}>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className={`h-5 w-5 ${theme.text.secondary}`} />
                <h3 className={`${theme.text.primary} text-lg font-semibold`}>Stock Alerts Overview</h3>
              </div>
              <div className="space-y-4">
                {stockAlertsData.slice(0, 4).map((item) => {
                  const stockPercentage = (item.currentStock / item.minStock) * 100;
                  const isOutOfStock = item.currentStock === 0;
                  const isLowStock = item.currentStock > 0 && item.currentStock <= item.minStock * 0.3;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <p className={`${theme.text.primary} font-medium text-sm`}>{item.product}</p>
                        <p className={`${theme.text.muted} text-xs`}>{item.category}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            isOutOfStock ? theme.text.danger : isLowStock ? theme.text.warning : theme.text.success
                          }`}>
                            {item.currentStock}
                          </p>
                          <p className={`text-xs ${theme.text.muted}`}>/ {item.minStock}</p>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transportation Table */}
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-4 lg:p-6 ${theme.shadow.md}`}>
            <div className="flex items-center space-x-3 mb-6">
              <Truck className={`h-5 w-5 ${theme.text.secondary}`} />
              <h3 className={`${theme.text.primary} text-lg font-semibold`}>Today's Transportation</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className={`${theme.bg.secondary}`}>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>SI</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Vehicle</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Driver</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Cost</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Route</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Date</th>
                    <th className={`${theme.text.secondary} text-left py-3 px-4 font-medium text-sm`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transportationData.map((item, index) => (
                    <tr key={item.id} className={`${theme.border.primary} border-t ${theme.hover.bg} transition-colors`}>
                      <td className={`${theme.text.primary} py-3 px-4 text-sm`}>{index + 1}</td>
                      <td className={`${theme.text.primary} py-3 px-4 text-sm font-medium`}>{item.vehicle}</td>
                      <td className={`${theme.text.secondary} py-3 px-4 text-sm`}>{item.driver}</td>
                      <td className={`${theme.text.primary} py-3 px-4 text-sm font-medium`}>₹{item.cost.toLocaleString()}</td>
                      <td className={`${theme.text.secondary} py-3 px-4 text-sm`}>{item.destination}</td>
                      <td className={`${theme.text.secondary} py-3 px-4 text-sm`}>{item.date}</td>
                      <td className={`py-3 px-4 text-sm`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Completed' || item.status === 'Delivered'
                            ? `${theme.status.success.bg} ${theme.status.success.text}`
                            : item.status === 'In Transit' || item.status === 'Loading'
                            ? `${theme.status.warning.bg} ${theme.status.warning.text}`
                            : `${theme.status.danger.bg} ${theme.status.danger.text}`
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        theme={theme} 
      />
    </div>
  );
};

export default Dashboard;