// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import {
  adminGetUsers,
  adminEditUser,
  adminGetMessages,
  adminGetPayments,
  adminGetWithdrawals,
  adminApproveWithdrawal,
  adminNotifyUser,
  adminSetPin
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './styles/home.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editingBalance, setEditingBalance] = useState('');
  const [info, setInfo] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null); // { type, data }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelect = (u) => {
    setSelected(u);
    setEditingBalance(String(u.balance || 0));
    setInfo('');
  };

  const handleSave = async () => {
    if (!selected) return;
    const num = Number(editingBalance);
    if (Number.isNaN(num)) return alert('Invalid balance');
    try {
      await adminEditUser(selected._id, { balance: num });
      setInfo('User balance updated');
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to update');
    }
  };

  const openStartStopConfirm = (action) => {
    if (!selected) return alert('Choose a user first');
    setConfirmPayload({ type: 'timer', action, userId: selected._id });
    setConfirmOpen(true);
  };

  const openApproveWithdrawalPrompt = () => {
    const id = prompt('Enter withdrawal id to approve (paste id):');
    if (!id) return;
    setConfirmPayload({ type: 'approveWithdrawal', id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return setConfirmOpen(false);
    try {
      if (confirmPayload.type === 'timer') {
        await adminEditUser(confirmPayload.userId, { action: confirmPayload.action });
        setInfo(`Timer ${confirmPayload.action === 'startTimer' ? 'started' : 'stopped'} for user.`);
        await loadUsers();
      } else if (confirmPayload.type === 'approveWithdrawal') {
        await adminApproveWithdrawal(confirmPayload.id);
        setInfo('Withdrawal approved');
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Operation failed');
    } finally {
      setConfirmOpen(false);
      setConfirmPayload(null);
    }
  };

  const viewMessages = async () => {
    try {
      const res = await adminGetMessages();
      const list = res.data;
      alert(`Messages:\n\n${list.map(m => `${m.username}: ${m.text}`).join('\n')}`);
    } catch (err) {
      console.error(err);
      alert('Failed to load messages');
    }
  };

  const viewPayments = async () => {
    try {
      const res = await adminGetPayments();
      const list = res.data;
      alert(`Payments:\n\n${list.map(p => `${p.username}: ${p.method} - ${JSON.stringify(p.details)}`).join('\n\n')}`);
    } catch (err) {
      console.error(err);
      alert('Failed to load payments');
    }
  };

  const viewWithdrawals = async () => {
    try {
      const res = await adminGetWithdrawals();
      const list = res.data;
      const summary = list.map(w => `${w._id} - ${w.user.username} - $${w.amount} - ${w.status}`).join('\n');
      alert(`Withdrawals:\n\n${summary}`);
    } catch (err) {
      console.error(err);
      alert('Failed to load withdrawals');
    }
  };

  const handleNotifyUser = async () => {
    if (!selected) return alert('Select user to notify');
    const text = prompt('Enter notification text to send to user:');
    if (!text) return;
    try {
      await adminNotifyUser(selected._id, text);
      alert('Notification sent');
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    }
  };

  // NEW: set pin for a stage for selected user
  const handleSetPin = async () => {
    if (!selected) return alert('Select a user first');
    const stage = prompt('Enter stage to set pin for (activation, tax, insurance, verification, security):');
    if (!stage) return;
    const pin = prompt('Enter 4-digit pin for this user:');
    if (!pin || pin.length !== 4) return alert('Please input a 4-digit pin');

    try {
      await adminSetPin(selected._id, stage, pin);
      alert(`Pin set for ${selected.username} at stage ${stage}`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to set pin');
    }
  };

  return (
    <div className="page-container">
      <div className="hstack" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h2>Admin Panel</h2>
        <div className="hstack">
          <button className="btn" onClick={viewMessages}>Messages</button>
          <button className="btn-outline" onClick={viewPayments}>Payments</button>
          <button className="btn-outline" onClick={viewWithdrawals}>Withdrawals</button>
        </div>
      </div>

      <div className="layout-2col">
        <div className="card">
          <h4>Users</h4>
          {loading ? <div>Loading...</div> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {users.map(u => (
                <li key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 6px', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.username}</div>
                    <div className="small-muted">{u.email} • {u.country}</div>
                    <div className="small-muted">Pins set: {u.activationPins ? Object.keys(u.activationPins).filter(k => u.activationPins[k].set).join(', ') : 'none'}</div>
                  </div>
                  <div className="hstack">
                    <div className="small-muted">${Number(u.balance || 0).toFixed(2)}</div>
                    <button className="btn-outline" onClick={() => handleSelect(u)}>Edit</button>
                    <button className="btn-outline" onClick={() => { setSelected(u); handleSetPin(); }}>Set Pin</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="card">
          <h4>Selected user</h4>
          {selected ? (
            <div className="col">
              <div><strong>{selected.username}</strong></div>
              <div className="small-muted">Email: {selected.email}</div>
              <div className="small-muted">Country: {selected.country}</div>

              <label style={{ display: 'block', marginTop: 8 }}>
                <span className="small-muted">Balance</span>
                <input className="input" value={editingBalance} onChange={(e) => setEditingBalance(e.target.value)} />
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn" onClick={handleSave}>Save</button>
                <button className="btn-outline" onClick={() => openStartStopConfirm('startTimer')}>Start Timer</button>
                <button className="btn-outline" onClick={() => openStartStopConfirm('stopTimer')}>Stop Timer</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn-outline" onClick={openApproveWithdrawalPrompt}>Approve withdrawal (by id)</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn-outline" onClick={handleNotifyUser}>Send notification</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn-outline" onClick={handleSetPin}>Set pin for selected user</button>
              </div>

              {info && <div style={{ marginTop: 10, color: '#065f46' }}>{info}</div>}
            </div>
          ) : (
            <div className="small-muted">Select a user to edit their details and control timer.</div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Please confirm"
        message={confirmPayload?.type === 'timer'
          ? `Are you sure you want to ${confirmPayload?.action === 'startTimer' ? 'start' : 'stop'} the timer for this user?`
          : `Approve withdrawal with id: ${confirmPayload?.id}?`}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmPayload(null); }}
        confirmLabel="Yes, proceed"
      />
    </div>
  );
}
