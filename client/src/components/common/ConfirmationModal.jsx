/**
 * @file ConfirmationModal.jsx
 * @description This component provides a highly customizable and accessible modal dialog
 * for requesting user confirmation before proceeding with an action. It supports
 * different visual variants (danger, warning, info) and handles loading states,
 * keyboard navigation (Escape key to close), and outside click detection.
 */

import React, { useEffect, useMemo } from "react";
import { AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";

/**
 * @typedef {Object} ThemeProps
 * @property {string} [accent] - Tailwind CSS classes for accent color (e.g., 'from-purple-500 to-cyan-500').
 * @property {string} [card] - Tailwind CSS classes for card background color (e.g., 'bg-white').
 * @property {Object} [text] - Text color configuration.
 * @property {string} [text.primary] - Tailwind CSS classes for primary text color (e.g., 'text-gray-900').
 * @property {string} [text.secondary] - Tailwind CSS classes for secondary text color (e.g., 'text-gray-500').
 * @property {string} [border] - Tailwind CSS classes for border color (e.g., 'border-gray-300').
 */

/**
 * ConfirmationModal - A reusable and accessible confirmation dialog component.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {string} props.title - The main title displayed at the top of the modal.
 * @param {string} props.message - The confirmation message or question presented to the user.
 * @param {Function} props.onConfirm - Callback function executed when the user confirms the action.
 * @param {Function} props.onCancel - Callback function executed when the user cancels the action.
 * @param {boolean} [props.isLoading=false] - If true, the modal indicates a loading state, disabling buttons.
 * @param {string} [props.confirmText='Confirm'] - The text displayed on the confirm button.
 * @param {string} [props.cancelText='Cancel'] - The text displayed on the cancel button.
 * @param {'danger' | 'warning' | 'info'} [props.variant='danger'] - Visual style of the modal, affecting icon, colors, and button styles.
 * @param {ThemeProps} [props.theme] - Optional theme object for custom styling.
 * @returns {JSX.Element|null} The ConfirmationModal component or null if not open.
 */
const ConfirmationModal = React.memo(
  ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger"
  }) => {
    const { theme } = useTheme();
    // Effect to handle keyboard events, specifically closing on 'Escape' key press.
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = e => {
        if (e.key === "Escape" && !isLoading) {
          onCancel();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    // Handler for clicking on the modal backdrop to close the modal.
    const handleBackdropClick = e => {
      if (e.target === e.currentTarget && !isLoading) {
        onCancel();
      }
    };

    // Memoized configuration for different modal variants (danger, warning, info).
    const variantConfig = useMemo(() => {
      const configs = {
        danger: {
          icon: XCircle,
          iconColor: "text-red-500",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          title: "text-red-900"
        },
        warning: {
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          title: "text-yellow-900"
        },
        info: {
          icon: AlertCircle,
          iconColor: "text-blue-500",
          confirmButton: `bg-gradient-to-r ${theme?.accent || "from-purple-500 to-cyan-500"} hover:from-purple-600 hover:to-cyan-600 text-white`,
          title: theme?.text?.primary || "text-gray-900"
        }
      };
      return configs[variant] || configs.info;
    }, [variant, theme]);

    // Do not render the modal if it's not open.
    if (!isOpen) return null;

    const IconComponent = variantConfig.icon;

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={handleBackdropClick} // Close on backdrop click
      >
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Content Container */}
          <div
            data-modal-content
            className={`relative rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}
          >
            <div className="sm:flex sm:items-start">
              {/* Variant Icon */}
              <div
                className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                  variant === "danger"
                    ? "bg-red-100"
                    : variant === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                } sm:mx-0 sm:h-10 sm:w-10`}
              >
                <IconComponent className={`h-6 w-6 ${variantConfig.iconColor}`} />
              </div>

              {/* Modal Text Content */}
              <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  id="modal-title"
                  className={`text-lg font-medium leading-6 ${variantConfig.title}`}
                >
                  {title}
                </h3>
                {message && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 gap-3 sm:mt-4 sm:flex sm:flex-row-reverse">
              {/* Confirm Button */}
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`inline-flex cursor-pointer w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm ${variantConfig.confirmButton}`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="white" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={`mt-3 inline-flex cursor-pointer w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto sm:text-sm`}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Assigning a display name for better debugging in React DevTools.
ConfirmationModal.displayName = "ConfirmationModal";

export { ConfirmationModal };
export default ConfirmationModal;
