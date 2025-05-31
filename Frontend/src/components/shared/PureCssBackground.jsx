import React from 'react';
import './PureCssBackground.css';

function PureCssBackground({ children }) {
  return (
    <div className="pure-css-background-wrapper">
      <div className="area">
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
      </div>
      <div className="pure-css-content">
        <div className="context">
          {/* The h1 is optional and can be removed if not needed */}
          {/* <h1>Pure CSS Animated Background</h1> */}
        </div>
        {children}
      </div>
    </div>
  );
}

export default PureCssBackground;