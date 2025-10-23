// src/components/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import './styles/modal.css';

/**
 * ConfirmDialog - simple confirmation modal
 *
 * Props:
 * - isOpen: boolean
 * - title: string (optional)
 * - message: string | node (optional)
 * - onConfirm: function (required)
 * - onCancel: function (required)
 * - confirmLabel: string (optional) - default "Confirm"
 * - cancelLabel: string (optional) - default "Cancel"
 */
function ConfirmDialog({
  isOpen,
  title = 'Confirm',
  message = '',
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) {
  if (!isOpen) return null;

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
      <button
        type="button"
        className="btn-outline"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        className="btn"
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} footer={footer}>
      <div style={{ minWidth: 320 }}>
        {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
      </div>
    </Modal>
  );
}

// named export + default export to support both import styles
export { ConfirmDialog };
export default ConfirmDialog;
