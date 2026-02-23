import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Plus,
  ShoppingCart,
  Package2,
  FolderPlus,
  RotateCcw,
  UserPlus,
  Truck as TruckIcon,
  UserCheck,
  DollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Package,
  Eye,
  EyeOff,
  Ticket
} from "lucide-react";

// Custom Hooks and Helpers
import useTheme from "@/hooks/useTheme";
import getPageTitle from "@/lib/helpers/getPageTitle";
import getActionButtons from "@/lib/helpers/getActionButtons";
import { useUIAction } from "@/context/UIActionContext"; // ✅ NEW

// Mapping of icon names to Lucide icon components
const iconMap = {
  Plus,
  ShoppingCart,
  FolderPlus,
  Package,
  Package2,
  RotateCcw,
  UserPlus,
  ArrowDownToLine,
  Receipt,
  DollarSign,
  ArrowUpFromLine,
  TruckIcon,
  UserCheck,
  Ticket
};
import { useHideScreenContext } from "@/context/HideScreenContext.jsx";

const Navbar = ({ setIsSidebarOpen }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { fireAction } = useUIAction(); // ✅ NEW
  const { toggleScreenHide, isScreenHidden } = useHideScreenContext();

  const title = getPageTitle(location.pathname);
  const actionButtons = getActionButtons(location.pathname);

  const PrimaryIcon = iconMap[actionButtons?.primary?.icon] || Plus;
  const SecondaryIcon = iconMap[actionButtons?.secondary?.icon] || ShoppingCart;

  const handleActionClick = button => {
    if (!button?.route) return;

    // Step 1: Navigate to correct module page
    navigate(button.route);

    // Step 2: Trigger action event
    fireAction({
      type: button.type,
      resource: button.resource,
      payload: button.payload || null
    });
  };

  return (
    <header
      className={`${theme.header} ${theme.border} border-b p-2 flex-shrink-0 z-30 shadow-sm animate-slide-down`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Sidebar Toggle + Title */}
        <div className="flex items-center min-w-0 flex-1">
          <button
            className={`lg:hidden p-2 rounded-lg ${theme.hover} transition-colors cursor-pointer duration-200 mr-3 flex-shrink-0`}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className={`w-5 h-5 ${theme.text.secondary}`} />
          </button>
          <h1 className={`text-lg lg:text-xl font-bold ${theme.text.primary} truncate`}>{title}</h1>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <button
            onClick={toggleScreenHide}
            title="Hide Screen (Ctrl + H)"
            className={`flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95
             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
             ${isScreenHidden ? "bg-blue-500 text-white" : `${theme.bg.secondary} ${theme.text.primary}`}
              `}
            style={{ cursor: "pointer" }}
          >
            {isScreenHidden ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>

          {/* 🔔 Notification Bell */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `relative p-2 transition-all duration-200 rounded-lg flex-shrink-0 ${
                isActive
                  ? `${theme.accent.split(" ")[1]} text-red-500`
                  : `${theme.text.muted} hover:${theme.text.secondary} ${theme.hover}`
              }`
            }
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 hover:rotate-12 transition-transform duration-200" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </NavLink>

          {/* 🟡 Secondary Action Button */}
          {actionButtons?.secondary && (
            <button
              onClick={() => handleActionClick(actionButtons.secondary)}
              className={`hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 ${theme.card} ${theme.hover} ${theme.border} border rounded-lg transition-all duration-200 hover:shadow-md group flex-shrink-0`}
            >
              <SecondaryIcon
                className={`${theme.text.primary} w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}
              />
              <span
                className={`${theme.text.primary} text-sm font-medium hidden lg:inline whitespace-nowrap`}
              >
                {actionButtons.secondary.label}
              </span>
            </button>
          )}

          {/* 🟢 Primary Action Button */}
          {actionButtons?.primary && (
            <button
              onClick={() => handleActionClick(actionButtons.primary)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r ${theme.accent} text-white rounded-lg hover:${theme.accentFrom} hover:${theme.accentTo} transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group flex-shrink-0`}
            >
              <PrimaryIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
              <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">
                {actionButtons.primary.label}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
export { Navbar };
