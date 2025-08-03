import React from "react";
import {
  BarChart3,
  MapPin,
  Package,
  Package2,
  FileText,
  DollarSign,
  Truck,
  Users,
  User,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  ChevronRight,
  X
} from "lucide-react";
import useTheme from "../../hooks/useTheme";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "dashboard" },
  { icon: MapPin, label: "Logistics", path: "logistics" },
  { icon: Package, label: "Orders", path: "orders" },
  { icon: Package2, label: "Inventory", path: "inventory" },
  { icon: FileText, label: "Report", path: "report" },
  { icon: DollarSign, label: "Cashflow", path: "cashflow" },
  { icon: Truck, label: "Tracking", path: "tracking", hasSubmenu: true },
  { icon: Users, label: "Customers", path: "customers" },
  { icon: User, label: "User Guide", path: "guide" },
  { icon: HelpCircle, label: "FAQ", path: "faq" },
  { icon: Settings, label: "Help Center", path: "help" }
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeItem, setActiveItem }) => {
  const { theme: currentTheme, switchTheme } = useTheme();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`${currentTheme.sidebar} ${currentTheme.border} border-r shadow-lg flex flex-col w-64 fixed lg:relative z-50 h-full transform transition-all duration-500 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className={`p-4 lg:p-4 border-b ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${currentTheme.accent} rounded-xl flex items-center justify-center mr-3 cursor-pointer logo-3d transition-all duration-300 hover:scale-110`}
                onClick={switchTheme}
              >
                <Package className="w-6 h-6 text-white transition-transform duration-300" />
              </div>
              <span
                className={`text-xl font-bold bg-gradient-to-r ${currentTheme.text.primary} bg-clip-text`}
              >
                Invenso
              </span>
            </div>
            <button
              className={`lg:hidden p-2 rounded-lg ${currentTheme.hover} transition-colors duration-200`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className={`w-5 h-5 ${currentTheme.text.secondary}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={`p-4 border-b ${currentTheme.border}`}>
          <div className="relative group">
            <Search
              className={`w-4 h-4 ${currentTheme.text.muted} absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-500 transition-colors duration-200`}
            />
            <input
              type="text"
              placeholder="Search"
              className={`w-full pl-10 pr-4 py-2.5 ${currentTheme.card} ${currentTheme.border} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 ${currentTheme.hover} ${currentTheme.text.primary}`}
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${currentTheme.text.muted} font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.path)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group animate-fade-in-slide sidebar-item ${
                activeItem === item.path
                  ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg scale-105`
                  : `${currentTheme.text.secondary} ${currentTheme.hover} hover:scale-105 hover:translate-x-2`
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && (
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t ${currentTheme.border}`}>
          <div
            className={`flex items-center ${currentTheme.hover} rounded-lg p-2 transition-colors duration-200 cursor-pointer group`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm font-semibold">DR</span>
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${currentTheme.text.primary}`}>
                Dianne Russell
              </div>
              <div className={`text-xs ${currentTheme.text.muted}`}>Admin</div>
            </div>
            <button
              className={`${currentTheme.text.muted} hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all duration-200`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
