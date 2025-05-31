import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './ProfileUpdatePopup.css';

function ProfileUpdatePopup({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // Don't render if not open or user is not logged in
  if (!isOpen || !user) return null;

  const handleUpdateProfile = () => {
    onClose();
    navigate('/dashboard#settings'); // Navigate directly to settings section in dashboard
  };

  return (
    <div className="profile-update-popup-overlay">
      <div className="profile-update-popup">
        <div className="popup-header">
          <h3 className="popup-title">Complete Your Profile</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="popup-content">
          <p style={{ color: 'white' }}>Complete your health profile to get the most from your Cyber Health monitoring. Adding your health information helps us provide personalized health recommendations and monitoring.</p>
        </div>
        <div className="popup-actions">
          <button className="secondary-button" onClick={onClose}>Skip for now</button>
          <button className="primary-button" onClick={handleUpdateProfile}>Update Profile</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePopup; 