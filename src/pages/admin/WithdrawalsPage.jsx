// src/pages/admin/WithdrawalsPage.jsx
import React, { useEffect, useState } from 'react';
import { adminGetWithdrawals, adminApproveWithdrawal } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../styles/adminwithdraw.css';

export default function WithdrawalsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetWithdrawals();
      // ensure newest first client-side too just in case backend not sorted
      const sorted = (res.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setList(sorted);
    } catch (err) {
      console.error(err);
      alert('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openApprove = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await adminApproveWithdrawal(confirmId);
      alert('Approved');
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="admin-page card">
      <h2>Withdrawals</h2>
      {loading ? <div>Loading...</div> : (
        list.length ? (
          <ul className="list-plain">
            {list.map(w => (
              <li key={w._id} className="withdraw-row">
                <div style={{ flex: 1 }}>
                  <div className="user-name">{w.user?.username || 'Unknown'}</div>
                  <div className="muted">{w.amount} • {w.status} • {new Date(w.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ marginLeft: 12 }}>
                  <button className="btn-outline small" onClick={() => { alert(JSON.stringify(w.details || {}, null, 2)); }}>View</button>
                  {/* Set Pin removed from withdrawals page (now on users page) */}
                  {w.status !== 'approved' && <button className="btn small" onClick={() => openApprove(w._id)}>Approve</button>}
                </div>
              </li>
            ))}
          </ul>
        ) : <div className="muted">No withdrawals yet.</div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Approve withdrawal"
        message={`Approve withdrawal id: ${confirmId}? This will deduct user's balance and notify them.`}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmId(null); }}
      />
    </div>
  );
}
