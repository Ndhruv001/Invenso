/**
 * Action buttons configuration aligned with new sidebar structure.
 */

const BUTTON_CONFIGS = {
  dashboard: {
    primary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" },
    secondary: { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" }
  },

  products: {
    primary: { label: "Add Product", icon: "Package2", path: "/products" }
  },

  purchases: {
    primary: subSection => {
      if (subSection === "returns") {
        return { label: "Add Purchase Return", icon: "RotateCcw", path: "/purchases/returns" };
      }
      return { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" };
    },
    secondary: subSection => {
      if (subSection === "returns") {
        return { label: "Add Purchase", icon: "ShoppingCart", path: "/purchases/purchases" };
      }
      return { label: "Add Return", icon: "RotateCcw", path: "/purchases/returns" };
    }
  },

  sales: {
    primary: subSection => {
      if (subSection === "returns") {
        return { label: "Add Sales Return", icon: "RotateCcw", path: "/sales/returns" };
      }
      return { label: "Add Sale", icon: "Plus", path: "/sales/sales" };
    },
    secondary: subSection => {
      if (subSection === "returns") {
        return { label: "Add Sale", icon: "Plus", path: "/sales/sales" };
      }
      return { label: "Add Return", icon: "RotateCcw", path: "/sales/returns" };
    }
  },

  accounting: {
    primary: subSection => {
      switch (subSection) {
        case "parties":
          return { label: "Add Party", icon: "UserPlus", path: "/accounting/parties" };
        case "payments":
          return { label: "Payment In", icon: "ArrowDownToLine", path: "/accounting/payments" };
        case "expenses":
          return { label: "Add Expense", icon: "Receipt", path: "/accounting/expenses" };
        default:
          return { label: "Add Party", icon: "UserPlus", path: "/accounting/parties" };
      }
    }
  },

  transports: {
    primary: { label: "Add Transport", icon: "TruckIcon", path: "/transports" }
  },

  reports: {
    primary: { label: "View Sales Report", icon: "Plus", path: "/sales/sales" }
  },

  admin: {
    primary: subSection => {
      switch (subSection) {
        case "audits":
          return { label: "View Audit Logs", icon: "FileSearch", path: "/admin/audits" };
        case "inventories":
          return { label: "View Inventory Logs", icon: "Package2", path: "/admin/inventories" };
        case "users":
          return { label: "Add User", icon: "UserPlus", path: "/admin/users" };
        default:
          return { label: "Add User", icon: "UserPlus", path: "/admin/users" };
      }
    }
  },

  notifications: {
    primary: { label: "Go to Sales", icon: "Plus", path: "/sales/sales" }
  },

  help: {
    primary: { label: "Contact Support", icon: "Plus", path: "/help" }
  }
};

const DEFAULT_BUTTONS = {
  primary: { label: "Add Sale", icon: "Plus", path: "/sales/sales" }
};

export { BUTTON_CONFIGS, DEFAULT_BUTTONS };
