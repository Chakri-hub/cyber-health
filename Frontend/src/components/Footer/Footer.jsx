import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Cyber Health. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);