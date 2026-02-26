// components/ui/NoDataPage.jsx
import React from "react";
import { Database } from "lucide-react";
import useTheme from "@/hooks/useTheme";

const NoDataPage = ({
  title = "No records found",
  message = "There are no items to display yet."
}) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme.card} ${theme.border} border rounded-lg p-8 text-center`}>
      <div className="flex flex-col items-center justify-center gap-5">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${theme.text.primary === "text-white" ? "bg-gray-400" : "bg-gray-200"}`}
        >
          <Database className={`w-8 h-8 ${theme.text.secondary}`} />
        </div>
        <div>
          <h3 className={`${theme.text.secondary} text-lg font-semibold`}>{title}</h3>
          <p className={`${theme.text.muted}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NoDataPage;
export { NoDataPage };
