// src/pages/admin/MessagesPage.jsx
import React, { useEffect, useState } from 'react';
import { adminGetMessages } from '../../services/api';
import '../styles/adminmessage.css';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetMessages();
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="admin-page card">
      <h2>Messages</h2>
      <div>
        {loading ? <div>Loading...</div> : (
          messages.length ? (
            <ul className="list-plain">
              {messages.map((m, idx) => (
                <li key={idx} className="msg-row">
                  <div>
                    <div className="user-name">{m.username}</div>
                    <div className="muted">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div className="card" style={{ padding: 10, background: '#fafafa' }}>{m.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="muted">No messages yet.</div>
        )}
      </div>
    </div>
  );
}
