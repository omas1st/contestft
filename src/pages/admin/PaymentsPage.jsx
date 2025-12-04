import React, { useEffect, useState } from 'react';
import { adminGetPayments } from '../../services/api';
import Modal from '../../components/Modal';
import '../styles/adminpayment.css';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  // viewImage used by your original file; keep it for image-only modal compatibility
  const [viewImage, setViewImage] = useState(null);
  // new states for viewing cards or raw details
  const [viewCards, setViewCards] = useState(null); // array of { giftCard, pin, file }
  const [viewRaw, setViewRaw] = useState(null); // raw details object to show in modal

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetPayments();
      // ensure newest first client-side as a safety net
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

  const handleView = (p) => {
    // Prefer cards if present (our backend now returns .cards)
    const cards = p.cards || (p.raw && p.raw.cards) || (p.details && p.details.cards) || [];
    if (cards && cards.length) {
      setViewCards(cards);
      setViewImage(null);
      setViewRaw(null);
      return;
    }

    // Next, try image fields (support a few possible shapes)
    const img = p.image || p.details?.image || p.details?.imagePath || (p.raw && p.raw.image) || null;
    if (img) {
      setViewImage(img);
      setViewCards(null);
      setViewRaw(null);
      return;
    }

    // Last resort: show raw details object in a modal
    const raw = p.details || p.raw || p;
    setViewRaw(raw);
    setViewImage(null);
    setViewCards(null);
  };

  return (
    <div className="admin-page card">
      <h2>Payments</h2>
      {loading ? <div>Loading...</div> : (
        payments.length ? (
          <ul className="list-plain">
            {payments.map((p, i) => (
              <li key={p._id || `${p.userId || 'u'}-${i}`} className="payment-row">
                <div style={{ flex: 1 }}>
                  <div className="user-name">{p.username || p.user?.username || 'Unknown'}</div>
                  <div className="muted">
                    {(p.stage || p.method || 'payment').toString()} • {p.amount ? `$${Number(p.amount).toFixed(2)}` : ''}
                    {' • '}
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                  </div>
                </div>

                <div style={{ marginLeft: 12 }}>
                  <button
                    className="btn-outline small"
                    onClick={() => handleView(p)}
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <div className="muted">No payments submitted yet.</div>
      )}

      {/* Image modal (keeps original behavior) */}
      <Modal isOpen={!!viewImage} title="Payment image" onClose={() => setViewImage(null)}>
        {viewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={viewImage.startsWith('/') ? viewImage : viewImage}
              alt="payment"
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 8 }}
            />
          </div>
        )}
      </Modal>

      {/* Cards modal */}
      <Modal isOpen={!!viewCards} title="Submitted Gift Card Details" onClose={() => setViewCards(null)}>
        {viewCards && (
          <div style={{ display: 'grid', gap: 16 }}>
            {viewCards.map((c, idx) => (
              <div 
                key={`${c.giftCard || 'card'}-${idx}`} 
                style={{ 
                  border: '2px solid #3b82f6', 
                  padding: 16, 
                  borderRadius: 8,
                  background: '#f8fafc'
                }}
              >
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: '18px', 
                  color: '#1e40af',
                  marginBottom: 12,
                  borderBottom: '1px solid #dbeafe',
                  paddingBottom: 8
                }}>
                  Card #{idx + 1}: {c.giftCard || c.type || 'Gift Card'}
                </div>
                
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>
                    <strong style={{ color: '#374151' }}>PIN:</strong>{' '}
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '16px', 
                      fontWeight: 600,
                      color: '#059669',
                      background: '#f0fdf4',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid #bbf7d0'
                    }}>
                      {c.pin || 'Not provided'}
                    </span>
                  </div>
                  
                  {c.file && (c.file.path || c.file.url || c.file.filename) && (
                    <div>
                      <strong style={{ color: '#374151', display: 'block', marginBottom: 8 }}>Card Image:</strong>
                      <div style={{ 
                        border: '2px dashed #d1d5db',
                        padding: 12,
                        borderRadius: 8,
                        background: 'white'
                      }}>
                        <img
                          src={c.file.path ? (c.file.path.startsWith('/') ? c.file.path : c.file.path) : (c.file.url || '')}
                          alt={`${c.giftCard || 'card'}-${idx}`}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: 300, 
                            borderRadius: 6,
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      </div>
                      {c.file.filename && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280', 
                          marginTop: 4,
                          textAlign: 'center'
                        }}>
                          File: {c.file.filename}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Raw details modal */}
      <Modal isOpen={!!viewRaw} title="Complete Payment Details" onClose={() => setViewRaw(null)}>
        {viewRaw && (
          <div style={{ 
            background: '#f8fafc', 
            padding: 16, 
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: 14, 
              margin: 0,
              fontFamily: 'monospace',
              color: '#1e293b'
            }}>
              {JSON.stringify(viewRaw, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
