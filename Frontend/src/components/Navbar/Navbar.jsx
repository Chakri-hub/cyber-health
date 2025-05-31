import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setFontSize, 
  setTextSpacing, 
  setHideImages, 
  setDarkMode, 
  resetSettings 
} from '../../store/slices/accessibilitySlice';
import { logoutUser } from '../../store/slices/authSlice';
import { showAuthModal } from '../../store/slices/modalSlice';
import './Navbar.css';
import shieldLogo from '../../assets/shield.gif';
import LogoutButton from './Logout Button/LogoutButton';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    fontSize,
    textSpacing,
    hideImages,
    darkMode
  } = useSelector(state => state.accessibility);
  const { user } = useSelector(state => state.auth);
  
  const [showAccessibilityMenu, setShowAccessibilityMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const accessibilityMenuRef = useRef(null);
  const accessibilityButtonRef = useRef(null);
  
  // Handle login/register button click with scroll anchor
  const handleAuthClick = () => {
    dispatch(showAuthModal());
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (showAccessibilityMenu && 
          accessibilityMenuRef.current && 
          !accessibilityMenuRef.current.contains(event.target) &&
          accessibilityButtonRef.current && 
          !accessibilityButtonRef.current.contains(event.target)) {
        setShowAccessibilityMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccessibilityMenu]);

  const handleFontSizeChange = (newSize) => {
    if (newSize >= 12 && newSize <= 24) {
      dispatch(setFontSize(newSize));
    }
  };

  const handleTextSpacingChange = (newSpacing) => {
    if (newSpacing >= 0.8 && newSpacing <= 2) {
      dispatch(setTextSpacing(parseFloat(newSpacing.toFixed(1))));
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Home">
          <img src={shieldLogo} alt="Cyber Health Logo" className="navbar-logo-image" />
          <span className="navbar-logo-text">Cyber Health</span>
        </Link>

        <button 
          className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
          style={{ overflowAnchor: 'auto' }}
        >
          <span className="hamburger-icon"></span>
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item accessibility-item">
            <button 
              ref={accessibilityButtonRef}
              className="accessibility-button" 
              aria-label="Accessibility Options"
              aria-expanded={showAccessibilityMenu}
              onClick={(e) => {
                e.stopPropagation();
                setShowAccessibilityMenu(!showAccessibilityMenu);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accessibility-icon">
                <circle cx="16" cy="19" r="2"></circle>
                <circle cx="9" cy="19" r="2"></circle>
                <path d="M9 15V9a3 3 0 0 1 6 0v1"></path>
                <path d="M12 5.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z"></path>
                <path d="M17 14h-5.5l-1-7"></path>
                <path d="M11 9h5"></path>
              </svg>
            </button>
            
            <div 
              ref={accessibilityMenuRef} 
              className={`accessibility-menu ${showAccessibilityMenu ? 'active' : ''}`}
              role="menu"
              aria-label="Accessibility options"
            >
              <h3 id="accessibility-title">Accessibility Options</h3>
              
              <div className="accessibility-option" role="menuitem">
                <label htmlFor="font-size">
                  Text Size
                </label>
                <div className="accessibility-controls">
                  <button 
                    onClick={() => handleFontSizeChange(fontSize - 1)}
                    aria-label="Decrease text size"
                    disabled={fontSize <= 12}
                  >
                    A-
                  </button>
                  <span className="accessibility-value" aria-label="Current font size">
                    {fontSize}px
                  </span>
                  <button 
                    onClick={() => handleFontSizeChange(fontSize + 1)}
                    aria-label="Increase text size"
                    disabled={fontSize >= 24}
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="accessibility-option" role="menuitem">
                <label htmlFor="text-spacing">
                  Text Spacing
                </label>
                <div className="accessibility-controls">
                  <button 
                    onClick={() => handleTextSpacingChange(textSpacing - 0.1)}
                    aria-label="Decrease text spacing"
                    disabled={textSpacing <= 0.8}
                  >
                    -
                  </button>
                  <span className="accessibility-value" aria-label="Current text spacing">
                    {textSpacing}x
                  </span>
                  <button 
                    onClick={() => handleTextSpacingChange(textSpacing + 0.1)}
                    aria-label="Increase text spacing"
                    disabled={textSpacing >= 2}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="accessibility-option" role="menuitem">
                <label htmlFor="hide-images">
                  Hide Images
                </label>
                <div className="accessibility-controls">
                  <button 
                    className={hideImages ? 'active' : ''}
                    onClick={() => dispatch(setHideImages(!hideImages))}
                    aria-pressed={hideImages}
                    aria-label="Toggle image visibility"
                  >
                    {hideImages ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="accessibility-option" role="menuitem">
                <label htmlFor="dark-mode">
                  Dark Mode
                </label>
                <div className="accessibility-controls">
                  <button 
                    className={darkMode ? 'active' : ''}
                    onClick={() => dispatch(setDarkMode(!darkMode))}
                    aria-pressed={darkMode}
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="accessibility-reset">
                <button 
                  onClick={() => {
                    dispatch(resetSettings());
                    setShowAccessibilityMenu(false);
                  }}
                  className="reset-button"
                  aria-label="Reset all accessibility settings"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          </li>
          
          <li className="nav-item">
            {user ? (
              <div className="user-menu">
                <span className="username">{user.firstName || user.name || user.email}</span>
                <LogoutButton />
              </div>
            ) : (
              <button 
                onClick={handleAuthClick}
                className="nav-link"
                aria-label="Login or Register"
              >
                Login / Register
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default React.memo(Navbar);