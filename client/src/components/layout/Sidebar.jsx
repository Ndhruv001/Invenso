import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Package,
  Package2,
  ShoppingCart,
  DollarSign,
  Truck,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Bell,
  Box,
  FolderOpen,
  Archive,
  ShoppingBag,
  RotateCcw,
  Users,
  CreditCard,
  Receipt,
  PiggyBank,
  UserPlus,
  FileSearch,
  Settings
} from "lucide-react";
import useTheme from "../../hooks/useTheme";
// import {}

const sidebarItems = [
  {
    icon: BarChart3,
    label: "Dashboard",
    path: "/dashboard"
  },
  {
    icon: Box,
    label: "Products",
    path: "/products",
    hasSubmenu: false,
  },
  {
    icon: ShoppingCart,
    label: "Purchases",
    path: "/purchases",
    hasSubmenu: true,
    submenu: [
      { label: "Purchases", path: "/purchases/purchases", icon: ShoppingBag },
      { label: "Purchase Returns", path: "/purchases/returns", icon: RotateCcw }
    ]
  },
  {
    icon: Package,
    label: "Sales",
    path: "/sales",
    hasSubmenu: true,
    submenu: [
      { label: "Sales", path: "/sales/sales", icon: ShoppingBag },
      { label: "Sales Returns", path: "/sales/returns", icon: RotateCcw }
    ]
  },
  {
    icon: DollarSign,
    label: "Accounting",
    path: "/accounting",
    hasSubmenu: true,
    submenu: [
      { label: "Parties", path: "/accounting/parties", icon: Users },
      { label: "Payments", path: "/accounting/payments", icon: CreditCard },
      { label: "Expenses", path: "/accounting/expenses", icon: Receipt },
    ]
  },
  {
    icon: Truck,
    label: "Transport",
    path: "/transport"
  },
  {
    icon: FileText,
    label: "Reports",
    path: "/reports"
  },
  {
    icon: Shield,
    label: "Admin",
    path: "/admin",
    hasSubmenu: true,
    submenu: [
      { label: "Audit Logs", path: "/admin/audits", icon: FileSearch },
      { label: "Inventory Logs", path: "/admin/inventories", icon: Package2 },
      { label: "Users", path: "/admin/users", icon: UserPlus },
      { label: "Settings", path: "/admin/settings", icon: Settings }
    ]
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/notifications"
  },
  {
    icon: HelpCircle,
    label: "Help",
    path: "/help"
  }
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { theme: currentTheme, switchTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleSubmenu = path => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleMobileClose = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {

  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleMobileClose}
      />

      {/* Sidebar */}
      <div
        className={`${currentTheme.sidebar} ${currentTheme.border} border-r shadow-lg w-64 fixed inset-y-0 left-0 z-50 lg:z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className={`p-4 lg:p-5 border-b ${currentTheme.border} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${currentTheme.accent} rounded-xl flex items-center justify-center mr-3 cursor-pointer logo-3d transition-all duration-300 hover:scale-110 flex-shrink-0`}
                onClick={switchTheme}
              >
                <Package className="w-6 h-6 text-white transition-transform duration-300" />
              </div>
              <span className={`text-xl font-bold ${currentTheme.text.primary} truncate`}>
                Invenso
              </span>
            </div>
            <button
              className={`lg:hidden p-2 rounded-lg cursor-pointer ${currentTheme.hover} transition-colors duration-200 flex-shrink-0`}
              onClick={handleMobileClose}
            >
              <X className={`w-5 h-5 ${currentTheme.text.secondary}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={`p-4 border-b ${currentTheme.border} flex-shrink-0`}>
          <div className="relative group">
            <Search
              className={`w-4 h-4 ${currentTheme.text.muted} absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200`}
            />
            <input
              type="text"
              placeholder="Search"
              className={`w-full pl-10 pr-4 py-2.5 ${currentTheme.card} ${currentTheme.border} border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${currentTheme.hover} ${currentTheme.text.primary}`}
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${currentTheme.text.muted} font-mono`}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item, index) => (
            <div key={item.label} style={{ animationDelay: `${index * 50}ms` }}>
              {item.hasSubmenu ? (
                <>
                  {/* Parent Menu Item */}
                  <button
                    onClick={() => toggleSubmenu(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group animate-fade-in-slide sidebar-item ${currentTheme.text.secondary} ${currentTheme.hover} hover:scale-105 hover:translate-x-2`}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {expandedItems[item.path] ? (
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 transition-transform duration-200 flex-shrink-0" />
                    )}
                  </button>

                  {/* Submenu Items */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedItems[item.path] ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 space-y-1">
                      {item.submenu?.map(subItem => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleMobileClose}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                              isActive
                                ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg scale-105`
                                : `${currentTheme.text.secondary} ${currentTheme.hover} hover:scale-105 hover:translate-x-2`
                            }`
                          }
                        >
                          {subItem.icon ? (
                            <subItem.icon className="w-3.5 h-3.5 mr-3 group-hover:scale-110 transition-transform duration-200 opacity-80 flex-shrink-0" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60 flex-shrink-0" />
                          )}
                          <span className="truncate">{subItem.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Regular Menu Item */
                <NavLink
                  to={item.path}
                  onClick={handleMobileClose}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group animate-fade-in-slide sidebar-item ${
                      isActive
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg scale-105`
                        : `${currentTheme.text.secondary} ${currentTheme.hover} hover:scale-105 hover:translate-x-2`
                    }`
                  }
                >
                  <div className="flex items-center min-w-0">
                    <item.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t ${currentTheme.border} flex-shrink-0`}>
          <div
            className={`flex items-center ${currentTheme.hover} rounded-lg p-2 transition-colors duration-200 cursor-pointer group`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <span className="text-white text-sm font-semibold">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${currentTheme.text.primary} truncate`}>
                Dianne Russell
              </div>
              <div className={`text-xs ${currentTheme.text.muted} truncate`}>Admin</div>
            </div>
            <NavLink
              to="/login"
              onClick={handleLogout}
              className={`${currentTheme.text.muted} hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all duration-200 flex-shrink-0`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
