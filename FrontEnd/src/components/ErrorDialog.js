import React from 'react';
import './Modal.css';

const ErrorDialog = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="error-dialog-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 style={{color: '#d32f2f'}}>Lỗi</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{color: '#d32f2f'}}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button modal-button-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog; 