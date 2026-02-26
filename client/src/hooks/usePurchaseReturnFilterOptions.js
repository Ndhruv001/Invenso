import { useMemo } from "react";
import { format } from "date-fns";
import { useParties } from "@/hooks/useParties";

/**
 * React hook to provide filter option definitions and choices for Purchase return resource filters.
 */
function usePurchaseReturnFilterOptions() {
  const { data: partyData } = useParties();

  // Convert parties into select options
  const partyOptions = useMemo(
    () =>
      partyData?.data?.map(party => ({
        value: String(party.id),
        label: party.name
      })) || [],
    [partyData]
  );

  const currentDate = format(new Date(), "yyyy-MM-dd");

  return [
    {
      key: "partyId",
      type: "select",
      label: "Party",
      placeholder: "All Parties",
      options: partyOptions,
      loading: false // isLoading
    },
    {
      key: "dateFrom",
      type: "date",
      label: "Date From",
      placeholder: "Select Start Date",
      max: currentDate // prevent future dates
    },
    {
      key: "dateTo",
      type: "date",
      label: "Date To",
      placeholder: "Select End Date",
      max: currentDate
    }
  ];
}

export default usePurchaseReturnFilterOptions;
export { usePurchaseReturnFilterOptions };
