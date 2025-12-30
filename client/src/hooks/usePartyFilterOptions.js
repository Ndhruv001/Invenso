// ✅ src/hooks/filters/usePartyFilterOptions.js
import { PARTY_TYPE_OPTIONS } from "@/constants/PARTY_TYPES";  
import { BALANCE_TYPE_OPTIONS } from "@/constants/BALANCE_TYPES";

function usePartyFilterOptions() {

  return [
    {
      key: "partyType",
      type: "select",
      label: "Party Type",
      placeholder: "All Types",
      options: PARTY_TYPE_OPTIONS,
    },
    {
      key: "balanceType",
      type: "select",
      label: "Balance Type",
      placeholder: "All Balance Types",
      options: BALANCE_TYPE_OPTIONS,
    },
  ];
}

export default usePartyFilterOptions;
export { usePartyFilterOptions };
