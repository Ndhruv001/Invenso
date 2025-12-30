// Format currency → ₹1,234.00
const formatCurrency = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date → 05/08/2025 (short), 5 August 2025 (long)
const formatDate = (date, format = "short") => {
  if (!date) return "-";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    case "long":
      return dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    case "relative":
      return formatRelativeTime(dateObj);
    case "datetime":
      return dateObj.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    default:
      return dateObj.toLocaleDateString("en-IN");
  }
};

// Format relative time → "2 days ago"
const formatRelativeTime = date => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

// Format number → 12,34,567
const formatNumber = number => {
  if (number === null || number === undefined || isNaN(number)) return "0";
  return new Intl.NumberFormat("en-IN").format(number);
};

// Format file size → 1.24 MB
const formatFileSize = bytes => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format percentage → 75%
const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
};

// Truncate long text → "This is lo..."
const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Format phone number → +91 98765 43210
const formatPhoneNumber = phone => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Format HSN → 1234 5678
const formatHSN = hsn => {
  if (!hsn) return "";
  const cleaned = hsn.replace(/\s/g, "");
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return hsn;
};

// Get initials from name → "John Doe" → JD
const getInitials = name => {
  if (!name) return "";
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Get stock status object → { label: 'Low Stock', color: 'yellow', severity: 'medium' }
const getStockStatus = (stock, minStock = 10) => {
  if (stock === 0) {
    return { label: "Out of Stock", color: "red", severity: "high" };
  }
  if (stock < minStock) {
    return { label: "Low Stock", color: "yellow", severity: "medium" };
  }
  return { label: "In Stock", color: "green", severity: "low" };
};

// 🟢 Export all at bottom for better maintainability
export {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatFileSize,
  formatPercentage,
  truncateText,
  formatPhoneNumber,
  formatHSN,
  getInitials,
  getStockStatus
};
