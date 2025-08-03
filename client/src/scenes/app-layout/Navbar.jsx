import React from "react";
import { Menu, Bell, Download, Plus } from "lucide-react";
import useTheme from "../../hooks/useTheme";

const Navbar = ({ setIsSidebarOpen, title }) => {
  const { theme } = useTheme();

  return (
    <header
      className={`${theme.header} ${theme.border} border-b px-4 lg:px-6 py-4 shadow-sm animate-slide-down`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            className={`lg:hidden p-2 rounded-lg ${theme.hover} transition-colors duration-200 mr-4`}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className={`w-5 h-5 ${theme.text.secondary}`} />
          </button>
          <h1 className={`text-xl lg:text-2xl font-bold ${theme.text.primary}`}>{title}</h1>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            className={`relative p-2 ${theme.text.muted} hover:${theme.text.secondary} transition-all duration-200 ${theme.hover} rounded-lg`}
          >
            <Bell className="w-5 h-5 hover:rotate-12 transition-transform duration-200" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <button
            className={`hidden sm:flex items-center space-x-2 px-3 lg:px-4 py-2 ${theme.card} ${theme.hover} ${theme.border} border rounded-lg transition-all duration-200 hover:shadow-md`}
          >
            <Download className={`${theme.text.primary} w-4 h-4 `} />
            <span className={`${theme.text.primary} text-sm font-medium hidden lg:inline`}>
              Export CSV
            </span>
          </button>

          <button
            className={`flex items-center space-x-2 px-3 lg:px-4 py-2 bg-gradient-to-r ${theme.accent} text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Create Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
