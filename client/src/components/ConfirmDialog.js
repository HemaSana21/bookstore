import React, { useEffect, useState } from 'react';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Type your reason here...',
  danger = false,
  loading = false,
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason to continue.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p className="modal-message">{message}</p>}

        {requireReason && (
          <div className="modal-field">
            <label>{reasonLabel}</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              autoFocus
            />
            {error && <span className="modal-error">{error}</span>}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-btn-primary ${danger ? 'danger' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;