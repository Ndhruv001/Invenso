import { format } from "date-fns";
import { PAYMENT_MODE_OPTIONS } from "@/constants/PAYMENT_MODES";

/**
 * Hook for Transport Filter Options
 * Based on backend filters: type, dateFrom, dateTo.
 */
function useTransportFilterOptions() {

  // Static date placeholder options for UI components that handle date pickers
  // The actual value bindings (dateFrom, dateTo) will be managed by form state in the page component
  const currentDate = format(new Date(), "yyyy-MM-dd");

  return [
    {
      key: "paymentMode",
      type: "select",
      label: "Payment Mode",
      placeholder: "All Types",
      options: PAYMENT_MODE_OPTIONS
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

export default useTransportFilterOptions;
export { useTransportFilterOptions };
