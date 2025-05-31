import React, { useState } from 'react';
import './SocialBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInstagram, 
  faFacebook, 
  faTelegram,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { faShare, faShareNodes } from '@fortawesome/free-solid-svg-icons';

function SocialBar() {
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  const toggleShareDropdown = () => {
    setShowShareDropdown(!showShareDropdown);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = document.title;
    
    let shareUrl;
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        setShowShareDropdown(false);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareDropdown(false);
  };

  return (
    <div className="social-bar">
      <div className="social-bar-container">
        <div className="cyber-health-brand">
          {/* Placeholder for brand logo/text if needed */}
        </div>

        <div className="social-icons-container">
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon x-icon">
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M13.982 10.622l5.979-6.92H17.79L12.73 9.317 8.67 3.702h-3.92l6.25 8.613-6.251 7.214h2.171l5.338-6.173 4.259 6.173h3.919l-6.455-8.907zm-1.97 2.275l-.619-.882-4.934-7.042h2.106l3.979 5.682.618.882 5.165 7.382h-2.106l-4.209-6.022z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FontAwesomeIcon icon={faTelegram} />
            </a>
            <a href="https://www.youtube.com/channel/UCI-royLFCIAmIzjhMvMAszA" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <div className="vertical-divider"></div>
            <div className="share-button" 
              onMouseEnter={() => setShowShareDropdown(true)} 
              onMouseLeave={() => setShowShareDropdown(false)}>
              <button className="share-icon" onClick={(e) => {
                e.stopPropagation();
                
                // Copy the current URL to clipboard
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                
                // Create and show a transform popup notification
                const notification = document.createElement('div');
                notification.className = 'copy-notification';
                notification.innerHTML = `
                  <div class="notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div class="notification-text">Link copied!</div>
                `;
                document.body.appendChild(notification);
                
                // Animation will automatically remove the element through CSS
                setTimeout(() => {
                  notification.classList.add('hiding');
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 500);
                }, 1500);
                
                // Toggle the dropdown
                toggleShareDropdown();
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="share-button-icon">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
              
              {showShareDropdown && (
                <div className="share-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleShare('facebook')}>
                    <FontAwesomeIcon icon={faFacebook} /> Facebook
                  </button>
                  <button onClick={() => handleShare('x')}>
                    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{marginRight: '5px'}}>
                      <path d="M13.982 10.622l5.979-6.92H17.79L12.73 9.317 8.67 3.702h-3.92l6.25 8.613-6.251 7.214h2.171l5.338-6.173 4.259 6.173h3.919l-6.455-8.907zm-1.97 2.275l-.619-.882-4.934-7.042h2.106l3.979 5.682.618.882 5.165 7.382h-2.106l-4.209-6.022z"></path>
                    </svg> X
                  </button>
                  <button onClick={() => handleShare('telegram')}>
                    <FontAwesomeIcon icon={faTelegram} /> Telegram
                  </button>
                  <button onClick={() => handleShare()}>
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialBar;