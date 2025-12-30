/**
 * @file LoadingSpinner.jsx
 * @description A versatile, reusable loading spinner with customizable size, color, and overlay functionality.
 */

import React, { useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {'sm' | 'md' | 'lg' | 'xl'} [size='md'] - The size of the spinner.
 * @property {'primary' | 'secondary' | 'white'} [variant='primary'] - The color variant of the spinner.
 * @property {string} [message] - An optional message to display below the spinner.
 * @property {boolean} [overlay=false] - If true, the spinner is a full-screen overlay.
 * @property {boolean} [backdrop=true] - If true, shows a semi-transparent backdrop with the overlay.
 * @property {Object} [theme] - An object containing theme-specific classes (e.g., theme.text.primary).
 * @property {string} [className=''] - Additional CSS classes for the container.
 */

/**
 * LoadingSpinner - A React component for displaying a loading animation.
 *
 * @param {LoadingSpinnerProps} props - The component props.
 * @returns {JSX.Element} The loading spinner component.
 */
const LoadingSpinner = React.memo(
  ({
    size = "md",
    variant = "primary",
    message,
    overlay = false,
    backdrop = true,
    className = "",
    ...props
  }) => {
    const { theme } = useTheme();
    const sizeClasses = useMemo(() => {
      const sizes = {
        sm: { spinner: "h-4 w-4", text: "text-sm" },
        md: { spinner: "h-8 w-8", text: "text-base" },
        lg: { spinner: "h-12 w-12", text: "text-lg" },
        xl: { spinner: "h-16 w-16", text: "text-xl" }
      };
      return sizes[size] || sizes.md;
    }, [size]);

    const variantClasses = useMemo(() => {
      const variants = {
        primary: theme?.text?.primary || "text-purple-600",
        secondary: theme?.text?.secondary || "text-gray-500",
        white: "text-white"
      };
      return variants[variant] || variants.primary;
    }, [variant, theme]);

    const SpinnerSVG = () => (
      <svg
        className={`animate-spin ${sizeClasses.spinner} ${variantClasses}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const BaseSpinner = () => (
      <div
        className={`flex flex-col items-center justify-center space-y-2 ${className}`}
        {...props}
      >
        <SpinnerSVG />
        {message && (
          <p
            className={`${sizeClasses.text} font-medium ${theme?.text?.secondary || "text-gray-600"}`}
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    );

    if (overlay) {
      return (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            backdrop ? "bg-black bg-opacity-50" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={message || "Loading"}
        >
          <div
            className={`rounded-lg p-6 ${backdrop ? theme?.card || "bg-white" : ""} ${
              backdrop ? theme?.shadow || "shadow-lg" : ""
            }`}
          >
            <BaseSpinner />
          </div>
        </div>
      );
    }

    return <BaseSpinner />;
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
export default LoadingSpinner;
