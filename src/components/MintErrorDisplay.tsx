import React from 'react';

interface MintErrorDisplayProps {
  errorMessage: string;
  onClose: () => void;
  onRetry?: () => void;
}

const MintErrorDisplay: React.FC<MintErrorDisplayProps> = ({ 
  errorMessage, 
  onClose,
  onRetry 
}) => {
  return (
    <div className="error-popup">
      <div className="error-popup-content">
        <button 
          onClick={onClose} 
          className="popup-close-button"
        >
          ×
        </button>
        
        <h3 className="error-title">❌ Mint Failed</h3>
        
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
        
        <div className="error-actions">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="button button-secondary"
            >
              Try Again
            </button>
          )}
          <button 
            onClick={onClose}
            className="button button-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintErrorDisplay;