import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import '../shared/TextButton.css';
import AnimatedBackground from './AnimatedBackground';
import ReCAPTCHA from 'react-google-recaptcha';
import { authService } from '../../services/authService';

// Import gender icons
import maleIcon from '../../assets/gender_icons/male.svg';
import femaleIcon from '../../assets/gender_icons/female.svg';
import otherIcon from '../../assets/gender_icons/other.svg';
import unspecifiedIcon from '../../assets/gender_icons/unspecified.svg';

function Auth() {
  const location = useLocation();
  const [isLoginForm, setIsLoginForm] = useState(location.hash !== '#register');
  const [animating, setAnimating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpVerified, setLoginOtpVerified] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState('');
  const [loginCaptchaToken, setLoginCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const authCardRef = useRef(null);
  const formsContainerRef = useRef(null);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    phone: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Reset form when switching between login and register
    if (isLoginForm) {
      setLoginData({ email: '', phone: '' });
      setLoginOtpSent(false);
      setLoginOtpVerified(false);
      setLoginOtp('');
      setLoginCaptchaToken('');
    } else {
      setRegisterData({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        phone: ''
      });
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setRegisterCaptchaToken('');
    }
    
    // Reset error state
    setCaptchaError(false);
    setErrorMessage('');
  }, [isLoginForm]);

  // Add click outside handler to navigate to homepage
  useEffect(() => {
    function handleClickOutside(event) {
      if (authCardRef.current && !authCardRef.current.contains(event.target)) {
        navigate('/');
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate]);

  // Update form based on URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#register') {
        setIsLoginForm(false);
      } else {
        // Default to login for any other hash or no hash
        setIsLoginForm(true);
      }
    };

    // Set initial form based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Set initial height of forms container
  useEffect(() => {
    if (formsContainerRef.current) {
      setTimeout(() => {
        const activeForm = formsContainerRef.current.querySelector('.form-section.active');
        if (activeForm) {
          formsContainerRef.current.style.minHeight = `${activeForm.offsetHeight}px`;
        }
      }, 100);
    }
  }, [isLoginForm]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  const handleOtpChange = (e) => {
    // Only allow numbers (0-9) in OTP field
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleLoginOtpChange = (e) => {
    // Only allow numbers (0-9) in OTP field
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setLoginOtp(value);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSendLoginOtp = (e) => {
    e.preventDefault();
    if (!loginData.email) {
      alert("Please enter your email address");
      return;
    }
    
    if (!loginData.phone) {
      alert("Please enter your phone number");
      return;
    }
    
    if (!validatePhoneNumber(loginData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    if (!loginCaptchaToken) {
      alert("Please complete the CAPTCHA verification");
      return;
    }
    
    // Call the auth service to request OTP
    authService.requestLoginOTP(loginData.email, loginData.phone, loginCaptchaToken)
      .then(() => {
        setLoginOtpSent(true);
        alert(`OTP sent to ${loginData.email}. For demo purposes, use "123456"`);
      })
      .catch(error => {
        alert(`Failed to send OTP: ${error.message}`);
      });
  };

  const handleVerifyLoginOtp = (e) => {
    e.preventDefault();
    if (!loginOtp) {
      alert("Please enter the OTP");
      return;
    }
    
    if (loginOtp.length !== 6 || !/^\d{6}$/.test(loginOtp)) {
      alert("OTP must be 6 digits");
      return;
    }
    
    // Call the auth service to verify OTP
    authService.verifyLoginOTP(loginData.email, loginOtp)
      .then(() => {
        setLoginOtpVerified(true);
        alert("Email verified successfully! You can now login.");
      })
      .catch(error => {
        alert(`Failed to verify OTP: ${error.message}`);
      });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!registerData.email) {
      alert("Please enter your email address");
      return;
    }
    
    if (!registerCaptchaToken) {
      alert("Please complete the CAPTCHA verification");
      return;
    }
    
    // Call the auth service to request OTP
    authService.requestRegistrationOTP(registerData.email, registerCaptchaToken)
      .then(() => {
        setOtpSent(true);
        alert(`OTP sent to ${registerData.email}. For demo purposes, use "123456"`);
      })
      .catch(error => {
        alert(`Failed to send OTP: ${error.message}`);
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      alert("OTP must be 6 digits");
      return;
    }
    
    // Call the auth service to verify OTP
    authService.verifyOTP(registerData.email, otp, registerData.firstName, registerData.lastName, registerData.gender, registerData.phone)
      .then(() => {
        setOtpVerified(true);
        alert("Email verified successfully!");
      })
      .catch(error => {
        alert(`Failed to verify OTP: ${error.message}`);
      });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (!loginData.email) {
      alert("Please enter your email address");
      return;
    }
    
    if (!loginData.phone) {
      alert("Please enter your phone number");
      return;
    }
    
    if (!validatePhoneNumber(loginData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    if (!loginOtpVerified) {
      alert("Please verify your email with OTP");
      return;
    }
    
    // Reset any CAPTCHA errors
    setCaptchaError(false);
    setErrorMessage('');
    
    // Here you would typically handle the login logic
    // Removed console.log for security
    
    // Show success message instead of navigating
    setIsSubmitted(true);
    setMessage(`Welcome back, ${loginData.email}!`);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
    }, 3000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!registerData.firstName || !registerData.lastName) {
      alert("First name and last name are required");
      return;
    }
    
    if (!otpVerified) {
      alert("Please verify your email with OTP");
      return;
    }
    
    if (!validatePhoneNumber(registerData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    // Reset any CAPTCHA errors on successful submission
    setCaptchaError(false);
    setErrorMessage('');
    
    // Here you would typically handle the registration logic
    // Removed console.log for security
    
    // Show success message instead of navigating
    setIsSubmitted(true);
    setMessage(`Account created for ${registerData.firstName} ${registerData.lastName}!`);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      // Switch to login form after registration
      setAnimating(true);
      setTimeout(() => {
        setIsLoginForm(true);
        setAnimating(false);
      }, 500); // Match the animation duration in CSS
    }, 3000);
  };

  const toggleForm = (formType) => {
    if (animating) return; // Prevent multiple clicks during animation
    
    if ((formType === 'login' && isLoginForm) || (formType === 'register' && !isLoginForm)) {
      return; // Don't toggle if already on the requested form
    }
    
    // Reset CAPTCHA error state
    setCaptchaError(false);
    setErrorMessage('');
    
    setAnimating(true);
    
    // Calculate and set the height of the forms container before animation
    if (formsContainerRef.current) {
      const activeForm = formsContainerRef.current.querySelector('.form-section.active');
      if (activeForm) {
        formsContainerRef.current.style.minHeight = `${activeForm.offsetHeight}px`;
      }
    }
    
    setTimeout(() => {
      setIsLoginForm(formType === 'login');
      
      // Update URL hash without page reload
      window.history.replaceState(null, null, `#${formType}`);
      
      // Reset animation state after form change
      setTimeout(() => {
        setAnimating(false);
        
        // Update height after animation completes
        if (formsContainerRef.current) {
          const newActiveForm = formsContainerRef.current.querySelector('.form-section.active');
          if (newActiveForm) {
            formsContainerRef.current.style.minHeight = `${newActiveForm.offsetHeight}px`;
          }
        }
      }, 500); // Match the animation duration in CSS
    }, 50); // Small delay to ensure height is set before animation
  };

  const handleRegisterCaptchaChange = (token) => {
    console.log("Register CAPTCHA verified:", token ? "Success" : "Failed");
    setRegisterCaptchaToken(token);
  };

  const handleLoginCaptchaChange = (token) => {
    console.log("Login CAPTCHA verified:", token ? "Success" : "Failed");
    setLoginCaptchaToken(token);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="auth-container">
        <div className="auth-card" ref={authCardRef}>
          {isSubmitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>{message}</h2>
            </div>
          ) : (
            <>
              <div className="auth-toggle">
                <a 
                  href="#login"
                  className={`toggle-btn ${isLoginForm ? 'active' : ''}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleForm('login');
                  }}
                  aria-disabled={animating}
                >
                  Login
                </a>
                <a 
                  href="#register"
                  className={`toggle-btn ${!isLoginForm ? 'active' : ''}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleForm('register');
                  }}
                  aria-disabled={animating}
                >
                  Register
                </a>
              </div>
              
              <div className={`forms-container ${animating ? 'animating' : ''}`} ref={formsContainerRef}>
                <div className={`form-section ${isLoginForm ? 'active' : 'inactive'}`}>
                  <h2>Welcome Back</h2>
                  <form className="auth-form" onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label htmlFor="login-email">Email Address*</label>
                      <input
                        type="email"
                        id="login-email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter your email"
                        disabled={loginOtpSent}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="login-phone">Phone Number*</label>
                      <input
                        type="tel"
                        id="login-phone"
                        name="phone"
                        value={loginData.phone}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter 10-digit phone number"
                        disabled={loginOtpSent}
                      />
                    </div>
                    
                    {!loginOtpSent && (
                      <>
                        <div className="form-group recaptcha-container">
                          <ReCAPTCHA
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                            onChange={handleLoginCaptchaChange}
                            onErrored={() => {
                              console.error("reCAPTCHA error occurred");
                              setCaptchaError(true);
                              setErrorMessage("CAPTCHA couldn't load. Please refresh the page.");
                            }}
                            onExpired={() => {
                              setLoginCaptchaToken('');
                              setCaptchaError(true);
                              setErrorMessage("CAPTCHA expired. Please verify again.");
                            }}
                            theme="dark"
                            size="normal"
                          />
                        </div>
                        {captchaError && (
                          <div className="captcha-error-message">
                            {errorMessage}
                          </div>
                        )}
                        <button 
                          type="button" 
                          className="auth-button otp-request-button"
                          onClick={handleSendLoginOtp}
                        >
                          Send OTP to Email
                        </button>
                      </>
                    )}
                    
                    {loginOtpSent && !loginOtpVerified && (
                      <div className="form-group">
                        <label htmlFor="login-otp">Enter OTP*</label>
                        <div className="input-with-button">
                          <input
                            type="text"
                            id="login-otp"
                            value={loginOtp}
                            onChange={handleLoginOtpChange}
                            required
                            placeholder="Enter OTP sent to your email"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={6}
                          />
                          <button 
                            type="button" 
                            className="otp-button"
                            onClick={handleVerifyLoginOtp}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {loginOtpVerified && (
                      <div className="verification-badge">
                        <span className="verified-icon">✓</span> Email verified
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="auth-button"
                      disabled={!loginOtpVerified}
                    >
                      Login
                    </button>
                  </form>
                  <p className="form-switch-text">
                    Don't have an account? 
                    <a 
                      href="#register" 
                      className="text-button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleForm('register');
                      }}
                      aria-disabled={animating}
                    >
                      Register here
                    </a>
                  </p>
                </div>
                
                <div className={`form-section ${!isLoginForm ? 'active' : 'inactive'}`}>
                  <h2>Create Account</h2>
                  <form className="auth-form" onSubmit={handleRegisterSubmit}>
                    <div className="name-row">
                      <div className="form-group">
                        <label htmlFor="register-first-name">First Name*</label>
                        <input
                          type="text"
                          id="register-first-name"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          required
                          placeholder="First name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="register-last-name">Last Name*</label>
                        <input
                          type="text"
                          id="register-last-name"
                          name="lastName"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          required
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="register-gender">Gender</label>
                      <select
                        id="register-gender"
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                        className="form-select"
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="register-email">Email*</label>
                      <div className="input-with-button">
                        <input
                          type="email"
                          id="register-email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          placeholder="Enter your email"
                          disabled={otpSent}
                        />
                        {!otpSent && (
                          <>
                            <button 
                              type="button" 
                              className="otp-button"
                              onClick={handleSendOtp}
                            >
                              Send OTP
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!otpSent && (
                      <div className="form-group recaptcha-container">
                        <ReCAPTCHA
                          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                          onChange={handleRegisterCaptchaChange}
                          onErrored={() => {
                            console.error("reCAPTCHA error occurred");
                            setCaptchaError(true);
                            setErrorMessage("CAPTCHA couldn't load. Please refresh the page.");
                          }}
                          onExpired={() => {
                            setRegisterCaptchaToken('');
                            setCaptchaError(true);
                            setErrorMessage("CAPTCHA expired. Please verify again.");
                          }}
                          theme="dark"
                          size="normal"
                        />
                      </div>
                    )}
                    {captchaError && (
                      <div className="captcha-error-message">
                        {errorMessage}
                      </div>
                    )}
                    
                    {otpSent && !otpVerified && (
                      <div className="form-group">
                        <label htmlFor="register-otp">Enter OTP*</label>
                        <div className="input-with-button">
                          <input
                            type="text"
                            id="register-otp"
                            value={otp}
                            onChange={handleOtpChange}
                            required
                            placeholder="Enter OTP sent to your email"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={6}
                          />
                          <button 
                            type="button" 
                            className="otp-button"
                            onClick={handleVerifyOtp}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {otpVerified && (
                      <div className="verification-badge">
                        <span className="verified-icon">✓</span> Email verified
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="register-phone">Phone Number*</label>
                      <input
                        type="tel"
                        id="register-phone"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter 10-digit phone number"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="auth-button"
                      disabled={!otpVerified}
                    >
                      Register
                    </button>
                  </form>
                  <p className="form-switch-text">
                    Already have an account? 
                    <a 
                      href="#login" 
                      className="text-button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleForm('login');
                      }}
                      aria-disabled={animating}
                    >
                      Login here
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Auth;