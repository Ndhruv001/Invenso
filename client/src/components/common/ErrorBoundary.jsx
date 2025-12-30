/**
 * @file ErrorBoundary.jsx
 * @description Responsive, theme-aware error boundary component with graceful UI, clear instructions, and developer-friendly debugging.
 */

import React, { useEffect } from "react";
import { XCircle, RefreshCcw } from "lucide-react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import useTheme from "@/hooks/useTheme";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { theme } = useTheme();
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  useEffect(() => {
    if (import.meta.env.NODE_ENV === "development") {
      console.error("🧨 Error caught by fallback:", error);
    }
  }, [error]);

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-6 ${theme.bg}`}>
      <div
        className={`w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl ${theme.card} p-6 sm:p-8 text-center shadow-lg border ${theme.border}`}
      >
        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className={`mb-3 text-base sm:text-lg font-bold ${theme.text.primary}`}>
          Something went wrong.
        </h2>

        <ul
          className={`mb-4 list-disc list-inside space-y-1 text-sm sm:text-base ${theme.text.secondary} text-left`}
        >
          <li>🔄 Try reloading the page.</li>
          <li>🏠 Go back to the dashboard.</li>
          <li>🔁 Attempt the action again.</li>
        </ul>

        {import.meta.env.VITE_NODE_ENV === "development" && error && (
          <pre
            className={`mb-4 max-h-40 overflow-x-auto rounded ${theme.text.primary} ${theme.bg} p-3 text-left text-xs border ${theme.border}`}
          >
            {error?.toString()}
          </pre>
        )}

        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className={`w-full rounded py-2 text-white bg-gradient-to-r ${theme.accent} transition hover:opacity-90 cursor-pointer`}
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className={`w-full rounded border ${theme.border} py-2 ${theme.text.primary} cursor-pointer ${theme.hover}`}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`flex items-center justify-center gap-2 w-full text-sm font-medium text-red-600 transition-all cursor-pointer duration-200 hover:text-red-800`}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Page
          </button>
        </div>

        <p className={`mt-4 text-xs ${theme.text.muted}`}>Error ID: {errorId}</p>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("📦 Error boundary logged:", error);
        console.error("📦 Component stack info:", info.componentStack);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export { ErrorBoundary };
export default ErrorBoundary;
