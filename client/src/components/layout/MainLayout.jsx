// scenes/app-layout/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import useTheme from "@/hooks/useTheme";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  // Close sidebar when clicking outside or on desktop
  useEffect(() => {
    // Close sidebar on mobile when route changes
    setIsSidebarOpen(false);

    const handleResize = () => {
      // Closes sidebar if it's open on desktop, preventing a persistent overlay
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  return (
    <div className={`fixed inset-0 flex ${theme.bg} transition-colors duration-300`}>
      {/* Sidebar - Fixed position */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Navbar - Fixed at top */}
        <Navbar setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content - Scrollable area */}
        <main className={`flex-1 ${theme.bg}`}>
          <div className="max-w-full mx-auto p-4 lg:p-6 min-h-full overflow-hidden">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
export { MainLayout };
