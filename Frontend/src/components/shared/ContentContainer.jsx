import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './ContentContainer.css';

function ContentContainer({ children, className = '' }) {
  const location = useLocation();
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Add animation class after component mounts for entrance animation
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add('animate-in');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className={`content-container ${className}`} ref={containerRef}>
      <div className="content-background">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
        <div className="bg-gradient bg-gradient-4"></div>
        <div className="bg-symbols">
          <div className="shield-symbol"></div>
          <div className="shield-symbol shield-symbol-2"></div>
          <div className="shield-symbol shield-symbol-3"></div>
          <div className="plus-symbol"></div>
          <div className="plus-symbol plus-symbol-2"></div>
          <div className="plus-symbol plus-symbol-3"></div>
          <div className="plus-symbol plus-symbol-4"></div>
          <div className="plus-symbol plus-symbol-5"></div>
          <div className="plus-symbol plus-symbol-6"></div>
          <div className="plus-symbol plus-symbol-7"></div>
        </div>
      </div>
      <div className="content-body">
        {children}
      </div>
    </div>
  );
}

export default ContentContainer;