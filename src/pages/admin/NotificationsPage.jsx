// src/pages/admin/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminNotifyUser } from '../../services/api';
import '../styles/admin.css';

export default function NotificationsPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();
      setUsers(res.data);
      if (res.data.length) setSelectedUser(res.data[0]._id);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSend = async () => {
    if (!selectedUser || !text.trim()) return alert('Select user and enter text');
    try {
      await adminNotifyUser(selectedUser, text);
      alert('Notification sent');
      setText('');
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="admin-page card">
      <h2>Send Notification</h2>
      <div>
        {loading ? <div>Loading...</div> : (
          <>
            <label className="label">User</label>
            <select className="input" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              {users.map(u => <option key={u._id} value={u._id}>{u.username} — {u.email}</option>)}
            </select>

            <label className="label" style={{ marginTop: 8 }}>Message</label>
            <textarea className="input" rows="5" value={text} onChange={(e) => setText(e.target.value)} />

            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={handleSend}>Send Notification</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
