// src/pages/Access.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/home.css';

export default function Access() {
  const loc = useLocation();
  const nav = useNavigate();
  const { withdrawalId } = loc.state || {};

  return (
    <div className="page-container">
      <div className="card">
        <h3>Access Granted</h3>
        <p className="muted">All activation steps completed. Your withdrawal will be processed. Withdrawal ID: <strong>{withdrawalId}</strong></p>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => nav('/dashboard')}>Back to dashboard</button>
        </div>
      </div>
    </div>
  );
}
