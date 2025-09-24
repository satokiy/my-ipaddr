import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">IPアドレス情報を取得中...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
