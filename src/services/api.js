// src/services/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://contestbk.vercel.app/';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach token to each request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// Public / user endpoints
export async function registerUser(payload) {
  return api.post('/auth/register', payload);
}

export async function loginUser(payload) {
  return api.post('/auth/login', payload);
}

export async function getDashboard() {
  return api.get('/auth/dashboard');
}

export async function sendMessage(text) {
  return api.post('/auth/message', { text });
}

/**
 * Payment / activation uploads
 * - submitActivationPayment: endpoint for activation uploads (multipart)
 * - submitStagePayment: dedicated endpoint for generic stage payments (tax/insurance/etc)
 *
 * Note: formData must be a FormData instance (files).
 */
export async function submitActivationPayment(formData) {
  // formData is a FormData instance (for file uploads)
  // use api instance so Authorization header from interceptor is attached
  return api.post('/auth/activate-payment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * submitStagePayment
 * POSTs to the withdrawals submit endpoint (routes/withdrawalRoutes.js -> router.post('/submit', ...))
 * This keeps stage payments separate from the activation-upload endpoint and uses the api instance
 * so the Authorization header is automatically included.
 */
export async function submitStagePayment(formData) {
  // formData is a FormData instance
  return api.post('/withdraw/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * Withdraw flow (you already had these; kept them the same)
 */
export async function createWithdrawPreview(payload) {
  return api.post('/auth/withdraw-request', payload);
}

export async function proceedWithdraw(id) {
  return api.post(`/auth/withdraw-proceed/${id}`);
}

/**
 * Confirm stage pin (4-digit) - expects { withdrawalId, stage, pin }
 * Backend route should be /auth/confirm-pin (ensure your authRoutes implements it)
 */
export async function confirmStagePin(payload) {
  return api.post('/auth/confirm-pin', payload);
}

// Admin helpers
export async function adminGetUsers() {
  return api.get('/admin/users');
}

export async function adminEditUser(userId, payload) {
  return api.put(`/admin/users/${userId}`, payload);
}

export async function adminDeleteUser(userId) {
  return api.delete(`/admin/users/${userId}`);
}

export async function adminGetMessages() {
  return api.get('/admin/messages');
}

export async function adminGetPayments() {
  return api.get('/admin/payments');
}

export async function adminGetWithdrawals() {
  return api.get('/admin/withdrawals');
}

export async function adminApproveWithdrawal(withdrawalId) {
  return api.post(`/admin/withdrawals/${withdrawalId}/approve`);
}

export async function adminNotifyUser(userId, text) {
  return api.post('/admin/notify', { userId, text });
}

/**
 * NEW - Admin set PIN for a user at a stage
 * POST /api/admin/users/:userId/set-pin  { stage, pin }
 */
export async function adminSetPin(userId, stage, pin) {
  return api.post(`/admin/users/${userId}/set-pin`, { stage, pin });
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export default api;
