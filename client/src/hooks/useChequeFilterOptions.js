import { format } from "date-fns";
import { CHEQUE_TYPE_OPTIONS } from "@/constants/CHEQUE_TYPES";
import { CHEQUE_STATUS_OPTIONS } from "@/constants/CHEQUE_STATUSES";

/**
 * Hook for Payment Filter Options
 * Based on backend filters: type, dateFrom, dateTo.
 */
function useChequeFilterOptions() {
  // Static date placeholder options for UI components that handle date pickers
  // The actual value bindings (dateFrom, dateTo) will be managed by form state in the page component
  const currentDate = format(new Date(), "yyyy-MM-dd");

  return [
    {
      key: "status",
      type: "select",
      label: "Cheque Status",
      placeholder: "All Types",
      options: CHEQUE_STATUS_OPTIONS
    },
    {
      key: "type",
      type: "select",
      label: "Cheque Type",
      placeholder: "All Types",
      options: CHEQUE_TYPE_OPTIONS
    },
    {
      key: "dateFrom",
      type: "date",
      label: "From Date",
      placeholder: "Start Date",
      defaultValue: "",
      max: currentDate // prevent future dates
    },
    {
      key: "dateTo",
      type: "date",
      label: "To Date",
      placeholder: "End Date",
      defaultValue: "",
      max: currentDate
    }
  ];
}

export default useChequeFilterOptions;
export { useChequeFilterOptions };
