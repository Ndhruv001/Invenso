/**
 * Action buttons configuration for different sections of the application.
 * Each section can have primary and secondary action buttons.
 */

const BUTTON_CONFIGS = {
  dashboard: {
    primary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" },
    secondary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" }
  },

  inventory: {
    primary: subSection => {
      if (["products", "category", "categories"].includes(subSection)) {
        return { label: "Add Category", icon: "FolderPlus", path: "/inventory/categories" };
      }
      if (subSection === "stock-opening") {
        return { label: "Add Stock", icon: "Package", path: "/inventory/stock" };
      }
      return { label: "Add Product", icon: "Package2", path: "/inventory/products" };
    },
    secondary: { label: "Add Product", icon: "Package2", path: "/inventory/products" }
  },

  purchase: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Returns", icon: "RotateCcw", path: "/purchases/returns" }
  },

  purchases: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Returns", icon: "RotateCcw", path: "/purchases/returns" }
  },

  sales: {
    primary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" },
    secondary: { label: "Add Returns", icon: "RotateCcw", path: "/sales/returns" }
  },

  accounting: {
    primary: subSection => {
      switch (subSection) {
        case "parties":
          return { label: "Add Party", icon: "UserPlus", path: "/accounting/parties" };
        case "payments":
          return { label: "Payment-in", icon: "ArrowDownToLine", path: "/accounting/payments/in" };
        case "expenses":
          return { label: "Add Expenses", icon: "Receipt", path: "/accounting/expenses" };
        case "opening-balances":
          return {
            label: "Add Opening-Balance",
            icon: "DollarSign",
            path: "/accounting/opening-balances"
          };
        default:
          return { label: "Add Party", icon: "UserPlus", path: "/accounting/parties" };
      }
    },
    secondary: subSection => {
      switch (subSection) {
        case "parties":
          return {
            label: "Add Opening Balance",
            icon: "DollarSign",
            path: "/accounting/opening-balances"
          };
        case "payments":
          return {
            label: "Payment-out",
            icon: "ArrowUpFromLine",
            path: "/accounting/payments/out"
          };
        case "expenses":
          return {
            label: "Add Category",
            icon: "FolderPlus",
            path: "/accounting/expense-categories"
          };
        case "opening-balances":
          return { label: "Add Party", icon: "UserPlus", path: "/accounting/parties" };
        default:
          return {
            label: "Add Opening Balance",
            icon: "DollarSign",
            path: "/accounting/opening-balances"
          };
      }
    }
  },

  transport: {
    primary: { label: "Add Transport", icon: "TruckIcon", path: "/transport/vehicles" },
    secondary: { label: "Add Driver", icon: "UserCheck", path: "/transport/drivers" }
  },

  reports: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" }
  },

  notifications: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" }
  },

  admin: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" }
  },

  help: {
    primary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" },
    secondary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" }
  }
};

const DEFAULT_BUTTONS = {
  primary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" },
  secondary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" }
};

export { BUTTON_CONFIGS, DEFAULT_BUTTONS };
