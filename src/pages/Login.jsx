// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, setToken } from '../services/api';
import './styles/login.css';

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // normalize username on submit and as user types (keeps UI consistent)
  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    // normalize: trim and lowercase
    const normalizedUsername = (username || '').trim().toLowerCase();

    if (!normalizedUsername || !password) {
      setErr('Please provide username and password');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ username: normalizedUsername, password });
      // Expect response { token, role }
      const { token, role } = res.data;
      if (token) {
        setToken(token);
        // store role for client-side routing decisions
        if (role) localStorage.setItem('role', role);
        // redirect admin to /admin, else /dashboard
        if (role === 'admin') nav('/admin');
        else nav('/dashboard');
      } else {
        setErr(res.data.message || 'Login failed');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Login error';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Enter username"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>

          {err && <div className="error">{err}</div>}

          <div className="login-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => nav('/register')}
            >
              Create account
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
