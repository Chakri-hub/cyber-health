import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../hooks/useDebounce';
import './SubNav.css';

function SubNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Create debounced scroll handler
  const handleScroll = useCallback(() => {
    if (window.scrollY > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  }, []);

  const debouncedHandleScroll = useDebounce(handleScroll, 100);

  // Add scroll event listener to detect when to add shadow
  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  // Check if a nav link is active
  const isActive = (path) => location.pathname === path;

  // Base navigation items
  const baseNavItems = [
    { path: '/', label: 'Home', id: 'home-section' },
    { path: '/tools', label: 'Tools', id: 'tools-section' },
    { path: '/news', label: 'News', id: 'news-section' },
    { path: '/tips', label: 'Tips', id: 'tips-section' },
    { path: '/contact', label: 'Contact', id: 'contact-section' }
  ];
  
  // Add Dashboard link if user is logged in
  const navItems = user 
    ? [...baseNavItems, { path: '/dashboard', label: 'Dashboard', id: 'dashboard' }]
    : baseNavItems;
    
  // Handle smooth scrolling when clicking on navigation links
  const handleNavClick = (e, path, id) => {
    e.preventDefault();
    
    // If we're already on the correct page, scroll to the section
    if (location.pathname === path) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to the page first, then scroll to the section after page load
      navigate(path);
      // Use setTimeout to ensure the navigation completes before attempting to scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Delay to allow page to load
    }
  };

  return (
    <nav 
      className={`subnav ${scrolled ? 'scrolled' : ''}`}
      role="navigation" 
      aria-label="secondary navigation"
    >
      <div className="subnav-container">
        <ul className="subnav-menu">
          {navItems.map(({ path, label, id }) => (
            <li key={path} className="subnav-item">
              <a
                href={path}
                className={`subnav-link ${isActive(path) ? 'active' : ''}`}
                aria-current={isActive(path) ? 'page' : undefined}
                onClick={(e) => handleNavClick(e, path, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default React.memo(SubNav);