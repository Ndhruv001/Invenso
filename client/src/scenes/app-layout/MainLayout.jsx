import React, { useState } from "react";
import useTheme from "../../hooks/useTheme";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const { theme: currentTheme } = useTheme();

  return (
    <>
      <div
        className={`h-screen w-screen ${currentTheme.bg} flex overflow-hidden transition-all duration-500`}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar setIsSidebarOpen={setIsSidebarOpen} title="Dashboard" />

          <div className="flex-1 overflow-auto p-4 lg:p-6 text-center">
            Oops! Content goes here.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-slide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progress-bar {
          from {
            width: 0;
          }
        }

        @keyframes table-row {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes page-enter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-slide {
          animation: fade-in-slide 0.6s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }

        .animate-progress-bar {
          animation: progress-bar 1s ease-out forwards;
        }

        .animate-table-row {
          animation: table-row 0.5s ease-out forwards;
        }

        .animate-page-enter {
          animation: page-enter 0.7s ease-out forwards;
        }

        .logo-3d {
          transform-style: preserve-3d;
          transition: all 0.3s ease;
        }

        .logo-3d:hover {
          transform: rotateX(15deg) rotateY(15deg) scale(1.1);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .sidebar-item {
          transform-origin: left center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover {
          transform: translateX(8px) scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sidebar-item:active {
          transform: translateX(4px) scale(0.98);
        }

        /* Theme transition */
        * {
          transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
        }
      `}</style>
    </>
  );
};

export default MainLayout;
