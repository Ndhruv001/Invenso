/**
 * @file ProductsSummaryStats.jsx
 * @description Provides a reusable StatCard component for displaying individual statistics and a container component (ProductsSummaryStats) to render a collection of these cards.
 */

import React, { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Package
} from "lucide-react";
import useTheme from "@/hooks/useTheme";

/**
 * @typedef {Object} ThemeProps
 * @property {string} [card] - Tailwind CSS classes for card background (e.g., 'bg-white').
 * @property {string} [border] - Tailwind CSS classes for border color (e.g., 'border-gray-200').
 * @property {string} [shadow] - Tailwind CSS classes for shadow (e.g., 'shadow-lg').
 * @property {Object} [text] - Text color configuration.
 * @property {string} [text.primary] - Tailwind CSS classes for primary text color (e.g., 'text-gray-900').
 * @property {string} [text.secondary] - Tailwind CSS classes for secondary text color (e.g., 'text-gray-600').
 */

/**
 * @typedef {Object} StatCardProps
 * @property {string} title - The title of the statistic.
 * @property {string|number} value - The main value of the statistic.
 * @property {string} [subtitle] - Optional subtitle or descriptive text.
 * @property {React.ElementType} [icon] - Lucide icon component to display.
 * @property {'default' | 'success' | 'warning' | 'danger'} [color='default'] - Color variant for the card's text and icon.
 * @property {number} [trend] - A numerical value indicating a trend (positive for up, negative for down). If undefined, trend is not shown.
 * @property {() => void} [onClick] - Callback function when the card is clicked for drill-down.
 * @property {boolean} [loading=false] - If true, displays a loading placeholder.
 */

/**
 * StatCard - A reusable card component for displaying individual statistics.
 * It automatically integrates with the application's theme using `useTheme`.
 *
 * @param {StatCardProps} props - The component props.
 * @returns {JSX.Element} The StatCard component.
 */
const StatCard = React.memo(
  ({ title, value, subtitle, icon: Icon, trend, color = "default", onClick, loading = false }) => {
    const { theme } = useTheme();

    const colorClasses = useMemo(() => {
      const colors = {
        default: {
          value: theme?.text?.primary || "text-gray-900",
          subtitle: theme?.text?.secondary || "text-gray-600",
          icon: theme?.text?.secondary || "text-gray-500"
        },
        success: {
          value: "text-green-600",
          subtitle: "text-green-500",
          icon: "text-green-500"
        },
        warning: {
          value: "text-yellow-600",
          subtitle: "text-yellow-500",
          icon: "text-yellow-500"
        },
        danger: {
          value: "text-red-600",
          subtitle: "text-red-500",
          icon: "text-red-500"
        }
      };
      return colors[color] || colors.default;
    }, [color, theme]); // Depend on theme as well

    return (
      <div
        className={`${theme?.card || "bg-white"} ${theme?.border || "border-gray-200"} border rounded-lg p-4 ${
          onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md" : ""
        } ${loading ? "animate-pulse" : ""}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? e => e.key === "Enter" && onClick() : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${theme?.text?.secondary || "text-gray-600"}`}>
              {title}
            </h3>

            <div className="mt-1 flex items-baseline">
              <p className={`text-2xl font-bold ${colorClasses.value}`}>
                {loading ? "---" : value}
              </p>

              {trend !== undefined && ( // Only show trend if it's explicitly provided
                <div
                  className={`ml-2 flex items-center ${
                    trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {trend > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : null}
                  <span className="ml-1 text-xs">{Math.abs(trend).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {subtitle && <p className={`mt-1 text-xs ${colorClasses.subtitle}`}>{subtitle}</p>}
          </div>

          {Icon && <Icon className={`h-8 w-8 opacity-80 ${colorClasses.icon}`} />}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export default StatCard;
export { StatCard };
