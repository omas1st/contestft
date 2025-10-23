// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { getDashboard, sendMessage, logout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './styles/dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState({ username: '', balance: 0, timerActive: false, timerEnds: null, notifications: [] });
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('00:00:00');
  const [msgText, setMsgText] = useState('');
  const [msgStatus, setMsgStatus] = useState('');
  const timerRef = useRef(null);
  const nav = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data);
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
    const iv = setInterval(fetchDashboard, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (data.timerActive && data.timerEnds) {
      timerRef.current = setInterval(() => {
        const ends = new Date(data.timerEnds).getTime();
        const now = Date.now();
        const diff = ends - now;
        if (diff <= 0) {
          setCountdown('00:00:00');
          clearInterval(timerRef.current);
          fetchDashboard();
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setCountdown('00:00:00');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data.timerActive, data.timerEnds]);

  const handleSendMessage = async () => {
    if (!msgText.trim()) return setMsgStatus('Please write a message');
    try {
      setMsgStatus('Sending...');
      await sendMessage(msgText);
      setMsgStatus('Message sent.');
      setMsgText('');
    } catch (err) {
      setMsgStatus(err?.response?.data?.message || 'Failed to send message');
    }
  };

  const userRole = localStorage.getItem('role');

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="welcome-section">
            <h2 className="welcome-text">
              Welcome, <span className="welcome-username">{data.username}</span>
            </h2>
          </div>

          <div className="header-actions">
            {userRole === 'admin' && (
              <button
                className="admin-panel-btn"
                onClick={() => { window.location.href = '/admin'; }}
              >
                <svg className="admin-icon" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"/>
                </svg>
                Admin Panel
              </button>
            )}

            {/* Logout button intentionally hidden on this page.
                The `logout` function (imported above) is still used for 401 handling in fetchDashboard. */}
          </div>
        </div>
      </header>

      {/* Separate Account Balance Section */}
      <section className="balance-section">
        <div className="balance-label">ACCOUNT BALANCE</div>
        <div className="balance-amount">
          <span className="balance-currency">$</span>
          {Number(data.balance || 0).toFixed(2)}
        </div>
      </section>

      <section className="dashboard-main">
        <div className="dashboard-card timer-section">
          <h3>Fast Finger Countdown</h3>
          <div className={data.timerActive ? "timer-display timer-active" : "timer-inactive"}>
            {data.timerActive ? countdown : 'Timer inactive'}
          </div>

          <div className="btn-group">
            <button
              className="btn"
              disabled={!data.timerActive || Number(data.balance) < 1}
              onClick={() => nav('/withdraw')}
            >
              Withdraw
            </button>
          </div>

          <div className="timer-note">
            Note: The withdraw button becomes active only during the countdown. Send "I am ready for the contest" to have your account credited and start the countdown.
          </div>

          <hr className="section-divider" />

          {msgStatus && (
            <div className={`status-message ${
              msgStatus.includes('Sending') ? 'status-info' : 
              msgStatus.includes('Failed') ? 'status-error' : 'status-success'
            }`}>
              {msgStatus}
            </div>
          )}
        </div>

        <aside>
          <div className="dashboard-card message-section">
            <h4>Send message</h4>
            <textarea 
              value={msgText} 
              onChange={(e) => setMsgText(e.target.value)} 
              placeholder="Write your message..." 
              className="message-textarea"
            />
            <div className="message-actions">
              <button className="btn" onClick={handleSendMessage}>Send</button>
              <button className="btn-outline" onClick={() => setMsgText('')}>Clear</button>
            </div>
            {msgStatus && (
              <div className={`status-message ${
                msgStatus.includes('Sending') ? 'status-info' : 
                msgStatus.includes('Failed') ? 'status-error' : 'status-success'
              }`}>
                {msgStatus}
              </div>
            )}
          </div>

          <div className="dashboard-card notifications-section">
            <h4>Notifications</h4>
            {data.notifications && data.notifications.length ? (
              <ul className="notifications-list">
                {data.notifications.slice().reverse().map((n, i) => (
                  <li key={i} className="notification-item">
                    <div className="notification-text">{n.text}</div>
                    <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            ) : <div className="no-notifications">No notifications yet</div>}
          </div>
        </aside>
      </section>
    </div>
  );
}
