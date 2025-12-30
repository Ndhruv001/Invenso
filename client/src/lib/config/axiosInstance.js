import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  withCredentials: true // Send cookies for session auth
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  config => {
    // Log outgoing requests
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    config.metadata = { startTime: new Date() };
    return config;
  },
  error => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  response => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`API Response: ${response.config.url} (${duration}ms)`);
    return response.data;
  },
  error => {
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        type: "NETWORK_ERROR"
      });
    }
    const { status, data } = error.response;
    switch (status) {
      case 401:
        window.location.href = "/login";
        return Promise.reject({
          message: "Session expired. Please log in again.",
          type: "AUTH_ERROR"
        });
      case 403:
        window.location.href = "/unauthorized";
        return Promise.reject({
          message: "Access denied. You don't have permission for this action.",
          type: "PERMISSION_ERROR"
        });
      case 404:
        return Promise.reject({
          message: "Resource not found.",
          type: "NOT_FOUND_ERROR"
        });
      case 422:
        return Promise.reject({
          message: data.message || "Validation failed",
          type: "VALIDATION_ERROR",
          errors: data.errors || {}
        });
      case 500:
        return Promise.reject({
          message: "Server error. Please try again later.",
          type: "SERVER_ERROR"
        });
      default:
        return Promise.reject({
          message: data.message || `Request failed with status ${status}`,
          type: "API_ERROR"
        });
    }
  }
);

const setApiBaseUrl = url => {
  axiosInstance.defaults.baseURL = url;
};
export default axiosInstance;
export { axiosInstance, setApiBaseUrl };
