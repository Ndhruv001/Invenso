/**
 * Action Button Configuration (Route-Aware Event System)
 * Each button returns:
 * { type, resource, route, payload, icon, label }
 */

const BUTTON_CONFIGS = {
  // ===============================
  // DASHBOARD
  // ===============================
  dashboard: {
    primary: {
      type: "CREATE",
      resource: "sale",
      route: "/sales/sales",
      payload: null,
      icon: "Plus",
      label: "Add Sale"
    },
    secondary: {
      type: "CREATE",
      resource: "purchase",
      route: "/purchases/purchases",
      payload: null,
      icon: "ShoppingCart",
      label: "Add Purchase"
    }
  },

  // ===============================
  // PRODUCTS
  // ===============================
  products: {
    primary: {
      type: "CREATE",
      resource: "product",
      route: "/products",
      payload: null,
      icon: "Package2",
      label: "Add Product"
    },
  },

  // ===============================
  // PURCHASES (submenu root)
  // ===============================
  purchases: {
    primary: {
      type: "CREATE",
      resource: "purchase",
      route: "/purchases/purchases",
      payload: null,
      icon: "ShoppingCart",
      label: "Add Purchase"
    },
    secondary: {
      type: "CREATE",
      resource: "purchaseReturn",
      route: "/purchases/returns",
      payload: null,
      icon: "RotateCcw",
      label: "Add Purchase Return"
    }
  },

  // ===============================
  // PURCHASE RETURNS
  // ===============================
  purchaseReturns: {
    primary: {
      type: "CREATE",
      resource: "purchaseReturn",
      route: "/purchases/returns",
      payload: null,
      icon: "RotateCcw",
      label: "Add Purchase Return"
    },
    secondary: {
      type: "CREATE",
      resource: "purchase",
      route: "/purchases/purchases",
      payload: null,
      icon: "ShoppingCart",
      label: "Add Purchase"
    }
  },

  // ===============================
  // SALES
  // ===============================
  sales: {
    primary: {
      type: "CREATE",
      resource: "sale",
      route: "/sales/sales",
      payload: null,
      icon: "Plus",
      label: "Add Sale"
    },
    secondary: {
      type: "CREATE",
      resource: "saleReturn",
      route: "/sales/returns",
      payload: null,
      icon: "RotateCcw",
      label: "Add Sale Return"
    }
  },

  // ===============================
  // SALE RETURNS
  // ===============================
  saleReturns: {
    primary: {
      type: "CREATE",
      resource: "saleReturn",
      route: "/sales/returns",
      payload: null,
      icon: "RotateCcw",
      label: "Add Sale Return"
    },
    secondary: {
      type: "CREATE",
      resource: "sale",
      route: "/sales/sales",
      payload: null,
      icon: "Plus",
      label: "Add Sale"
    }
  },

  // ===============================
  // PARTIES
  // ===============================
  parties: {
    primary: {
      type: "CREATE",
      resource: "party",
      route: "/accounting/parties",
      payload: null,
      icon: "UserPlus",
      label: "Add Party"
    },
    secondary: {
      type: "CREATE",
      resource: "payment",
      route: "/accounting/payments",
      payload: null,
      icon: "ArrowDownToLine",
      label: "Add Payment"
    }
  },

  // ===============================
  // PAYMENTS
  // ===============================
  payments: {
    primary: {
      type: "CREATE",
      resource: "payment",
      route: "/accounting/payments",
      payload: null,
      icon: "ArrowDownToLine",
      label: "Add Payment"
    },
    secondary: {
      type: "CREATE",
      resource: "expense",
      route: "/accounting/expenses",
      payload: null,
      icon: "Receipt",
      label: "Add Expense"
    }
  },

  // ===============================
  // EXPENSES
  // ===============================
  expenses: {
    primary: {
      type: "CREATE",
      resource: "expense",
      route: "/accounting/expenses",
      payload: null,
      icon: "Receipt",
      label: "Add Expense"
    },
  },

  // ===============================
  // TRANSPORT
  // ===============================
  transports: {
    primary: {
      type: "CREATE",
      resource: "transport",
      route: "/transports",
      payload: null,
      icon: "Truck",
      label: "Add Transport"
    },
    secondary: {
      type: "CREATE",
      resource: "payment",
      route: "/accounting/payments",
      payload: null,
      icon: "ArrowDownToLine",
      label: "Add Payment"
    }
  },

  // ===============================
  // INVENTORY LOG
  // ===============================
  inventories: {
    primary: {
      type: "CREATE",
      resource: "stockAdjustment",
      route: "/admin/inventories",
      payload: null,
      icon: "Package2",
      label: "Adjust Stock"
    }
  },

  // ===============================
  // AUDIT LOG
  // ===============================
  audits: {},

  // ===============================
  // HELP
  // ===============================
  help: {},

  // ===============================
  // LEFT / EMPTY MODULES
  // ===============================
  left: {}
};

// ===============================
// DEFAULT BUTTONS
// ===============================
const DEFAULT_BUTTONS = {
  primary: {
    type: "CREATE",
    resource: "sale",
    route: "/sales/sales",
    payload: null,
    icon: "Plus",
    label: "Add Sale"
  },
  secondary: {
    type: "CREATE",
    resource: "purchase",
    route: "/purchases/purchases",
    payload: null,
    icon: "ShoppingCart",
    label: "Add Purchase"
  }
};

export { BUTTON_CONFIGS, DEFAULT_BUTTONS };
