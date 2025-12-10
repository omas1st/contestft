// src/pages/Withdraw.jsx
import React, { useEffect, useState } from 'react';
import { createWithdrawPreview, getDashboard, logout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './styles/withdraw.css';

/**
 * Withdraw page - updated to include:
 * - toolbar (button above)
 * - account container that groups account details and country
 * - explicit high-contrast styles applied to the account-panel to fix visibility
 * - preserves all existing logic, validation and navigation
 */

function isUSA(country) {
  if (!country) return false;
  const c = country.toLowerCase();
  return c === 'united states' || c === 'united states of america' || c === 'usa' || c === 'us';
}
function isCanada(country) {
  if (!country) return false;
  return country.toLowerCase().includes('canada');
}

export default function Withdraw() {
  const [data, setData] = useState({ username: '', balance: 0, timerActive: false, country: '' });
  const [loading, setLoading] = useState(true);
  const [withdrawMethod, setWithdrawMethod] = useState('crypto');
  const [withdrawDetails, setWithdrawDetails] = useState({});
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [msgStatus, setMsgStatus] = useState('');
  const nav = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      // server now returns country
      setData(res.data);
      // pick default method depending on country
      if (isUSA(res.data.country) || isCanada(res.data.country)) setWithdrawMethod('crypto');
      else setWithdrawMethod('crypto'); // only crypto for others
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (err?.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreatePreview = async () => {
    if (Number(data.balance) < 1) return alert('Balance must be at least $1 to withdraw');
    if (!data.timerActive) return alert('Withdrawals disabled while timer is inactive');

    const country = data.country || '';

    // Enforce allowed method per country (frontend check)
    if (!isUSA(country) && !isCanada(country) && withdrawMethod !== 'crypto') {
      return alert('Only Cryptocurrency withdrawals are allowed for your country.');
    }

    // Validate details
    if (withdrawMethod === 'crypto') {
      if (!withdrawDetails.crypto || !withdrawDetails.walletAddress) return alert('Please provide crypto type and wallet address');
    } else if (withdrawMethod === 'bank') {
      if (isUSA(country)) {
        const { bankName, bankAddress, routingNumber, beneficiaryName, accountNumber, accountType, beneficiaryAddress } = withdrawDetails;
        if (!bankName || !bankAddress || !routingNumber || !beneficiaryName || !accountNumber || !accountType || !beneficiaryAddress) {
          return alert('Please fill all required USA bank fields.');
        }
        if (!/^\d{9}$/.test(String(routingNumber))) return alert('Routing Number must be 9 digits.');
        if (!['checking', 'savings'].includes(String(accountType).toLowerCase())) return alert('Account type must be checking or savings.');
      } else if (isCanada(country)) {
        const { transitNumber, institutionNumber, accountNumber, beneficiaryName } = withdrawDetails;
        if (!transitNumber || !institutionNumber || !accountNumber || !beneficiaryName) {
          return alert('Please fill all required Canada bank fields.');
        }
        if (!/^\d{5}$/.test(String(transitNumber))) return alert('Transit Number must be 5 digits.');
        if (!/^\d{3}$/.test(String(institutionNumber))) return alert('Institution Number must be 3 digits.');
      } else {
        return alert('Bank transfer is not available for your country.');
      }
    } else if (withdrawMethod === 'stripe') {
      if (!withdrawDetails.email) return alert('Please provide email for Stripe.');
    }

    try {
      setLoadingWithdraw(true);
      setMsgStatus('');

      // <-- IMPORTANT: include country in payload so server validators can use it synchronously
      const payload = { method: withdrawMethod, details: withdrawDetails, country: country };

      const res = await createWithdrawPreview(payload);
      const body = res.data || {};

      const isExisting = (body.message && String(body.message).toLowerCase().includes('existing')) || !!body.stage;

      if (isExisting) {
        const targetId = body.withdrawalId;
        const stage = body.stage || 'activation';

        setMsgStatus('Resuming existing withdrawal in progress...');

        if (stage === 'activation') {
          nav('/withdraw/activate', { state: { withdrawalId: targetId } });
          return;
        }
        if (stage === 'tax') {
          const amount = (typeof body.amount === 'number' && body.amount >= 0) ? body.amount : Number(((Number(data.balance || 0) * 0.01) || 0).toFixed(2));
          nav('/withdraw/stage', { state: { withdrawalId: targetId, stage: 'tax', amount } });
          return;
        }
        if (['insurance', 'verification', 'security'].includes(stage)) {
          const amount = (typeof body.amount === 'number' && body.amount >= 0) ? body.amount : 0;
          nav('/withdraw/stage', { state: { withdrawalId: targetId, stage, amount } });
          return;
        }
        if (stage === 'access') {
          nav('/withdraw/access', { state: { withdrawalId: targetId } });
          return;
        }
        if (body.preview) {
          nav('/withdraw/preview', { state: { withdrawalId: targetId, preview: body.preview } });
          return;
        }
        nav('/withdraw/preview', { state: { withdrawalId: targetId, preview: { amount: data.balance, method: withdrawMethod, details: withdrawDetails } } });
        return;
      }

      const { withdrawalId, preview } = body;
      setMsgStatus('Preview created. Redirecting to preview page...');

      if (!withdrawalId || !preview) {
        setMsgStatus('Preview created but missing server response. Please check notifications or contact admin.');
        return;
      }

      nav('/withdraw/preview', { state: { withdrawalId, preview } });
    } catch (err) {
      console.error(err);
      setMsgStatus(err?.response?.data?.message || 'Failed to create preview');
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // Loading state: keep card styling consistent
  if (loading) return (
    <div className="withdraw-page">
      <div className="toolbar">
        <button className="btn-outline" onClick={() => nav('/dashboard')}>Back to dashboard</button>
      </div>

      <div
        className="account-panel card"
        // explicit inline styles to ensure high-contrast visibility across themes
        style={{
          marginBottom: 16,
          backgroundColor: '#ffffff',
          color: '#0f172a', /* dark text */
          WebkitTextFillColor: '#0f172a' /* fixes some browser quirks where text may render transparent */
        }}
      >
        <div className="account-details">
          <h2 style={{ margin: 0, color: '#0f172a' }}>Withdraw — <strong style={{ color: '#0f172a' }}>{data.username || '—'}</strong></h2>
          <div className="muted-text" style={{ color: '#4b5563' }}>Account Balance: <strong style={{ color: '#0f172a' }}>${Number(data.balance || 0).toFixed(2)}</strong></div>
          <div className="muted-text" style={{ color: '#4b5563' }}>Country: <strong style={{ color: '#0f172a' }}>{data.country || '—'}</strong></div>
        </div>
      </div>

      <div className="card">Loading withdraw page...</div>
    </div>
  );

  const country = data.country || '';
  const allowedMethods = isUSA(country) || isCanada(country) ? [
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'bank', label: 'Wire Transfer' }
  ] : [
    { value: 'crypto', label: 'Cryptocurrency' }
  ];

  return (
    <div className="withdraw-page">
      {/* toolbar with the button above the account container */}
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="btn-outline" onClick={() => nav('/dashboard')}>Back to dashboard</button>
      </div>

      {/* account panel groups username, balance and country
          We apply explicit high-contrast inline styles here to avoid the invisible-text issue
          (these inline rules do not affect any other pages and guarantee readability). */}
      <div
        className="account-panel card"
        style={{
          marginBottom: 16,
          backgroundColor: '#ffffff',
          color: '#0f172a',
          WebkitTextFillColor: '#0f172a'
        }}
      >
        <div className="account-details">
          <h2 style={{ margin: 0, color: '#0f172a' }}>Username: <strong style={{ color: '#0f172a' }}>{data.username}</strong></h2>
          <div className="muted-text" style={{ color: '#4b5563' }}>Account Balance: <strong style={{ color: '#0f172a' }}>${Number(data.balance || 0).toFixed(2)}</strong></div>
          <div className="muted-text" style={{ color: '#4b5563' }}>Country: <strong style={{ color: '#0f172a' }}>{data.country || '—'}</strong></div>
        </div>
      </div>

      {/* main card containing the withdraw form (logic unchanged) */}
      <div className="card">
        <h4>Withdraw</h4>

        <div className="form">
          <label>
            <span>Method</span>
            <select value={withdrawMethod} onChange={(e) => { setWithdrawMethod(e.target.value); setWithdrawDetails({}); }}>
              {allowedMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>

          {/* dynamic form */}
          {withdrawMethod === 'crypto' && (
            <>
              <label>
                <span>Crypto</span>
                <select onChange={(e) => setWithdrawDetails({ ...withdrawDetails, crypto: e.target.value })} value={withdrawDetails.crypto || ''}>
                  <option value="">Select crypto</option>
                  <option value="Bitcoin">Bitcoin</option>
                  <option value="Ethereum">Ethereum</option>
                </select>
              </label>
              <label>
                <span>Wallet address</span>
                <input value={withdrawDetails.walletAddress || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, walletAddress: e.target.value })} placeholder="Wallet address" />
              </label>
            </>
          )}

          {withdrawMethod === 'bank' && isUSA(country) && (
            <>
              <label><span>Bank name</span><input value={withdrawDetails.bankName || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, bankName: e.target.value })} /></label>
              <label><span>Bank address</span><input value={withdrawDetails.bankAddress || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, bankAddress: e.target.value })} /></label>
              <label><span>Routing Number (9 digits)</span><input value={withdrawDetails.routingNumber || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, routingNumber: e.target.value })} placeholder="123456789" /></label>
              <label><span>Beneficiary name</span><input value={withdrawDetails.beneficiaryName || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, beneficiaryName: e.target.value })} /></label>
              <label><span>Account number</span><input value={withdrawDetails.accountNumber || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, accountNumber: e.target.value })} /></label>
              <label>
                <span>Account type</span>
                <select value={withdrawDetails.accountType || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, accountType: e.target.value })}>
                  <option value="">Select account type</option>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </label>
              <label><span>Beneficiary address</span><input value={withdrawDetails.beneficiaryAddress || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, beneficiaryAddress: e.target.value })} /></label>
            </>
          )}

          {withdrawMethod === 'bank' && isCanada(country) && (
            <>
              <label><span>Transit Number (5 digits)</span><input value={withdrawDetails.transitNumber || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, transitNumber: e.target.value })} placeholder="12345" /></label>
              <label><span>Institution Number (3 digits)</span><input value={withdrawDetails.institutionNumber || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, institutionNumber: e.target.value })} placeholder="123" /></label>
              <label><span>Account number</span><input value={withdrawDetails.accountNumber || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, accountNumber: e.target.value })} /></label>
              <label><span>Beneficiary name</span><input value={withdrawDetails.beneficiaryName || ''} onChange={(e) => setWithdrawDetails({ ...withdrawDetails, beneficiaryName: e.target.value })} /></label>
            </>
          )}

          <div className="actions">
            <button className="btn" onClick={handleCreatePreview} disabled={loadingWithdraw || !data.timerActive || Number(data.balance) < 1}>
              {loadingWithdraw ? 'Processing...' : 'Next'}
            </button>
            <button className="btn-outline" onClick={() => nav('/dashboard')}>Cancel</button>
          </div>
        </div>

        {msgStatus && <div className="msg">{msgStatus}</div>}
      </div>
    </div>
  );
               }
