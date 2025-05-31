import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceService } from '../../../services/apiService';
import './Dashboard.css';
import CustomLoader from '../../shared/Loading Animation/CustomLoader';

const DeviceInfo = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [deviceInfo, setDeviceInfo] = useState({
    browser: 'Loading...',
    os: 'Loading...',
    device: 'Loading...',
    screenResolution: 'Loading...',
    colorDepth: 'Loading...',
    language: 'Loading...',
    timezone: 'Loading...',
    cookiesEnabled: 'Loading...',
    userAgent: 'Loading...',
    ip: 'Loading...',
    location: 'Loading...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({
    message: '',
    isSuccess: false,
    isVisible: false
  });

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        console.log("Starting device info collection");
        
        // Get browser information
        const browser = detectBrowser();
        console.log("Browser detected:", browser);
        
        // Get OS information
        const os = detectOS();
        console.log("OS detected:", os);
        
        // Get device type
        const device = detectDevice();
        console.log("Device type detected:", device);
        
        // Get screen information
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const colorDepth = `${window.screen.colorDepth}-bit`;
        
        // Get language and timezone
        const language = navigator.language || navigator.userLanguage;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Check if cookies are enabled
        const cookiesEnabled = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
        
        // Get user agent
        const userAgent = navigator.userAgent;
        
        let ip = '';
        let location = '';
        
        try {
          // Fetch IP information
          console.log("Fetching IP address...");
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          if (!ipResponse.ok) {
            throw new Error('Failed to fetch IP address');
          }
          const ipData = await ipResponse.json();
          ip = ipData.ip;
          console.log("IP address obtained:", ip);
          
          // Fetch location information based on IP
          console.log("Fetching location data...");
          const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
          if (!locationResponse.ok) {
            throw new Error('Failed to fetch location data');
          }
          const locationData = await locationResponse.json();
          location = `${locationData.city || 'Unknown'}, ${locationData.region || 'Unknown'}, ${locationData.country_name || 'Unknown'}`;
          console.log("Location obtained:", location);
        } catch (ipError) {
          console.error("Error fetching IP/location:", ipError);
          ip = '127.0.0.1';
          location = 'Unknown Location';
        }
        
        const deviceData = {
          browser,
          os,
          device,
          screenResolution,
          colorDepth,
          language,
          timezone,
          cookiesEnabled,
          userAgent,
          ip,
          location
        };
        
        console.log("Collected device data:", deviceData);
        setDeviceInfo(deviceData);
        
        // If user is logged in, save device info to backend
        if (user && token) {
          console.log("User is logged in, saving device info to backend");
          await saveDeviceInfo(deviceData);
        } else {
          console.warn("User not logged in, skipping device info save");
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching device information:', err);
        setError('Failed to fetch device information. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchDeviceInfo();
  }, [user, token]);
  
  // Save device information to backend
  const saveDeviceInfo = async (deviceData) => {
    try {
      console.log("Saving device info for user:", user?.id);
      console.log("Device data:", deviceData);
      console.log("Using token:", token?.substring(0, 10) + "...");
      
      if (!deviceData) {
        throw new Error("Device data is missing");
      }
      
      // Explicitly include user ID in device info
      const enhancedDeviceData = {
        ...deviceData,
        userId: user?.id
      };
      
      const response = await deviceService.saveDeviceInfo(enhancedDeviceData);
      
      if (response.data.success) {
        console.log("Device information saved successfully:", response.data);
        setSaveStatus({
          message: 'Device information saved for security monitoring',
          isSuccess: true,
          isVisible: true
        });
        
        // Hide message after 5 seconds
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, isVisible: false }));
        }, 5000);
      } else {
        console.error("Failed to save device information:", response.data);
        throw new Error(response.data.error || "Failed to save device information");
      }
    } catch (err) {
      console.error('Error saving device information:', err);
      setSaveStatus({
        message: 'Failed to save device information: ' + (err.message || 'Unknown error'),
        isSuccess: false,
        isVisible: true
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };
  
  // Helper function to detect browser
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else if (userAgent.match(/android/i)) {
      browserName = "Android Browser";
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      browserName = "iOS Browser";
    } else {
      browserName = "Unknown";
    }
    
    return browserName;
  };
  
  // Helper function to detect OS
  const detectOS = () => {
    const userAgent = navigator.userAgent;
    let os;
    
    if (userAgent.match(/windows nt 10.0/i)) {
      os = "Windows 10";
    } else if (userAgent.match(/windows nt 6.3/i)) {
      os = "Windows 8.1";
    } else if (userAgent.match(/windows nt 6.2/i)) {
      os = "Windows 8";
    } else if (userAgent.match(/windows nt 6.1/i)) {
      os = "Windows 7";
    } else if (userAgent.match(/windows nt 6.0/i)) {
      os = "Windows Vista";
    } else if (userAgent.match(/windows nt 5.1/i)) {
      os = "Windows XP";
    } else if (userAgent.match(/windows nt 5.0/i)) {
      os = "Windows 2000";
    } else if (userAgent.match(/mac os x/i)) {
      os = "Mac OS X";
    } else if (userAgent.match(/macintosh|mac os/i)) {
      os = "MacOS";
    } else if (userAgent.match(/android/i)) {
      os = "Android";
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      os = "iOS";
    } else if (userAgent.match(/linux/i)) {
      os = "Linux";
    } else if (userAgent.match(/ubuntu/i)) {
      os = "Ubuntu";
    } else {
      os = "Unknown";
    }
    
    return os;
  };
  
  // Helper function to detect device type
  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return "Tablet";
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return "Mobile";
    }
    return "Desktop";
  };

  if (isLoading) {
    return (
      <div className="device-info-loading">
        <CustomLoader />
        <p>Loading device information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="device-info-error">
        <p>{error}</p>
        <button className="primary-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="device-info-container">
      <h2 style={{ color: 'white' }}>Your Device Information</h2>
      
      {saveStatus.isVisible && (
        <div className={`device-info-alert ${saveStatus.isSuccess ? 'success' : 'error'}`}>
          <p>{saveStatus.message}</p>
        </div>
      )}
      
      <div className="device-info-grid">
        <div className="device-info-card">
          <h3>Device & Browser</h3>
          <div className="info-item">
            <span className="info-label">Device Type</span>
            <span className="info-value">{deviceInfo.device}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Operating System</span>
            <span className="info-value">{deviceInfo.os}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Browser</span>
            <span className="info-value">{deviceInfo.browser}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Language</span>
            <span className="info-value">{deviceInfo.language}</span>
          </div>
        </div>
        
        <div className="device-info-card">
          <h3>Display & Settings</h3>
          <div className="info-item">
            <span className="info-label">Screen Resolution</span>
            <span className="info-value">{deviceInfo.screenResolution}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Color Depth</span>
            <span className="info-value">{deviceInfo.colorDepth}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cookies</span>
            <span className="info-value">{deviceInfo.cookiesEnabled}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Timezone</span>
            <span className="info-value">{deviceInfo.timezone}</span>
          </div>
        </div>
        
        <div className="device-info-card">
          <h3>Network & Location</h3>
          <div className="info-item">
            <span className="info-label">IP Address</span>
            <span className="info-value">{deviceInfo.ip}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location</span>
            <span className="info-value">{deviceInfo.location}</span>
          </div>
        </div>
      </div>
      
      <div className="device-info-note">
        <p style={{ color: 'white' }}><strong>Note:</strong> This information is visible to you and is stored securely on our servers for security monitoring. It's collected to help identify your devices and detect suspicious login attempts.</p>
      </div>
      
      <div className="device-info-user-agent">
        <h4 style={{ color: 'white' }}>User Agent</h4>
        <div className="user-agent-box">
          <code>{deviceInfo.userAgent}</code>
        </div>
      </div>
      
      {!user && (
        <div className="device-info-login-prompt">
          <p><strong>Login required:</strong> Please log in to save your device information for security monitoring.</p>
        </div>
      )}
    </div>
  );
};

export default DeviceInfo;