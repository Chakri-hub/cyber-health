import React from 'react';
import './AnimatedBackground.css';

function AnimatedBackground({ children, className = '' }) {
  return (
    <div className={`animated-background-wrapper ${!children ? 'no-content' : ''}`}>
      <div className="animated-background">
        <div className="color-orb orb-1"></div>
        <div className="color-orb orb-2"></div>
        <div className="color-orb orb-3"></div>
        <div className="color-orb orb-4"></div>
      </div>
      
      {children}
    </div>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(AnimatedBackground);