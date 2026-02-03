import React from "react";
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

// Other Components
import Transport from "@/scenes/transport/Transport.jsx";
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
import AddProduct from "@/scenes/products/ProductModal";
import AddCategory from "@/scenes/categories/AddCategory";
import AddParty from "./scenes/accounting/parties/PartyModal";
import AddPaymentIn from "./scenes/accounting/payments/PaymentModal";
import AddExpense from "./scenes/accounting/expenses/ExpenseModal";
import AddTransport from "./scenes/transport/AddTransport";
import ComingSoon from "./components/common/ComingSoon";
import AddSale from "./scenes/sales/sales/SaleModal";
import InventoryLogs from "@/scenes/admin/inventories/InventoryLogs.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes - All routes under MainLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
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
        </Route>

        {/* Single Routes */}
        <Route path="products" element={<Products />} />
        <Route path="transports" element={<Transport />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<ComingSoon />} />

        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={<Navigate to="users" replace />} />
          <Route path="audits" element={<AuditLogs />} />
          <Route path="inventories" element={<InventoryLogs />} />
          <Route path="users" element={<ComingSoon />} />
          <Route path="settings" element={<ComingSoon />} />
        </Route>

        {/* Help Route */}
        <Route path="help" element={<Help />} />

         {/* Unauthorized Route */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Catch all unmatched routes */}
        <Route path="*" element={<AddSale/>} />
      </Route>
    </Routes>
  );
}

export default App;
export { App };
