import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthModal.css';
import '../shared/TextButton.css';
import { authService } from '../../services/authService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
// Import SVG files properly
import maleIcon from '../../assets/gender_icons/male.svg';
import femaleIcon from '../../assets/gender_icons/female.svg';
import otherIcon from '../../assets/gender_icons/other.svg';
import unspecifiedIcon from '../../assets/gender_icons/unspecified.svg';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';

function AuthModal({ isOpen, onClose }) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpVerified, setLoginOtpVerified] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginCaptchaToken, setLoginCaptchaToken] = useState('');
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [loginCaptchaStatus, setLoginCaptchaStatus] = useState('');
  const [registerCaptchaStatus, setRegisterCaptchaStatus] = useState('');
  const authCardRef = useRef(null);
  const formsContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth); // Get current auth state

  const [loginData, setLoginData] = useState({
    email: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: ''
  });

  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [loginOtpResendTimer, setLoginOtpResendTimer] = useState(0);
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const [loginOtpResendLoading, setLoginOtpResendLoading] = useState(false);

  const [accountLockedMessage, setAccountLockedMessage] = useState('');
  const [remainingLockoutTime, setRemainingLockoutTime] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const genderIcons = {
    'M': maleIcon,
    'F': femaleIcon,
    'O': otherIcon,
    '': unspecifiedIcon
  };

  useEffect(() => {
    // Reset form when switching between login and register
    if (isLoginForm) {
      setLoginData({ email: '' });
      setLoginOtpSent(false);
      setLoginOtpVerified(false);
      setLoginOtp('');
      setLoginCaptchaToken('');
      setLoginCaptchaStatus('');
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
      setRegisterCaptchaStatus('');
    }
    setError('');
    setCaptchaError(false);
  }, [isLoginForm]);
  
  // Reset modal state completely when opened, especially after logout
  useEffect(() => {
    if (isOpen) {
      // Check location state for auth tab
      if (location.state?.authTab) {
        setIsLoginForm(location.state.authTab === 'login');
      } else {
        // Default to login form
        setIsLoginForm(true);
      }
      
      // Reset login verification states
      setLoginData({ email: '' });
      setLoginOtpSent(false);
      setLoginOtpVerified(false);
      setLoginOtp('');
      setLoginCaptchaToken('');
      
      // Reset registration states
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
      
      // Reset other states
      setIsSubmitted(false);
      setMessage('');
      setError('');
      setCaptchaError(false);
      setLoading(false);
    }
  }, [isOpen, location.state]);
  

  // Add click outside handler to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (authCardRef.current && !authCardRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  useEffect(() => {
    let timerInterval = null;
    
    // Start timer when OTP is sent for registration
    if (otpSent && otpResendTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpResendTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    // Start timer when OTP is sent for login
    if (loginOtpSent && loginOtpResendTimer > 0) {
      timerInterval = setInterval(() => {
        setLoginOtpResendTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [otpSent, loginOtpSent, otpResendTimer, loginOtpResendTimer]);

  // Effect for lockout countdown
  useEffect(() => {
    let lockoutTimer = null;
    
    if (lockoutCountdown > 0) {
      lockoutTimer = setInterval(() => {
        setLockoutCountdown(prevTime => {
          if (prevTime <= 1) {
            clearInterval(lockoutTimer);
            setAccountLockedMessage('');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (lockoutTimer) clearInterval(lockoutTimer);
    };
  }, [lockoutCountdown]);

  const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    
    // Validate first name and last name to reject numeric and special characters input
    if ((name === 'firstName' || name === 'lastName') && !/^[A-Za-z\s]*$/.test(value)) {
      // Don't update state if there are numbers or special characters in name fields
      return;
    }
    
    // For phone field, only accept numbers
    if (name === 'phone' && !/^\d*$/.test(value)) {
      // Don't update state if non-numeric characters are entered in phone field
      return;
    }
    
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
    // Only accept digits and ensure it's exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginCaptchaChange = (token) => {
    console.log("Login CAPTCHA verified:", token ? "Success" : "Failed");
    setLoginCaptchaToken(token);
    setCaptchaError(false);
    if (token) {
      setLoginCaptchaStatus('CAPTCHA verification successful! ✓');
    } else {
      setLoginCaptchaStatus('');
    }
  };

  const handleRegisterCaptchaChange = (token) => {
    console.log("Register CAPTCHA verified:", token ? "Success" : "Failed");
    setRegisterCaptchaToken(token);
    setCaptchaError(false);
    if (token) {
      setRegisterCaptchaStatus('CAPTCHA verification successful! ✓');
    } else {
      setRegisterCaptchaStatus('');
    }
  };

  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    if (!loginData.email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!validateEmail(loginData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!loginCaptchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call login OTP API
      const response = await authService.requestLoginOTP(loginData.email, null, loginCaptchaToken);
      
      // If successful, move to OTP verification step
      setLoginOtpSent(true);
      // Set timer for 2 minutes (120 seconds)
      setLoginOtpResendTimer(120);
      setLoading(false);
      
      // Show toast notification
      toast.success(
        <div>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>OTP Sent Successfully!</p>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Please check your email. You can resend the OTP after 2 minutes if needed.
          </p>
        </div>,
        { duration: 5000 }  // Show for 5 seconds instead of default 3
      );
      
      // For development, auto-fill OTP if provided in response
      if (response.debug_otp) {
        console.log("DEBUG OTP:", response.debug_otp);
      }
    } catch (error) {
      setLoading(false);
      
      // Check for account locked error (403 status)
      if (error.message && error.message.includes('Account temporarily locked')) {
        // Extract the time from the error message
        const timeMatch = error.message.match(/try again in (\d+) minutes/i);
        const lockoutMinutes = timeMatch ? parseInt(timeMatch[1], 10) : 30;
        
        setAccountLockedMessage(`Account locked due to too many failed attempts.`);
        setLockoutCountdown(lockoutMinutes * 60); // Convert minutes to seconds
        
        // Show a more prominent error for account lockout
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Account Temporarily Locked</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Too many failed attempts. Try again in {lockoutMinutes} minutes.
            </p>
          </div>,
          { duration: 8000 }  // Show for longer
        );
      } 
      // Check for rate limit error (429 status)
      else if (error.message && error.message.includes('Too many')) {
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Rate Limit Exceeded</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {error.message}. Please wait before trying again.
            </p>
          </div>,
          { duration: 5000 }
        );
        setError(error.message);
      } 
      else {
        setError(error.message || "Failed to send OTP. Please try again.");
      }
    }
  };

  const handleLoginOtpVerify = async (e) => {
    e.preventDefault();
    if (!loginOtp) {
      setError("Please enter the OTP");
      return;
    }
    
    if (loginOtp.length !== 6 || !/^\d{6}$/.test(loginOtp)) {
      setError("OTP must be 6 digits");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Verify OTP using our auth service
      const result = await authService.verifyLoginOTP(loginData.email, loginOtp);
      
      if (result.message === 'Login successful') {
        setLoginOtpVerified(true);
        
        // Store the user in Redux
        dispatch(loginSuccess({
          user: result.user,
          token: result.token
        }));
        
        // Show success message
        setIsSubmitted(true);
        setMessage(`Welcome back, ${result.user.firstName || loginData.email}!`);
        
        // Close modal and redirect to dashboard after 2 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setMessage('');
          onClose();
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      // Check for account locked error (403 status)
      if (error.message && error.message.includes('Account temporarily locked')) {
        // Extract the time from the error message
        const timeMatch = error.message.match(/try again in (\d+) minutes/i);
        const lockoutMinutes = timeMatch ? parseInt(timeMatch[1], 10) : 30;
        
        setAccountLockedMessage(`Account locked due to too many failed attempts.`);
        setLockoutCountdown(lockoutMinutes * 60); // Convert minutes to seconds
        
        // Show a more prominent error for account lockout
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Account Temporarily Locked</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Too many failed attempts. Try again in {lockoutMinutes} minutes.
            </p>
          </div>,
          { duration: 8000 }  // Show for longer
        );
      } 
      // Check for rate limit error (429 status)
      else if (error.message && error.message.includes('Too many')) {
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Rate Limit Exceeded</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {error.message}. Please wait before trying again.
            </p>
          </div>,
          { duration: 5000 }
        );
        setError(error.message);
      } 
      else if (error.message && error.message.includes('Invalid OTP')) {
        // For invalid OTP, show warning of attempts remaining if available
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Invalid OTP</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Please check and try again. Multiple failed attempts may lock your account.
            </p>
          </div>,
          { duration: 5000 }
        );
        setError(error.message);
      }
      else {
        setError(error.message || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!registerData.firstName || !registerData.lastName) {
      setError("First name and last name are required");
      return;
    }
    
    if (!registerData.email) {
      setError("Email address is required");
      return;
    }
    
    if (!validateEmail(registerData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!registerData.phone) {
      setError("Phone number is required");
      return;
    }
    
    if (!validatePhoneNumber(registerData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    
    if (!registerCaptchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call registration OTP API
      const response = await authService.requestRegistrationOTP(registerData.email, registerCaptchaToken);
      
      // If successful, move to OTP verification step
      setOtpSent(true);
      // Set timer for 2 minutes (120 seconds)
      setOtpResendTimer(120);
      setLoading(false);
      
      // Show toast notification
      toast.success(
        <div>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>OTP Sent Successfully!</p>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Please check your email. You can resend the OTP after 2 minutes if needed.
          </p>
        </div>,
        { duration: 5000 }  // Show for 5 seconds instead of default 3
      );
      
      // For development, auto-fill OTP if provided in response
      if (response.debug_otp) {
        console.log("DEBUG OTP:", response.debug_otp);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Verify OTP using our auth service
      const result = await authService.verifyOTP(
        registerData.email,
        otp,
        registerData.firstName,
        registerData.lastName,
        registerData.gender,
        registerData.phone
      );
      
      setOtpVerified(true);
      alert("Email verified successfully!");
    } catch (error) {
      setError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (!loginOtpVerified) {
      setError("Please verify your email with OTP");
      return;
    }
    
    // Login is already completed after OTP verification
    
    // Get user data from localStorage that was saved during OTP verification
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    // Use the stored user data from the backend if available
    const userData = storedUser || {
      firstName: 'User',
      lastName: 'Account',
      email: loginData.email,
    };
    
    // Create mock token
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Dispatch login success action to update Redux state
    dispatch(loginSuccess({
      user: userData,
      token: token
    }));
    
    // Show success message
    setIsSubmitted(true);
    setMessage(`Welcome back, ${userData.firstName || loginData.email}!`);
    setError('');
    
    // Close modal and redirect to dashboard settings after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
      navigate('/dashboard#settings');
    }, 2000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      setError("Please verify your email with OTP");
      return;
    }
    
    // Registration is already complete after OTP verification
    
    // Create user data from registration form
    const userData = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      gender: registerData.gender,
      phone: registerData.phone
    };
    
    // Create mock token
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Dispatch login success action to update Redux state
    dispatch(loginSuccess({
      user: userData,
      token: token
    }));
    
    // Show success message
    setIsSubmitted(true);
    setMessage(`Welcome, ${registerData.firstName}! Your account has been created.`);
    setError('');
    
    // Close modal and redirect to dashboard settings after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
      navigate('/dashboard#settings');
    }, 2000);
  };

  const toggleForm = (formType) => {
    // If currently showing the same form that was clicked, do nothing
    if ((formType === 'login' && isLoginForm) || (formType === 'register' && !isLoginForm)) {
      return;
    }

    setAnimating(true);
    
    // Set which form should be active
    setIsLoginForm(formType === 'login');
    
    // After animation completes, update the min-height
    setTimeout(() => {
      setAnimating(false);
      if (formsContainerRef.current) {
        const activeForm = formsContainerRef.current.querySelector('.form-section.active');
        if (activeForm) {
          formsContainerRef.current.style.minHeight = `${activeForm.offsetHeight}px`;
        }
      }
    }, 600); // Animation duration
  };

  const handleResendOtp = async () => {
    setError(null);
    setOtpResendLoading(true);
    
    try {
      // Call the API to resend OTP
      await authService.resendRegistrationOTP(registerData.email);
      // Reset timer
      setOtpResendTimer(120);
      toast.success('New OTP sent successfully');
    } catch (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setOtpResendLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (loginOtpResendTimer > 0) {
      return; // Still in cooldown period
    }
    
    try {
      setLoginOtpResendLoading(true);
      setError('');
      
      // Call resend OTP API
      await authService.resendLoginOTP(loginData.email);
      
      // Reset the timer
      setLoginOtpResendTimer(120);
      
      // Show success message
      toast.success('New OTP sent! Please check your email.', { duration: 4000 });
      
    } catch (error) {
      // Check for account locked error (403 status)
      if (error.message && error.message.includes('Account temporarily locked')) {
        // Extract the time from the error message
        const timeMatch = error.message.match(/try again in (\d+) minutes/i);
        const lockoutMinutes = timeMatch ? parseInt(timeMatch[1], 10) : 30;
        
        setAccountLockedMessage(`Account locked due to too many failed attempts.`);
        setLockoutCountdown(lockoutMinutes * 60); // Convert minutes to seconds
        
        // Show a more prominent error for account lockout
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Account Temporarily Locked</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Too many failed attempts. Try again in {lockoutMinutes} minutes.
            </p>
          </div>,
          { duration: 8000 }  // Show for longer
        );
      } 
      // Check for rate limit error (429 status)
      else if (error.message && error.message.includes('Too many')) {
        toast.error(
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Rate Limit Exceeded</p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {error.message}. Please wait before trying again.
            </p>
          </div>,
          { duration: 5000 }
        );
        setError(error.message);
      } 
      else {
        setError(error.message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoginOtpResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content" ref={authCardRef}>
        <div className="auth-card">
          <button className="close-button" onClick={onClose}>×</button>
          
          {/* Message display for successful submission */}
          {isSubmitted ? (
            <div className="success-message">
              <h2>Success!</h2>
              <p>{message}</p>
              <p>Redirecting to dashboard settings...</p>
            </div>
          ) : (
            <>
              {/* Tab navigation */}
              <div className="auth-tabs">
                <button
                  className={`tab-button ${isLoginForm ? 'active' : ''}`}
                  onClick={() => toggleForm('login')}
                >
                  Login
                </button>
                <button
                  className={`tab-button ${!isLoginForm ? 'active' : ''}`}
                  onClick={() => toggleForm('register')}
                >
                  Register
                </button>
              </div>
              
              {/* Form container */}
              <div 
                className={`auth-forms-container ${animating ? 'animating' : ''}`}
                ref={formsContainerRef}
              >
                {/* Display error message if any */}
                {error && <div className="error-message">{error}</div>}
                
                {/* Account lockout message */}
                {accountLockedMessage && lockoutCountdown > 0 && (
                  <div className="account-locked-message">
                    <p className="error-message">{accountLockedMessage}</p>
                    <p className="lockout-timer">Try again in: {formatRemainingTime(lockoutCountdown)}</p>
                  </div>
                )}
                
                {/* Login Form */}
                <div className={`form-section login-form ${isLoginForm ? 'active' : 'inactive'}`}>
                  {!loginOtpSent ? (
                    // Step 1: Enter login information
                    <form onSubmit={handleSendLoginOtp}>
                      <div className="form-header">
                        <h2>Login to Your Account</h2>
                        <p>Enter your credentials to login</p>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="login-email">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          id="login-email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="Enter your email"
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      <div className="form-group recaptcha-container">
                        <ReCAPTCHA
                          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                          onChange={handleLoginCaptchaChange}
                          onErrored={() => {
                            console.error("reCAPTCHA error occurred");
                            setCaptchaError(true);
                            setLoginCaptchaStatus('CAPTCHA couldn\'t load. Please refresh the page.');
                            setError("Verification service couldn't be loaded. Please try again later.");
                          }}
                          onExpired={() => {
                            setLoginCaptchaToken('');
                            setCaptchaError(true);
                            setLoginCaptchaStatus('CAPTCHA expired. Please verify again.');
                            setError("Security verification expired. Please complete it again.");
                          }}
                          theme="dark"
                          size="normal"
                        />
                        {loginCaptchaStatus && (
                          <div className={`captcha-status ${loginCaptchaToken ? 'success' : 'error'}`}>
                            {loginCaptchaStatus}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </form>
                  ) : !loginOtpVerified ? (
                    // Step 2: Verify OTP
                    <form onSubmit={handleLoginOtpVerify}>
                      <div className="form-header">
                        <h2>Verify Your Email</h2>
                        <p>Enter the OTP sent to {loginData.email}</p>
                      </div>
                      
                      {/* OTP input field */}
                      <div className="form-group">
                        <label htmlFor="login-otp">One-Time Password</label>
                        <input
                          type="text"
                          id="login-otp"
                          value={loginOtp}
                          onChange={handleLoginOtpChange}
                          placeholder="Enter OTP"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      {/* Centered resend OTP link with timer */}
                      <div className="resend-otp-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {loginOtpResendTimer > 0 ? (
                          <p className="resend-timer">Resend OTP in {Math.floor(loginOtpResendTimer / 60)}:{(loginOtpResendTimer % 60).toString().padStart(2, '0')}</p>
                        ) : (
                          <button 
                            type="button" 
                            className="resend-otp-button" 
                            onClick={handleResendLoginOtp}
                            disabled={loginOtpResendLoading}
                          >
                            {loginOtpResendLoading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </form>
                  ) : (
                    // Step 3: Complete login
                    <form onSubmit={handleLoginSubmit}>
                      <div className="form-header">
                        <h2>Complete Login</h2>
                        <p>Your email has been verified</p>
                      </div>
                      
                      <div className="verification-success">
                        <span className="checkmark">✓</span>
                        <p>Email verification successful!</p>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        Login to Dashboard
                      </button>
                    </form>
                  )}
                </div>
                
                {/* Register Form */}
                <div className={`form-section register-form ${!isLoginForm ? 'active' : 'inactive'}`}>
                  {!otpSent ? (
                    // Step 1: Enter registration information
                    <form onSubmit={handleSendOtp}>
                      <div className="form-header">
                        <h2>Create an Account</h2>
                        <p>Fill in your details to register</p>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="register-firstname">First Name</label>
                        <input
                          type="text"
                          id="register-firstname"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          placeholder="Enter your first name"
                          pattern="^[A-Za-z\s]+$"
                          title="Only letters and spaces are allowed"
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="register-lastname">Last Name</label>
                        <input
                          type="text"
                          id="register-lastname"
                          name="lastName"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          placeholder="Enter your last name"
                          pattern="^[A-Za-z\s]+$"
                          title="Only letters and spaces are allowed"
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="register-gender">Gender</label>
                        <div className="gender-selection">
                          {Object.entries(genderIcons).map(([value, icon]) => (
                            <div key={value} className="gender-option">
                              <input
                                type="radio"
                                id={`gender-${value}`}
                                name="gender"
                                value={value}
                                checked={registerData.gender === value}
                                onChange={handleRegisterChange}
                              />
                              <label htmlFor={`gender-${value}`} className="gender-label">
                                <img src={icon} alt={value} className="gender-icon" />
                                <span>{value.toUpperCase()}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="register-email">Email Address</label>
                        <input
                          type="email"
                          id="register-email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="Enter your email"
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      <div className="form-group recaptcha-container">
                        <ReCAPTCHA
                          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
                          onChange={handleRegisterCaptchaChange}
                          onErrored={() => {
                            console.error("reCAPTCHA error occurred");
                            setCaptchaError(true);
                            setRegisterCaptchaStatus('CAPTCHA couldn\'t load. Please refresh the page.');
                            setError("Verification service couldn't be loaded. Please try again later.");
                          }}
                          onExpired={() => {
                            setRegisterCaptchaToken('');
                            setCaptchaError(true);
                            setRegisterCaptchaStatus('CAPTCHA expired. Please verify again.');
                            setError("Security verification expired. Please complete it again.");
                          }}
                          theme="dark"
                          size="normal"
                        />
                        {registerCaptchaStatus && (
                          <div className={`captcha-status ${registerCaptchaToken ? 'success' : 'error'}`}>
                            {registerCaptchaStatus}
                          </div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="register-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="register-phone"
                          name="phone"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          placeholder="Enter 10-digit phone number"
                          pattern="[0-9]+"
                          title="Only numbers are allowed"
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </form>
                  ) : !otpVerified ? (
                    // Step 2: Verify OTP
                    <form onSubmit={handleVerifyOtp}>
                      <div className="form-header">
                        <h2>Verify Your Email</h2>
                        <p>Enter the OTP sent to {registerData.email}</p>
                      </div>
                      
                      {/* OTP input field */}
                      <div className="form-group">
                        <label htmlFor="register-otp">One-Time Password</label>
                        <input
                          type="text"
                          id="register-otp"
                          value={otp}
                          onChange={handleOtpChange}
                          placeholder="Enter OTP"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          style={{ color: 'white' }}
                        />
                      </div>
                      
                      {/* Centered resend OTP link with timer */}
                      <div className="resend-otp-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {otpResendTimer > 0 ? (
                          <p className="resend-timer">Resend OTP in {Math.floor(otpResendTimer / 60)}:{(otpResendTimer % 60).toString().padStart(2, '0')}</p>
                        ) : (
                          <button 
                            type="button" 
                            className="resend-otp-button" 
                            onClick={handleResendOtp}
                            disabled={otpResendLoading}
                          >
                            {otpResendLoading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </form>
                  ) : (
                    // Step 3: Complete registration
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-header">
                        <h2>Complete Registration</h2>
                        <p>Your email has been verified</p>
                      </div>
                      
                      <div className="verification-success">
                        <span className="checkmark">✓</span>
                        <p>Email verification successful!</p>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-button"
                        style={{ margin: '0 auto', display: 'block', width: '100%' }}
                      >
                        Complete Registration
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;