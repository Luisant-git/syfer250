import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button/Button';

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item", 
  message = "Are you sure you want to delete this item?",
  itemName = "",
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: '#666'
          }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} color="#dc2626" />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          margin: '0 0 1rem 0',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {title}
        </h2>

        {/* Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>{message}</p>
          {itemName && (
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              fontWeight: '600', 
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              "{itemName}"
            </p>
          )}
          <p style={{ 
            margin: '1rem 0 0 0', 
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            style={{ 
              minWidth: '100px',
              backgroundColor: '#dc2626',
              borderColor: '#dc2626'
            }}
          >
            {loading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeleteModal;