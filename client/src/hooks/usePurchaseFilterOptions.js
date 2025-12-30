import { useMemo } from "react";
import { useParties } from "@/hooks/usePurchases";

/**
 * React hook to provide filter option definitions and choices for Purchase resource filters.
 */
function usePurchaseFilterOptions() {
  const { data: partyData } = useParties();
  

  // Convert parties into select options
  const partyOptions = useMemo(
    () =>
      partyData?.data?.map((party) => ({
        value: String(party.id),
        label: party.name,
      })) || [],
    [partyData]
  );

  return [
    {
      key: "partyId",
      type: "select",
      label: "Party",
      placeholder: "All Parties",
      options: partyOptions,
      loading: false, // isLoading
    },
    {
      key: "dateFrom",
      type: "date",
      label: "Date From",
      placeholder: "Select Start Date",
    },
    {
      key: "dateTo",
      type: "date",
      label: "Date To",
      placeholder: "Select End Date",
    },
  ];
}

export default usePurchaseFilterOptions;
export { usePurchaseFilterOptions };
