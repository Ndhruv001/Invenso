import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Report Service Layer
 * Handles all HTTP requests related to reports.
 * Currently supports Party Ledger.
 */

// ---------------------------------------------
// Helper for consistent error handling
// ---------------------------------------------
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

// ---------------------------------------------
// Get Report Data
// ---------------------------------------------
export const getReport = async ({ module, filters = {} }) => {
  try {
    const params = new URLSearchParams();

    // module=party
    if (module) {
      params.append("module", module);
    }

    // filters will be stringified JSON
    if (filters && Object.keys(filters).length > 0) {
      params.append("filters", JSON.stringify(filters));
    }

    const { data } = await axiosInstance.get("/reports", { params });

    return data; // backend returns array
  } catch (error) {
    handleAxiosError(error, "Failed to fetch report data");
  }
};

export const downloadPartyLedgerPdf = async filters => {
  const { partyId, dateFrom, dateTo } = filters || {};

  if (!partyId || !dateFrom || !dateTo) {
    throw new Error("partyId, dateFrom and dateTo are required");
  }

  try {
    const response = await axiosInstance.get(`/reports/download/party-ledger`, {
      params: {
        partyId,
        dateFrom,
        dateTo
      },
      responseType: "blob" // 🔥 Required for file download
    });

    return response; // return Blob
  } catch (error) {
    handleAxiosError(error, `Failed to download ledger for party ${partyId}`);
  }
};
export const downloadTransportLedgerPdf = async filters => {
  const { partyId, dateFrom, dateTo } = filters || {};

  if (!partyId || !dateFrom || !dateTo) {
    throw new Error("partyId, dateFrom and dateTo are required");
  }

  try {
    const response = await axiosInstance.get(`/reports/download/transport-ledger`, {
      params: {
        partyId,
        dateFrom,
        dateTo
      },
      responseType: "blob" // 🔥 Required for file download
    });

    return response; // return Blob
  } catch (error) {
    handleAxiosError(error, `Failed to download transport ledger for party ${partyId}`);
  }
};

// Named export
export const reportsApi = {
  getReport, downloadPartyLedgerPdf, downloadTransportLedgerPdf
};

export default reportsApi;