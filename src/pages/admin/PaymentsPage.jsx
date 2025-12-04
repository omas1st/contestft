// src/pages/admin/PaymentsPage.jsx
import React, { useEffect, useState } from 'react';
import { adminGetPayments } from '../../services/api';
import '../styles/admin.css';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [viewCards, setViewCards] = useState(null);
  const [viewRaw, setViewRaw] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetPayments();
      const list = Array.isArray(res.data) ? res.data.slice() : [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(list);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePaymentDetails = (payment) => {
    if (expandedPayment && expandedPayment._id === payment._id) {
      setExpandedPayment(null);
    } else {
      setExpandedPayment(payment);
    }
  };

  const handleViewImage = (img) => {
    setViewImage(img);
  };

  const handleViewCards = (cards) => {
    setViewCards(cards);
  };

  const handleViewRaw = (raw) => {
    setViewRaw(raw);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Payment Management</h2>
        <div className="header-actions">
          <button className="btn" onClick={load}>
            Refresh Payments
          </button>
        </div>
      </div>

      <div className="payments-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p className="muted" style={{ marginTop: '12px' }}>Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            No payments submitted yet
          </div>
        ) : (
          <div className="payments-list">
            {payments.map((p, i) => (
              <div key={p._id || `${p.userId || 'u'}-${i}`} className="payment-row">
                <div style={{ flex: 1 }}>
                  <div className="user-name">{p.username || p.user?.username || 'Unknown User'}</div>
                  <div className="muted">
                    <span>{p.stage || p.method || 'Payment'}</span>
                    <span>{p.amount ? `$${Number(p.amount).toFixed(2)}` : 'Amount not specified'}</span>
                    <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Date unknown'}</span>
                  </div>
                  <div className="muted">
                    Status: <span className={p.status === 'approved' ? 'status-badge status-active' : 'status-badge status-inactive'}>
                      {p.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="user-actions">
                  <button
                    className={`btn-outline small ${expandedPayment && expandedPayment._id === p._id ? 'active' : ''}`}
                    onClick={() => togglePaymentDetails(p)}
                  >
                    {expandedPayment && expandedPayment._id === p._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Payment Details Panel - Shows below when expanded */}
                {expandedPayment && expandedPayment._id === p._id && (
                  <div className="details-panel" style={{ gridColumn: '1 / -1' }}>
                    <div className="details-grid">
                      <div className="detail-item">
                        <strong>User:</strong> {p.username || p.user?.username || 'Unknown'}
                      </div>
                      <div className="detail-item">
                        <strong>Stage/Method:</strong> {p.stage || p.method || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Amount:</strong> ${Number(p.amount || 0).toFixed(2)}
                      </div>
                      <div className="detail-item">
                        <strong>Date:</strong> {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                      </div>
                      
                      {/* Payment Details Content */}
                      <div className="detail-item full-width">
                        <strong>Payment Details:</strong>
                        <div style={{ marginTop: '12px' }}>
                          {/* Check for cards first */}
                          {((p.cards && p.cards.length > 0) || 
                            (p.raw && p.raw.cards && p.raw.cards.length > 0) || 
                            (p.details && p.details.cards && p.details.cards.length > 0)) ? (
                            <div className="cards-grid">
                              {(p.cards || p.raw?.cards || p.details?.cards || []).map((c, idx) => (
                                <div key={idx} className="card-item">
                                  <div className="card-header">
                                    <strong>Card #{idx + 1}:</strong> {c.giftCard || c.type || 'Gift Card'}
                                  </div>
                                  <div className="card-body">
                                    <div>
                                      <strong>PIN:</strong>{' '}
                                      <code style={{ 
                                        background: '#f0fdf4', 
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        border: '1px solid #bbf7d0'
                                      }}>
                                        {c.pin || 'Not provided'}
                                      </code>
                                    </div>
                                    {c.file && (c.file.path || c.file.url || c.file.filename) && (
                                      <div style={{ marginTop: '12px' }}>
                                        <strong>Card Image:</strong>
                                        <div style={{ marginTop: '8px' }}>
                                          <img
                                            src={c.file.path || c.file.url}
                                            alt={`Card ${idx + 1}`}
                                            style={{ 
                                              maxWidth: '100%', 
                                              maxHeight: '200px',
                                              borderRadius: '8px',
                                              border: '1px solid #e5e7eb',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => handleViewImage(c.file.path || c.file.url)}
                                          />
                                          {c.file.filename && (
                                            <div className="muted" style={{ marginTop: '4px' }}>
                                              File: {c.file.filename}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : p.image || p.details?.image || p.details?.imagePath || p.raw?.image ? (
                            <div>
                              <strong>Payment Image:</strong>
                              <div style={{ marginTop: '12px' }}>
                                <img
                                  src={p.image || p.details?.image || p.details?.imagePath || p.raw?.image}
                                  alt="Payment"
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '300px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleViewImage(p.image || p.details?.image || p.details?.imagePath || p.raw?.image)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <strong>Raw Details:</strong>
                              <div style={{ 
                                background: '#f8fafc', 
                                padding: '12px', 
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                marginTop: '8px'
                              }}>
                                <pre style={{ 
                                  whiteSpace: 'pre-wrap', 
                                  fontSize: '14px', 
                                  margin: 0,
                                  fontFamily: 'monospace'
                                }}>
                                  {JSON.stringify(p.details || p.raw || p, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="detail-item full-width">
                        <div className="actions-row">
                          {((p.cards && p.cards.length > 0) || 
                            (p.raw && p.raw.cards && p.raw.cards.length > 0) || 
                            (p.details && p.details.cards && p.details.cards.length > 0)) && (
                            <button 
                              className="btn-outline"
                              onClick={() => handleViewCards(p.cards || p.raw?.cards || p.details?.cards || [])}
                            >
                              View All Cards
                            </button>
                          )}
                          {p.image || p.details?.image || p.details?.imagePath || p.raw?.image ? (
                            <button 
                              className="btn-outline"
                              onClick={() => handleViewImage(p.image || p.details?.image || p.details?.imagePath || p.raw?.image)}
                            >
                              View Full Image
                            </button>
                          ) : null}
                          <button 
                            className="btn-outline"
                            onClick={() => handleViewRaw(p.details || p.raw || p)}
                          >
                            View Raw Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing image */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Image</h3>
              <button className="btn-outline" onClick={() => setViewImage(null)}>Close</button>
            </div>
            <div className="modal-body">
              <img
                src={viewImage}
                alt="Payment"
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing cards */}
      {viewCards && (
        <div className="modal-overlay" onClick={() => setViewCards(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gift Card Details</h3>
              <button className="btn-outline" onClick={() => setViewCards(null)}>Close</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: '16px' }}>
                {viewCards.map((c, idx) => (
                  <div key={idx} className="card-item">
                    <div className="card-header">
                      <strong>Card #{idx + 1}:</strong> {c.giftCard || c.type || 'Gift Card'}
                    </div>
                    <div className="card-body">
                      <div>
                        <strong>PIN:</strong>{' '}
                        <code style={{ 
                          background: '#f0fdf4', 
                          padding: '8px 12px', 
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0',
                          fontSize: '16px',
                          fontFamily: 'monospace'
                        }}>
                          {c.pin || 'Not provided'}
                        </code>
                      </div>
                      {c.file && (c.file.path || c.file.url || c.file.filename) && (
                        <div style={{ marginTop: '16px' }}>
                          <strong>Card Image:</strong>
                          <div style={{ marginTop: '8px' }}>
                            <img
                              src={c.file.path || c.file.url}
                              alt={`Card ${idx + 1}`}
                              style={{ 
                                maxWidth: '100%',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                              }}
                            />
                            {c.file.filename && (
                              <div className="muted" style={{ marginTop: '8px' }}>
                                File: {c.file.filename}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing raw data */}
      {viewRaw && (
        <div className="modal-overlay" onClick={() => setViewRaw(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raw Payment Data</h3>
              <button className="btn-outline" onClick={() => setViewRaw(null)}>Close</button>
            </div>
            <div className="modal-body">
              <div style={{ 
                background: '#f8fafc', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                maxHeight: '60vh',
                overflow: 'auto'
              }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '14px', 
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(viewRaw, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
