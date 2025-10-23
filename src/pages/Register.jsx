// src/pages/Register.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, setToken } from '../services/api';
import './styles/register.css';
import COUNTRIES from '../data/countries';

/**
 * Registration page with password strength indicator and attributes checklist.
 * Background image uses public/images/img3.png
 */

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    country: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // normalize username on change (keeps UI consistent)
  const onChange = (k) => (e) => {
    const val = e.target.value;
    if (k === 'username') {
      // keep username lowercased in the form state
      setForm({ ...form, [k]: (val || '').toLowerCase() });
    } else {
      setForm({ ...form, [k]: val });
    }
  };

  // password checks
  const checks = useMemo(() => {
    const pw = form.password || '';
    return {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
  }, [form.password]);

  const strengthScore = Object.values(checks).filter(Boolean).length;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    // basic front-end validation
    if (!form.firstName || !form.lastName || !form.country || !form.email || !form.username || !form.password) {
      setErr('Please fill the required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErr('Passwords do not match');
      return;
    }
    if (strengthScore < 3) {
      setErr('Password not strong enough. Fulfil at least 3 of the attributes.');
      return;
    }

    try {
      setLoading(true);
      // normalize username before sending: trim and lowercase
      const normalizedUsername = (form.username || '').trim().toLowerCase();

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
        email: form.email,
        phone: form.phone,
        username: normalizedUsername,
        password: form.password
      };
      const res = await registerUser(payload);
      const { token, role } = res.data;
      if (token) {
        setToken(token);
        if (role) localStorage.setItem('role', role);
        if (role === 'admin') nav('/admin');
        else nav('/dashboard');
      } else {
        setErr(res.data.message || 'Registration failed');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Registration error';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg" />
      <div className="register-card">
        <h2>Create account</h2>
        <form className="register-form" onSubmit={submit}>
          <div className="row">
            <label>
              <span>First name</span>
              <input value={form.firstName} onChange={onChange('firstName')} />
            </label>
            <label>
              <span>Last name</span>
              <input value={form.lastName} onChange={onChange('lastName')} />
            </label>
          </div>

          <label>
            <span>Country</span>
            <select value={form.country} onChange={onChange('country')}>
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Email</span>
            <input value={form.email} onChange={onChange('email')} />
          </label>

          <label>
            <span>Phone</span>
            <input value={form.phone} onChange={onChange('phone')} />
          </label>

          <label>
            <span>Username</span>
            <input value={form.username} onChange={onChange('username')} placeholder="username" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={onChange('password')} />
          </label>

          <label>
            <span>Confirm password</span>
            <input type="password" value={form.confirmPassword} onChange={onChange('confirmPassword')} />
          </label>

          <div className="password-checks">
            <div className="meter">
              <div className={`meter-fill s${strengthScore}`} />
            </div>
            <ul className="checks">
              <li className={checks.length ? 'ok' : ''}>At least 8 characters</li>
              <li className={checks.uppercase ? 'ok' : ''}>Contains uppercase letter</li>
              <li className={checks.number ? 'ok' : ''}>Contains number</li>
              <li className={checks.special ? 'ok' : ''}>Contains special character</li>
            </ul>
          </div>

          {err && <div className="error">{err}</div>}

          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <button type="button" className="btn-outline" onClick={() => nav('/login')}>Already have account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
