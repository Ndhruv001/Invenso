// components/ui/DataErrorPage.jsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTheme from "@/hooks/useTheme";

const DataErrorPage = ({ errorMessage = "Something went wrong.", isFetching, onRetry }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-[40vh] flex items-center justify-center p-4 sm:p-6 lg:p-8`}>
      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-xl rounded-lg p-4 sm:p-6 ${theme.card} ${theme.border} shadow-lg border transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6">
          <AlertCircle className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 text-red-500`} />
          <div className="flex-1 text-center sm:text-left">
            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Unable to load data</h3>
            <p className={`text-sm sm:text-base ${theme.text.secondary} mb-2 sm:mb-2`}>{errorMessage}</p>

            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 sm:gap-4">
              <button
                onClick={onRetry}
                disabled={isFetching}
                className={`w-full sm:w-auto px-6 py-2.5 cursor-pointer bg-gradient-to-r ${theme.accent} hover:${theme.accentFrom} hover:${theme.accentTo} text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isFetching ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    "Try Again"
                  )}
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full sm:w-auto px-6 py-2.5 border cursor-pointer ${theme.border} rounded-lg font-medium ${theme.text.primary} ${theme.hover} transition-all duration-300`}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataErrorPage;
export { DataErrorPage };