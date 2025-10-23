// src/components/Modal.jsx
import React from 'react';
import './styles/modal.css';

/**
 * Simple modal component (no portal) - renders overlay & centered dialog.
 *
 * Props:
 * - isOpen: boolean
 * - title: string (optional)
 * - onClose: function
 * - children: node
 * - footer: node (optional)
 */
export default function Modal({ isOpen, title, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-dialog" onMouseDown={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
