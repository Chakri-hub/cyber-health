import React, { useEffect, useState } from 'react';
import './BannerBackground.css';

function BannerBackground() {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Add a slight delay before starting the animation
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Separate effect to log animation state changes
  useEffect(() => {
    console.log('Banner animation triggered:', animate);
  }, [animate]);

  return (
    <>
      <div className={`banner-animated-background ${animate ? 'animate' : ''}`}>
        <div className="banner-animation-container">
          <div className="banner-color-orb banner-orb-1"></div>
          <div className="banner-color-orb banner-orb-2"></div>
          <div className="banner-color-orb banner-orb-3"></div>
        </div>
      </div>
      <div className="banner-particles-container">
        {/* Plus symbols - reduced count for better performance */}
        {[...Array(8)].map((_, index) => (
          <div key={`plus-${index}`} className={`banner-particle plus-particle particle-${index + 1}`}></div>
        ))}
        
        {/* Shield symbols - reduced count for better performance */}
        {[...Array(5)].map((_, index) => (
          <div key={`shield-${index}`} className={`banner-particle shield-particle shield-${index + 1}`}></div>
        ))}
      </div>
    </>
  );
}

export default BannerBackground;