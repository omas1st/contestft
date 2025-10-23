// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { getToken } from './services/api';
import WithdrawPreview from './pages/WithdrawPreview';
import Withdraw from './pages/Withdraw';
import ActivateAccount from './pages/ActivateAccount';
import AdminLayout from './pages/admin/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import WithdrawalsPage from './pages/admin/WithdrawalsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import MessagesPage from './pages/admin/MessagesPage';
import NotificationsPage from './pages/admin/NotificationsPage';

// NEW pages (ensure these files exist in src/pages)
import StagePayment from './pages/StagePayment';
import StageConfirm from './pages/StageConfirm';
import Access from './pages/Access';
import ConfirmActivate from './pages/ConfirmActivate'; // new page

/**
 * Very small auth-guards:
 * - If user has a token and role info is needed, the dashboard and admin routes assume
 *   the backend will reply appropriately. For now we gate by token presence.
 */
const RequireAuth = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const token = getToken();
  // A more robust solution would decode the JWT and check role,
  // or call an /api/auth/me endpoint. For now we check token presence.
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/withdraw/preview" element={<WithdrawPreview />} />
      <Route path="/withdraw" element={
        <RequireAuth>
          <Withdraw />
        </RequireAuth>
      } />
      <Route path="/activate-account" element={<ActivateAccount />} />

      {/* also allow activation route under withdraw flow */}
      <Route path="/withdraw/activate" element={
        <RequireAuth>
          <ActivateAccount />
        </RequireAuth>
      } />

      {/* Confirm activation (4-digit PIN input) */}
      <Route path="/withdraw/confirm-activate" element={
        <RequireAuth>
          <ConfirmActivate />
        </RequireAuth>
      } />

      {/* Stage payment, confirm pin, access pages for flow */}
      <Route path="/withdraw/stage" element={
        <RequireAuth>
          <StagePayment />
        </RequireAuth>
      } />

      <Route path="/withdraw/confirm/:stage" element={
        <RequireAuth>
          <StageConfirm />
        </RequireAuth>
      } />

      <Route path="/withdraw/access" element={
        <RequireAuth>
          <Access />
        </RequireAuth>
      } />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Admin landing (separate panel if you have one) */}
      <Route
        path="/admin/panel"
        element={
          <RequireAdmin>
            <AdminPanel />
          </RequireAdmin>
        }
      />

      {/* Admin nested routes (guarded) */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<UsersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
