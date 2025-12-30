import { useMemo } from "react";
import { format } from "date-fns";

/**
 * Hook for Payment Filter Options
 * Based on backend filters: type, dateFrom, dateTo.
 */
function usePaymentFilterOptions() {
  // Static options for Payment Type (Debit / Credit)
  const typeOptions = useMemo(
    () => [
      { value: "", label: "All Types" },
      { value: "RECEIVED", label: "Received (Credit In)" },
      { value: "PAID", label: "Paid (Debit Out)" },
    ],
    []
  );

  // Static date placeholder options for UI components that handle date pickers
  // The actual value bindings (dateFrom, dateTo) will be managed by form state in the page component
  const currentDate = format(new Date(), "yyyy-MM-dd");

  return [
    {
      key: "type",
      type: "select",
      label: "Payment Type",
      placeholder: "All Types",
      options: typeOptions,
    },
    {
      key: "dateFrom",
      type: "date",
      label: "From Date",
      placeholder: "Start Date",
      defaultValue: "",
      max: currentDate, // prevent future dates
    },
    {
      key: "dateTo",
      type: "date",
      label: "To Date",
      placeholder: "End Date",
      defaultValue: "",
      max: currentDate,
    },
  ];
}

export default usePaymentFilterOptions;
export { usePaymentFilterOptions };
