import React from 'react';
import './loader.css';

const CustomLoader = () => {
  return (
    <div className="custom-loader-container" role="alert" aria-busy="true">
      <div className="loaders-wrapper">
        <div className="loader square">
          <svg viewBox="0 0 80 80">
            <rect x="8" y="8" width="64" height="64"></rect>
          </svg>
        </div>
        
        <div className="loader triangle">
          <svg viewBox="0 0 86 80">
            <polygon points="43 8 79 72 7 72"></polygon>
          </svg>
        </div>
        
        <div className="loader circle">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32"></circle>
          </svg>
        </div>
      </div>
      <span className="loading-text">Loading...</span>
    </div>
  );
};

export default CustomLoader; 