import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
// Login, Register, Dashboard and Admin will be in next batches
import Login from './pages/Login';       // placeholder file path (will be sent next)
import Register from './pages/Register'; // placeholder file path (will be sent next)
import Dashboard from './pages/Dashboard'; // placeholder file path (will be sent next)
import AdminPanel from './pages/AdminPanel'; // placeholder (will be sent later)
import { getToken } from './services/api';
import WithdrawPreview from './pages/WithdrawPreview';
import ActivateAccount from './pages/ActivateAccount';
import AdminLayout from './pages/admin/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import WithdrawalsPage from './pages/admin/WithdrawalsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import MessagesPage from './pages/admin/MessagesPage';
import NotificationsPage from './pages/admin/NotificationsPage';
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
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/admin" element={<AdminPanel />} />

        <Route path="/admin" element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
        <Route index element={<UsersPage/>} />
        <Route path="users" element={<UsersPage/>} />
        <Route path="withdrawals" element={<WithdrawalsPage/>} />
        <Route path="payments" element={<PaymentsPage/>} />
        <Route path="messages" element={<MessagesPage/>} />
        <Route path="notifications" element={<NotificationsPage/>} />
    </Route>
    
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />

      <Route path="/admin" element={
        <RequireAdmin>
          <AdminPanel />
        </RequireAdmin>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
