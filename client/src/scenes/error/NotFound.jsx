// scenes/error/NotFound.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import useTheme from "@/hooks/useTheme";

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen pb-24 flex items-center justify-center px-4 sm:px-6 lg:px-8 ${theme.background}`}
    >
      <div className="text-center space-y-6 max-w-lg w-full">
        {/* Title & Description */}
        <div className="space-y-2">
          <h1
            className={`text-7xl sm:text-8xl md:text-9xl font-bold ${theme.text.primary} opacity-20`}
          >
            404
          </h1>
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-semibold ${theme.text.primary}`}>
            Page Not Found
          </h2>
          <p className={`${theme.text.secondary} max-w-md mx-auto text-sm sm:text-base`}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NavLink
            to="/dashboard"
            className={`inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r ${theme.accent} text-white rounded-lg hover:${theme.accentFrom} hover:${theme.accentTo} transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </NavLink>

          <button
            onClick={() => window.history.back()}
            className={`inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 ${theme.card} ${theme.border} border rounded-lg ${theme.hover} ${theme.text.primary} transition-all cursor-pointer duration-200`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
export { NotFound };
