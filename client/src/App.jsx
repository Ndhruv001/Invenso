import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "@/scenes/login/LoginPage.jsx";
import MainLayout from "@/components/layout/MainLayout.jsx";

// Dashboard Components
import Dashboard from "@/scenes/dashboard/Dashboard.jsx";

// Purchase Components
import Purchases from "@/scenes/purchases/purchases/Purchases.jsx";
import PurchaseReturns from "@/scenes/purchases/returns/PurchaseReturns.jsx";

// Sales Components
import Sales from "@/scenes/sales/sales/Sales.jsx";
import SalesReturns from "@/scenes/sales/returns/SaleReturns.jsx";

// Accounting Components
import Parties from "@/scenes/accounting/parties/Parties.jsx";
import Payments from "@/scenes/accounting/payments/Payments.jsx";
import Expenses from "@/scenes/accounting/expenses/Expenses.jsx";
import Cheques from "@/scenes/accounting/cheques/Cheques.jsx";

// Other Components
import Transports from "@/scenes/transport/Transports.jsx";
import Reports from "@/scenes/reports/Reports.jsx";
import Notifications from "@/scenes/notifications/Notifications.jsx";
import Products from "@/scenes/products/Products.jsx";

// Admin Components
import Users from "@/scenes/admin/users/Users.jsx";
import AuditLogs from "@/scenes/admin/audits/AuditLogs.jsx";
import Settings from "@/scenes/admin/settings/Settings.jsx";

// Help Component
import Help from "@/scenes/help/Help.jsx";

// Protected Route Component
import ProtectedRoute from "@/components/common/ProtectedRoute.jsx";

// Error Components
import NotFound from "@/scenes/error/NotFound.jsx";
import Unauthorized from "@/scenes/error/Unauthorized.jsx";
import ComingSoon from "./components/common/ComingSoon";
import InventoryLogs from "@/scenes/admin/inventories/InventoryLogs.jsx";
import { useHideScreenContext } from "@/context/HideScreenContext.jsx";
import BlurOverlay from "@/components/common/BlurOverlay.jsx";
import {healthCheckWithRetry} from "./lib/helpers/healthCheckWithRetry.js";

function App() {
  const { isScreenHidden } = useHideScreenContext();

  useEffect(() => {
    healthCheckWithRetry()
      .then(() => console.log("Server ready"))
      .catch((error) => console.log("Server waking up", error));
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - All routes under MainLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
            {isScreenHidden && <BlurOverlay />}
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Purchase Routes */}
        <Route path="purchases">
          <Route index element={<Navigate to="purchases" replace />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="returns" element={<PurchaseReturns />} />
        </Route>

        {/* Sales Routes */}
        <Route path="sales">
          <Route index element={<Navigate to="sales" replace />} />
          <Route path="sales" element={<Sales />} />
          <Route path="returns" element={<SalesReturns />} />
        </Route>

        {/* Accounting Routes */}
        <Route path="accounting">
          <Route index element={<Navigate to="parties" replace />} />
          <Route path="parties" element={<Parties />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="cheques" element={<Cheques />} />
        </Route>

        {/* Single Routes */}
        <Route path="products" element={<Products />} />
        <Route path="transports" element={<Transports />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<ComingSoon />} />

        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={<Navigate to="users" replace />} />
          <Route path="audits" element={<AuditLogs />} />
          <Route path="inventories" element={<InventoryLogs />} />
          <Route path="users" element={<ComingSoon />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Help Route */}
        <Route path="help" element={<Help />} />

        {/* Unauthorized Route */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
export { App };
