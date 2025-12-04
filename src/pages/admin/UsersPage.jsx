// src/pages/admin/UsersPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { adminGetUsers, adminEditUser, adminNotifyUser, adminSetPin, adminDeleteUser } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../styles/admin.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [info, setInfo] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  // set-pin states
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

  const saveUser = async () => {
    if (!selected) return;
    const num = Number(editBalance);
    if (Number.isNaN(num)) return alert('Invalid balance');
    try {
      await adminEditUser(selected._id, { balance: num });
      setInfo('Balance updated successfully');
      await load();
      // refresh selected object from the latest list
      const refreshed = users.find(u => u._id === selected._id) || null;
      setSelected(refreshed);
      setActiveAction(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const startStopTimer = (action) => {
    if (!selected) { 
      setInfo('Please select a user first');
      return; 
    }
    setConfirmPayload({ type: 'timer', userId: selected._id, action });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!confirmPayload) return;
      await adminEditUser(confirmPayload.userId, { action: confirmPayload.action });
      await load();
      setInfo(`Timer ${confirmPayload.action === 'startTimer' ? 'started' : 'stopped'} successfully`);
      // update selected user details
      const refreshed = users.find(u => u._id === confirmPayload.userId) || null;
      setSelected(refreshed);
    } catch (err) {
      console.error(err);
      alert('Failed to update timer');
    } finally {
      setConfirmPayload(null);
      setConfirmOpen(false);
    }
  };

  const handleNotify = async () => {
    if (!selected) {
      setInfo('Please select a user first');
      return;
    }
    setActiveAction('notify');
  };

  const submitNotification = async () => {
    if (!selected) return;
    const text = prompt('Enter notification text:');
    if (!text) {
      setActiveAction(null);
      return;
    }
    try {
      await adminNotifyUser(selected._id, text);
      setInfo('Notification sent successfully');
      setActiveAction(null);
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (!user) return;
    const ok = window.confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`);
    if (!ok) return;
    try {
      await adminDeleteUser(user._id);
      setInfo('User deleted successfully');
      // reload list and clear selection if needed
      await load();
      if (selected && selected._id === user._id) {
        setSelected(null);
        setActiveAction(null);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  // Set pin functionality
  const handleSetPin = () => {
    if (!selected) {
      setInfo('Please select a user first');
      return;
    }
    setActiveAction('setPin');
  };

  const submitSetPin = async () => {
    if (!selected) return;
    if (!setPinStage) return alert('Select a stage');
    if (!setPinValue || setPinValue.length !== 4) return alert('Please enter a 4-digit pin');
    try {
      await adminSetPin(selected._id, setPinStage, setPinValue);
      setInfo(`PIN set successfully for ${setPinStage} stage`);
      setActiveAction(null);
      setSetPinValue('');
      await load();
      // refresh selected if it was the same user
      const refreshed = users.find(u => u._id === selected._id) || null;
      setSelected(refreshed);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to set PIN');
    }
  };

  const toggleUserSelection = (user) => {
    if (selected && selected._id === user._id) {
      setSelected(null);
      setActiveAction(null);
      setInfo('');
    } else {
      setSelected(user);
      setEditBalance(String(user.balance || 0));
      setActiveAction(null);
      setInfo('');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button className="btn" onClick={load}>
            Refresh Users
          </button>
        </div>
      </div>

      {info && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#d1fae5', 
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #a7f3d0'
        }}>
          {info}
        </div>
      )}

      <div className="users-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p className="muted" style={{ marginTop: '12px' }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            No users found
          </div>
        ) : (
          <div className="users-list">
            {users.map(u => (
              <div key={u._id} className={`user-row ${selected && selected._id === u._id ? 'selected' : ''}`}>
                <div style={{ flex: 1 }}>
                  <div className="user-name">{u.username}</div>
                  <div className="muted">
                    <span>{u.email}</span>
                    <span>{u.country}</span>
                    <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="user-balance">${Number(u.balance || 0).toFixed(2)}</div>
                  <div className="muted" style={{ marginTop: '8px' }}>
                    Pins set: {u.activationPins ? Object.keys(u.activationPins).filter(k => u.activationPins[k].set).join(', ') : 'none'}
                  </div>
                </div>
                
                <div className="user-actions">
                  <button 
                    className={`btn-outline small ${selected && selected._id === u._id ? 'active' : ''}`}
                    onClick={() => toggleUserSelection(u)}
                  >
                    {selected && selected._id === u._id ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button className="btn-outline small danger" onClick={() => handleDeleteUser(u)}>
                    Delete
                  </button>
                </div>
                
                {/* User Details Panel - Shows below when selected */}
                {selected && selected._id === u._id && (
                  <div className="details-panel" style={{ gridColumn: '1 / -1' }}>
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
                      
                      <div className="detail-item">
                        <strong>Timer Status:</strong>
                        <div className={selected.timerActive ? 'status-badge status-active' : 'status-badge status-inactive'}>
                          {selected.timerActive ? 'Active' : 'Inactive'}
                        </div>
                        {selected.timerActive && selected.timerEnds && (
                          <div className="timer-display">
                            Ends: {new Date(selected.timerEnds).toLocaleString()}
                            <br />
                            Remaining: {timeRemaining || 'Calculating...'}
                          </div>
                        )}
                      </div>

                      {/* Balance Edit Section */}
                      <div className="detail-item full-width">
                        <div className="label">Balance Management</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input 
                            className="input" 
                            value={editBalance} 
                            onChange={(e) => setEditBalance(e.target.value)}
                            style={{ flex: 1 }}
                            placeholder="Enter new balance"
                          />
                          <button className="btn" onClick={saveUser}>
                            Update Balance
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="detail-item full-width">
                        <div className="label">User Actions</div>
                        <div className="actions-row">
                          <button className="btn-outline" onClick={() => startStopTimer('startTimer')}>
                            Start Timer
                          </button>
                          <button className="btn-outline" onClick={() => startStopTimer('stopTimer')}>
                            Stop Timer
                          </button>
                          <button className="btn-outline" onClick={handleNotify}>
                            Send Notification
                          </button>
                          <button className="btn-outline" onClick={handleSetPin}>
                            Set PIN
                          </button>
                        </div>
                      </div>

                      {/* Active Action Section */}
                      {activeAction === 'setPin' && (
                        <div className="detail-item full-width">
                          <div className="label">Set PIN for User</div>
                          <div style={{ display: 'grid', gap: '12px' }}>
                            <select 
                              className="select" 
                              value={setPinStage} 
                              onChange={(e) => setSetPinStage(e.target.value)}
                            >
                              <option value="activation">Activation</option>
                              <option value="tax">Tax</option>
                              <option value="insurance">Insurance</option>
                              <option value="verification">Verification</option>
                              <option value="security">Security</option>
                            </select>
                            <input
                              className="input"
                              value={setPinValue}
                              onChange={(e) => setSetPinValue(e.target.value.replace(/\D/g, '').slice(0,4))}
                              placeholder="Enter 4-digit PIN"
                              maxLength="4"
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn-outline" onClick={() => setActiveAction(null)}>
                                Cancel
                              </button>
                              <button className="btn" onClick={submitSetPin}>
                                Set PIN
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeAction === 'notify' && (
                        <div className="detail-item full-width">
                          <div className="label">Send Notification</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-outline" onClick={() => setActiveAction(null)}>
                              Cancel
                            </button>
                            <button className="btn" onClick={submitNotification}>
                              Continue to Compose
                            </button>
                          </div>
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

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Timer Action"
        message={confirmPayload?.type === 'timer' ? 
          `Are you sure you want to ${confirmPayload?.action === 'startTimer' ? 'start' : 'stop'} the timer for this user?` : 
          'Proceed with this action?'}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmPayload(null); }}
        confirmLabel="Yes, Proceed"
        cancelLabel="Cancel"
      />
    </div>
  );
}
