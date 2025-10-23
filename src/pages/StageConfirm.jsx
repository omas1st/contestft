// src/pages/StageConfirm.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { confirmStagePin } from '../services/api';
import './styles/stagepayment.css';

/**
 * Generic confirmation page to input 4-digit pin for a stage.
 * Expects state { withdrawalId, stage } or param stage
 */

export default function StageConfirm() {
  const loc = useLocation();
  const nav = useNavigate();
  const { stage: paramStage } = useParams();
  const { withdrawalId, stage: stateStage } = loc.state || {};
  const stage = stateStage || paramStage;
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  if (!withdrawalId || !stage) {
    return <div className="page-container"><div className="card"><h3>Confirm</h3><p className="muted">Missing data.</p></div></div>;
  }

  const handleConfirm = async () => {
    if (pin.length < 4) return alert('Please input 4-digit pin');
    try {
      setLoading(true);
      const res = await confirmStagePin({ withdrawalId, stage, pin });
      if (res.data && res.data.success && res.data.nextStage) {
        alert('Correct pin. Redirecting...');
        // redirect to next stage payment or access page
        if (res.data.nextStage === 'access') {
          nav('/withdraw/access', { state: { withdrawalId } });
        } else {
          // go to the respective stage payment page (tax -> /withdraw/stage)
          nav('/withdraw/stage', { state: { withdrawalId, stage: res.data.nextStage, amount: res.data.amount } });
        }
      } else if (res.data && res.data.success && !res.data.nextStage) {
        // no next stage, go to access
        nav('/withdraw/access', { state: { withdrawalId } });
      } else {
        alert(res.data?.message || 'Incorrect pin. Check your dashboard notifications.');
        // redirect the user to dashboard to check notifications and inform them
        if (res.data?.message && res.data.message.toLowerCase().includes('no pin set')) {
          alert('No pin has been set for this stage yet. Check your dashboard notifications — the pin will be sent within 15 minutes.');
          nav('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to confirm pin';
      if (msg.toLowerCase().includes('no pin set')) {
        alert('No pin set for this stage. Go back to your dashboard and check notifications — the pin should arrive within 15 minutes.');
        nav('/dashboard');
      } else if (msg.toLowerCase().includes('incorrect pin')) {
        alert('Incorrect pin. Go back to dashboard and check notifications for the correct code.');
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
      <div className="card">
        <h3>Confirm {stage}</h3>
        <p className="muted">Enter the 4-digit pin that was sent to your dashboard notifications for {stage}.</p>

        <div style={{ marginTop: 12 }}>
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="4-digit pin" maxLength={4} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={handleConfirm} disabled={loading}>{loading ? 'Checking...' : 'Confirm'}</button>
          <button className="btn-outline" style={{ marginLeft: 8 }} onClick={() => nav('/dashboard')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
