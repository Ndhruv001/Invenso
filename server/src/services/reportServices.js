// Import module specific services
import { getPartyLedger } from "./reports/partyLedgerServices.js";
import { getTransportLedger } from "./reports/transportLedgerServices.js";

/**
 * Main Report Generator
 * This file does NOT contain accounting logic.
 * It only decides which report to run.
 */
const generateReport = async (module, filters) => {
  // Basic validation
  if (!module) {
    throw new Error("Report module is required");
  }

  if (!filters) {
    throw new Error("Filters are required");
  }

  const updatedFilters = {...filters, partyId: parseInt(filters.partyId)}

  // Decide which report to execute
  switch (module) {
    case "party":
      return await getPartyLedger(updatedFilters);
      case "transport": 
      return await getTransportLedger(updatedFilters)
    default:
      throw new Error("Invalid report module");
  }
};

export default generateReport;
export { generateReport };
