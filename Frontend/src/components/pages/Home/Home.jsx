import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ProfileUpdatePopup from '../../shared/ProfileUpdatePopup';
import { showAuthModal } from '../../../store/slices/modalSlice';
import './Home.css';

function Home() {
  const [showProfileUpdatePopup, setShowProfileUpdatePopup] = useState(false);
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Reset popup state if user is null (logged out)
    if (!user) {
      setShowProfileUpdatePopup(false);
      return;
    }
    
    // Check if user is logged in and needs to update profile
    // Check if the popup was previously dismissed
    const isDismissed = localStorage.getItem('profileUpdatePopupDismissed');
    
    if (!isDismissed) {
      // Check if the user's profile is incomplete
      const isProfileIncomplete = !user.phoneNumber || !user.gender || !user.dob || 
        !user.bloodGroup || !user.height || !user.weight || !user.emergencyContact;
      
      // Only show the popup if the profile is incomplete
      if (isProfileIncomplete) {
        setShowProfileUpdatePopup(true);
      } else {
        // If profile is complete, mark as dismissed to prevent future checks
        localStorage.setItem('profileUpdatePopupDismissed', 'true');
      }
    }
  }, [user]);

  // Show auth modal when navigating from News page
  useEffect(() => {
    if (location.state?.showAuth) {
      dispatch(showAuthModal());
      // Clear the state to prevent showing the modal again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, dispatch]);

  const handleClosePopup = () => {
    setShowProfileUpdatePopup(false);
    // Store in localStorage that user has dismissed the popup
    localStorage.setItem('profileUpdatePopupDismissed', 'true');
  };

  return (
    <div className="home-container" id="home-section">
      <h1>Welcome to Cyber Health</h1>
      <p style={{ color: 'white' }} className="home-intro">
        Your trusted resource for cybersecurity wellness and digital safety. 
        Explore our tools and community to keep yourself and your 
        loved ones protected online.
      </p>
      
      <div className="services-section">
        <h2>What We Provide</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Tools</h3>
            <p>Access our comprehensive suite of cybersecurity tools designed to help you assess, monitor, and enhance your digital security posture. From password strength analyzers to privacy checkers, our tools empower you to take control of your online safety.</p>
          </div>
          
          <div className="service-card">
            <h3>News</h3>
            <p>Stay informed with the latest cybersecurity news, threats, and vulnerabilities. Our curated news section keeps you updated on emerging risks, data breaches, and industry developments to help you stay one step ahead of potential threats.</p>
          </div>
          
          <div className="service-card">
            <h3>Tips</h3>
            <p>Discover practical cybersecurity tips and best practices that you can implement immediately. Our expert-crafted advice covers everything from secure browsing habits to protecting your identity online and safeguarding your digital assets.</p>
          </div>
        </div>
      </div>

      {/* Profile Update Popup */}
      <ProfileUpdatePopup
        isOpen={showProfileUpdatePopup}
        onClose={handleClosePopup}
      />
    </div>
  );
}

export default Home;