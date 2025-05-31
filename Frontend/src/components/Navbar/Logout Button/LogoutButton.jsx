import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../store/slices/authSlice';
import initLogoutButton from './initLogoutButton';
import './style.css';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initialize the logout button animation after component mounts
    initLogoutButton();
  }, []);

  const handleLogout = () => {
    // The actual logout action will be triggered by the animation
    // The dispatch is called by the click event listener in initLogoutButton.js
    setTimeout(() => {
      dispatch(logoutUser()).then(() => {
        // Refresh the page instead of just navigating
        window.location.reload();
      });
    }, 1500); // Delay logout action to allow animation to play
  };

  return (
    <button className="logoutButton" onClick={handleLogout} ref={buttonRef}>
      <span className="button-text">Logout</span>
      
      {/* SVG for the figure animation */}
      <svg className="figure" viewBox="0 0 100 100">
        <circle cx="52" cy="30" r="6" className="head" />
        <line x1="52" y1="36" x2="52" y2="60" className="body" />
        <line x1="52" y1="46" x2="44" y2="54" className="arm1" />
        <line x1="44" y1="54" x2="38" y2="58" className="wrist1" />
        <line x1="52" y1="46" x2="60" y2="54" className="arm2" />
        <line x1="60" y1="54" x2="66" y2="58" className="wrist2" />
        <line x1="52" y1="60" x2="44" y2="72" className="leg1" />
        <line x1="44" y1="72" x2="38" y2="84" className="calf1" />
        <line x1="52" y1="60" x2="60" y2="72" className="leg2" />
        <line x1="60" y1="72" x2="66" y2="84" className="calf2" />
      </svg>
      
      {/* SVG for the door animation */}
      <svg className="door" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
        <circle cx="66" cy="50" r="3.5" className="doorknob" />
      </svg>
      
      {/* SVG for the doorway */}
      <svg className="doorway" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
        <path fill="#1e2235" d="M100 95V5c-1.9 0-3.4 1.5-3.4 3.4v83.2c0 1.9 1.5 3.4 3.4 3.4z" />
      </svg>
      
      {/* SVG for the bang animation */}
      <svg className="bang" viewBox="0 0 100 100">
        <path d="M13 57L5 50l8-7-8-7 8-7-8-7 8-7H0v56h13l-8-7 8-7z" />
      </svg>
    </button>
  );
};

export default LogoutButton;