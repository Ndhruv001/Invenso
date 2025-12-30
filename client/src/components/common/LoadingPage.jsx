// components/ui/LoadingPage.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import useTheme from "@/hooks/useTheme";

const LoadingPage = ({ message = "Loading...", fullscreen = true }) => {
  const { theme } = useTheme();

  const containerClass = fullscreen
    ? `min-h-[60vh] flex items-center justify-center px-4`
    : `flex items-center space-x-3`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClass}`}
    >
      <div
        className={`inline-flex items-center ${theme.card} ${theme.border} rounded-lg p-4 shadow-sm`}
        style={{ gap: "0.75rem" }}
      >
        <Loader2 className="animate-spin w-6 h-6" />
        <div className="text-left">
          <div className={`font-medium ${theme.text.primary}`}>{message}</div>
          <div className={`text-sm ${theme.text.secondary} opacity-80`}>Please wait a moment.</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
export {LoadingPage}