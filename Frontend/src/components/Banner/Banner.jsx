import React, { useEffect } from 'react';
import './Banner.css';
import bannerImage from '../../assets/banner.png';
import BannerBackground from './BannerBackground';

function Banner() {
  useEffect(() => {
    // Log to help with debugging
    console.log('Banner component mounted');
  }, []);

  return (
    <div className="banner-container">
      <div className="banner-hero" style={{ position: 'relative', overflow: 'visible' }}>
        <BannerBackground />
        <img src={bannerImage} alt="Cyber Health Banner" className="banner-image" />
      </div>
    </div>
  );
}

export default Banner;