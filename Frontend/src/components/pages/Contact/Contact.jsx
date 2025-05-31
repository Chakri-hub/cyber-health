import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faInbox, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faChevronDown, 
  faChevronRight, 
  faLock,
  faSearch,
  faCircle,
  faEye,
  faEyeSlash,
  faUser,
  faUserTie,
  faReply,
  faSync,
  faSignOutAlt,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './Contact.css';
import axios from 'axios';
import contactService from '../../../services/contactService';

// API base URL
const API_URL = 'http://127.0.0.1:8000/api';

function Contact() {
  const { token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('send');
  const [isHovering, setIsHovering] = useState(false); // Start with the sidebar collapsed
  const [mapKey, setMapKey] = useState(Date.now()); // Add a key to force re-render of iframe
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Admin-related state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeReadFilter, setActiveReadFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({
    total_messages: 0,
    read_messages: 0,
    unread_messages: 0,
    registered_user_messages: 0,
    non_registered_user_messages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyConfirmation, setShowReplyConfirmation] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Only used for authenticated users
    message: ''
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  // Check if user is authenticated and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear any previous errors
        setApiError(null);
        
        const userString = localStorage.getItem('user');
        if (!userString) {
          return; // Not authenticated
        }
        
        setIsAuthenticated(true);
        setIsLoading(true);
        
        const userData = JSON.parse(userString);
        console.log("User data from localStorage:", userData);
        
        // Check for admin status
        if (userData.email === 'pchakradhar91@gmail.com' || userData.is_superuser === true) {
          setIsAdmin(true);
          setIsSuperAdmin(true);
          // Set active tab to 'receive' for admins
          setActiveTab('receive');
        } else if (userData.role === 'admin' || userData.is_staff === true) {
          setIsAdmin(true);
          setIsSuperAdmin(false);
          // Set active tab to 'receive' for admins
          setActiveTab('receive');
        }
        
        // Set form data directly from localStorage if available
        // Note the property names: firstName, lastName, phoneNumber (not first_name, last_name, phone_number)
        if (userData) {
          const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          setFormData({
            name: fullName || '',
            email: userData.email || '',
            phone: userData.phoneNumber || userData.phone_number || '',
            message: ''
          });
          setIsLoading(false);
          return;
        }
        
        // If complete user data is not in localStorage, try to fetch from API
        const userId = userData.id || userData.user_id;
        const token = userData.token || localStorage.getItem('token');
        
        if (!userId) {
          console.error('User ID not found in stored user data');
          setIsLoading(false);
          setApiError("Could not find user ID. Please login again.");
          return;
        }
        
        // Configure headers with token
        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        console.log(`Attempting to fetch user data for ID: ${userId}`);
        
        // Try different API endpoints (could be different depending on backend)
        try {
          // First try the more specific endpoint
          const response = await axios.get(
            `${API_URL}/users/user-details/${userId}/`, 
            config
          );
          
          console.log('User data fetched from specific endpoint:', response.data);
          
          if (response.data) {
            setUserData(response.data);
            
            // Pre-fill the form with user data
            const userInfo = response.data.personal_info || response.data;
            // Check for both variants of field names (camelCase and snake_case)
            const firstName = userInfo.firstName || userInfo.first_name || '';
            const lastName = userInfo.lastName || userInfo.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            setFormData({
              name: fullName,
              email: userInfo.email || '',
              phone: userInfo.phoneNumber || userInfo.phone_number || '',
              message: ''
            });
          }
        } catch (specificError) {
          console.log('First endpoint failed, trying alternative endpoint...');
          
          // If specific endpoint fails, try a more general one
          try {
            const response = await axios.get(
              `${API_URL}/users/profile/${userId}/`, 
              config
            );
            
            console.log('User data fetched from alternative endpoint:', response.data);
            
            if (response.data) {
              setUserData(response.data);
              
              const userInfo = response.data;
              // Check for both variants of field names (camelCase and snake_case)
              const firstName = userInfo.firstName || userInfo.first_name || '';
              const lastName = userInfo.lastName || userInfo.last_name || '';
              const fullName = `${firstName} ${lastName}`.trim();
              
              setFormData({
                name: fullName,
                email: userInfo.email || '',
                phone: userInfo.phoneNumber || userInfo.phone_number || '',
                message: ''
              });
            }
          } catch (generalError) {
            // If both fail, fallback to just using what we have in localStorage
            console.log('Both endpoints failed, using localStorage data only');
            
            // Pre-fill with whatever we have from localStorage
            if (userData) {
              const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
              setFormData({
                name: fullName || userData.username || '',
                email: userData.email || '',
                phone: userData.phoneNumber || '',
                message: ''
              });
            }
            
            setApiError("Could not fetch your complete profile. Some fields may be missing.");
          }
        }
      } catch (error) {
        console.error('Error in auth/user data processing:', error);
        setApiError("Error loading user information. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Scroll to top and reset error states when tab changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Clear any API errors and form errors when switching tabs
    setApiError(null);
    setFormErrors({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  }, [activeTab]);
  
  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('contactActiveTab', activeTab);
  }, [activeTab]);
  
  // Restore active tab from localStorage on initial load
  useEffect(() => {
    const savedTab = localStorage.getItem('contactActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);
  
  // Force map to reload properly after page load
  useEffect(() => {
    // On page load, reset the map after a short delay
    const timer = setTimeout(() => {
      setMapKey(Date.now());
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch messages when admin views the receive tab
  useEffect(() => {
    const fetchMessages = async () => {
      if (!isAdmin || activeTab !== 'receive') return;
      
      try {
        setIsLoadingMessages(true);
        setApiError(null); // Clear any previous errors
        
        // Get token information
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // If token is missing, show clear error
        if (!token) {
          setApiError('Authentication token missing. Please log out and log in again.');
          setIsLoadingMessages(false);
          return;
        }
        
        // Verify that user has admin privileges
        if (!(user.is_staff || user.is_superuser || user.role === 'admin' || user.role === 'super-admin')) {
          setApiError('Your user account does not have admin privileges.');
          setIsLoadingMessages(false);
          return;
        }
        
        // Check token format and validity
        try {
          // Basic validation - check if it's somewhat well-formed
          if (token.length < 10) {
            console.warn('Token seems too short:', token.length);
            setApiError('Authentication token is invalid (too short). Please log out and log in again.');
            setIsLoadingMessages(false);
            return;
          }
          
          // Save current token for reference
          console.log('Current auth token:', token);
          
          // Try to obtain a fresh token for admin API access
          try {
            // Make a check call to the Django admin API 
            // (this is just a test to see if the server is responding to any endpoint)
            await axios.get('http://127.0.0.1:8000/api', {
              headers: { 'Authorization': `Bearer ${token}` },
              withCredentials: true
            });
            console.log('Server responded to test call');
          } catch (pingError) {
            console.warn('Server ping test error:', pingError.message);
          }
        } catch (tokenError) {
          console.error('Token validation error:', tokenError);
        }
        
        console.log('Proceeding with API calls using token:', token.substring(0, 10) + '...');
        
        // Prepare filters based on current state
        const filters = {};
        if (activeReadFilter === 'read') filters.read = true;
        if (activeReadFilter === 'unread') filters.read = false;
        if (activeFilter === 'registered') filters.userType = 'registered';
        if (activeFilter === 'non_registered') filters.userType = 'non_registered';
        if (searchQuery) filters.search = searchQuery;
        
        // Fetch messages and stats
        let messagesResponse = [], statsResponse = {};
        
        try {
          messagesResponse = await contactService.getAllMessages(filters);
          console.log('Messages fetched successfully:', messagesResponse);
        } catch (msgError) {
          console.error('Error fetching messages:', msgError);
          if (msgError.response && msgError.response.status === 403) {
            setApiError('Access denied. Server rejected your authentication token. Please log out and log in again.');
          }
        }
        
        try {
          statsResponse = await contactService.getMessageStats();
          console.log('Message stats fetched successfully:', statsResponse);
        } catch (statsError) {
          console.error('Error fetching message stats:', statsError);
        }
        
        if (messagesResponse && Array.isArray(messagesResponse.results || messagesResponse)) {
          setMessages(messagesResponse.results || messagesResponse);
        }
        
        if (statsResponse && typeof statsResponse === 'object') {
          setMessageStats(statsResponse);
        }
        
        if (!messagesResponse && !statsResponse) {
          setApiError('Authentication failed. Cannot access message data. Please log out and log in again.');
        }
      } catch (error) {
        console.error('Error in message fetching:', error);
        let errorMessage = 'Could not load messages. Please log out and log in again.';
        
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'Access denied. You need administrator permissions to view messages.';
          } else if (error.response.status === 401) {
            errorMessage = 'Authentication error. Your login session may have expired.';
          } else if (error.response.data && error.response.data.detail) {
            errorMessage = `Server error: ${error.response.data.detail}`;
          }
        }
        
        setApiError(errorMessage);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [isAdmin, activeTab, activeFilter, activeReadFilter, searchQuery]);
  
  // Fetch messages when a regular user views the receive tab
  useEffect(() => {
    const fetchUserMessages = async () => {
      if (isAdmin || activeTab !== 'receive' || !isAuthenticated) return;
      
      try {
        setIsLoadingMessages(true);
        setApiError(null); // Clear any previous errors
        
        // Get token information
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // If token is missing, show clear error
        if (!token) {
          setApiError('Authentication token missing. Please log out and log in again.');
          setIsLoadingMessages(false);
          return;
        }
        
        // Prepare filters based on current state
        const filters = {};
        if (activeReadFilter === 'read') filters.read = true;
        if (activeReadFilter === 'unread') filters.read = false;
        if (searchQuery) filters.search = searchQuery;
        
        // Fetch user messages
        const messagesResponse = await contactService.getUserMessages(filters);
        console.log('User messages fetched successfully:', messagesResponse);
        
        // Check for error in response
        if (messagesResponse.error) {
          console.error('Error in messages response:', messagesResponse.error);
          if (messagesResponse.error === 'Permission denied') {
            setApiError('You do not have permission to view messages. This feature may be disabled for regular users.');
          } else {
            setApiError(`Could not load your messages: ${messagesResponse.error}`);
          }
        } else if (messagesResponse && Array.isArray(messagesResponse.results || messagesResponse)) {
          setMessages(messagesResponse.results || messagesResponse);
        }
        
        // Get message stats for the user
        const statsResponse = await contactService.getUserMessageStats();
        console.log('User message stats fetched successfully:', statsResponse);
        
        // Check for error in stats response
        if (statsResponse.error) {
          console.error('Error in stats response:', statsResponse.error);
          // We already showed an error for messages, no need to show another one
        } else if (statsResponse && typeof statsResponse === 'object') {
          setMessageStats(statsResponse);
        }
      } catch (error) {
        console.error('Error in user message fetching:', error);
        setApiError('Error loading messages. Please refresh the page and try again.');
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchUserMessages();
  }, [isAuthenticated, isAdmin, activeTab, activeReadFilter, searchQuery]);

  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle message selection
  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's unread
    if (!message.is_read) {
      try {
        await contactService.markAsRead(message.id);
        // Update message in the list
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, is_read: true } : m
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };
  
  // Handle reply to message
  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!selectedMessage || !replyMessage) return;
    
    try {
      setIsLoading(true);
      
      // Send the reply using contactService
      await contactService.sendReply(selectedMessage.id, replyMessage);
      
      console.log('Reply sent successfully to message:', selectedMessage.id);
      
      // Show confirmation message
      setShowReplyConfirmation(true);
      
      // Reset the reply field
      setReplyMessage('');
      
      // Refresh messages to show the updated state
      const filters = {};
      if (activeReadFilter === 'read') filters.read = true;
      if (activeReadFilter === 'unread') filters.read = false;
      if (activeFilter === 'registered') filters.userType = 'registered';
      if (activeFilter === 'non_registered') filters.userType = 'non_registered';
      if (searchQuery) filters.search = searchQuery;
      
      const messagesResponse = await contactService.getAllMessages(filters);
      if (messagesResponse && Array.isArray(messagesResponse.results || messagesResponse)) {
        setMessages(messagesResponse.results || messagesResponse);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setApiError('Failed to send reply. Please try again.');
    } finally {
      setIsLoading(false);
      
      // Hide confirmation message after 3 seconds
      setTimeout(() => {
        setShowReplyConfirmation(false);
      }, 3000);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Skip validation for read-only fields in authenticated mode
    if (isAuthenticated && (name === 'name' || name === 'email' || name === 'phone')) {
      return;
    }
    
    let filteredValue = value;
    let error = '';
    
    // Filter input based on field type
    switch (name) {
      case 'name':
        // Only allow letters and spaces - remove other characters immediately
        filteredValue = value.replace(/[^A-Za-z\s]/g, '');
        break;
      case 'email':
        // Email validation after allowing input
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (value && !emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        // Only allow digits and spaces - remove other characters immediately
        filteredValue = value.replace(/[^0-9\s]/g, '');
        break;
      case 'message':
        // Only allow letters, spaces, and basic punctuation - remove other characters immediately
        filteredValue = value.replace(/[^A-Za-z\s.,!?]/g, '');
        break;
      default:
        break;
    }
    
    // Update form data with filtered value
    setFormData({
      ...formData,
      [name]: filteredValue
    });
    
    // Set error message if needed (primarily for email validation)
    setFormErrors({
      ...formErrors,
      [name]: error
    });
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== '');
    
    // For authenticated users, we only validate the message field
    let allFieldsFilled = false;
    if (isAuthenticated) {
      allFieldsFilled = formData.message !== '';
    } else {
      // Check if all required fields are filled (except phone for unauthenticated)
      const requiredFields = {
        name: formData.name,
        email: formData.email,
        message: formData.message
      };
      
      allFieldsFilled = Object.values(requiredFields).every(value => value !== '');
    }
    
    if (!hasErrors && allFieldsFilled) {
      try {
        setIsLoading(true);
        
        // Create full phone number with country code
        let fullPhone = '';
        if (isAuthenticated) {
          fullPhone = formData.phone;
        }
      
        // Prepare data to send
        const dataToSend = {
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          message: formData.message
        };
        
        // Send message using contactService
        const response = await contactService.sendMessage(dataToSend);
        console.log("Message sent successfully:", response);
        
        // Show success message
        setApiError(null);
        
        // Reset form
      if (isAuthenticated) {
        setFormData({
          ...formData,
          message: ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        }
        
        // Show a success message
        alert(isAuthenticated ? 
          "Your message has been sent successfully." : 
          "Your message has been sent successfully. You will receive a response via email soon.");
        
      } catch (error) {
        console.error("Error sending message:", error);
        setApiError("Failed to send your message. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Form has errors or missing fields");
    }
  };

  // Contact details component - extracted to be reused in both tabs
  const ContactDetails = () => (
    <div className="contact-details">
      <h2>Our contacts</h2>
      <div className="contact-info-item">
        <FontAwesomeIcon icon={faMapMarkerAlt} />
        <p>Roland Institute of Technology, NH-16, Golanthara, Berhampur, Odisha 761008</p>
      </div>
      <div className="contact-info-item">
        <FontAwesomeIcon icon={faPhone} />
        <p>7735111222</p>
      </div>
      <div className="contact-info-item">
        <FontAwesomeIcon icon={faEnvelope} />
        <p>contact@roland.ac.in</p>
      </div>
    </div>
  );
  
  // Map component - memoized to ensure consistent rendering
  const ContactMap = useMemo(() => {
    return () => (
      <div className="contact-map">
        <iframe 
          key={mapKey}
          src="https://maps.google.com/maps?q=Roland%20Institute%20of%20Technology&t=&z=16&ie=UTF8&iwloc=&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="eager" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    );
  }, [mapKey]);

  // Phone input component that handles both authenticated and unauthenticated state
  const PhoneInput = () => (
    <div className="form-row phone-input-row">
      {isAuthenticated && (
        <div className="form-group phone-input-container">
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone number" 
            className="phone-input disabled auth-phone-input"
            readOnly={true}
          />
          <FontAwesomeIcon icon={faLock} className="lock-icon phone-lock" />
        </div>
      )}
      {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
    </div>
  );

  // Force admin users to always stay on the receive tab
  useEffect(() => {
    if (isAdmin && activeTab === 'send') {
      setActiveTab('receive');
    }
  }, [isAdmin, activeTab]);

  // Component to display admin auth status and instructions
  const AdminAuthStatus = () => {
    if (!isAdmin) return null;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    // Function to force logout and redirect to login
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    };
    
    // Function to manually retry API calls
    const handleRetry = () => {
      setApiError(null);
      setIsLoadingMessages(true);
      // Force a state change to trigger the useEffect
      setActiveFilter(activeFilter === 'all' ? 'all_refresh' : 'all');
      setTimeout(() => window.location.reload(), 500);
    };
    
    return (
      <div className="admin-auth-status">
        {apiError ? (
          <div className="auth-error">
            <p className="error-message">{apiError}</p>
            <div className="auth-info">
              <p><strong>Token Status:</strong> {token ? 'Present' : 'Missing'}</p>
              {token && (
                <>
                  <p><strong>Token Length:</strong> {token.length} characters</p>
                  <p><strong>Token Preview:</strong> {token.substring(0, 15)}...{token.substring(token.length - 10)}</p>
                </>
              )}
              <p><strong>User Role:</strong> {user.is_superuser ? 'Super Admin' : (user.is_staff ? 'Admin' : 'Regular User')}</p>
              <p><strong>User ID:</strong> {user.id || 'Unknown'}</p>
              <p><strong>Email:</strong> {user.email || 'Unknown'}</p>
              
              <div className="auth-debug-panel">
                <h4>Debugging Tools</h4>
                <div className="debug-actions">
                  <button 
                    className="debug-button"
                    onClick={() => {
                      const headers = { 'Authorization': `Bearer ${token}` };
                      console.log('Debug headers:', headers);
                      alert(`Current token: ${token ? token.substring(0, 15) + '...' : 'Missing'}`);
                    }}
                  >
                    Show Token
                  </button>
                  <button 
                    className="debug-button"
                    onClick={() => {
                      const newToken = prompt("Enter a new token:", token || '');
                      if (newToken) {
                        localStorage.setItem('token', newToken);
                        alert('Token updated. Page will refresh.');
                        window.location.reload();
                      }
                    }}
                  >
                    Update Token
                  </button>
                </div>
              </div>
              
              <div className="auth-actions">
                <button 
                  className="retry-button"
                  onClick={handleRetry}
                >
                  <FontAwesomeIcon icon={faSync} /> Retry
                </button>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-success">
            <p><strong>Authenticated as:</strong> {user.firstName || ''} {user.lastName || ''} ({user.is_superuser ? 'Super Admin' : (user.is_staff ? 'Admin' : 'Regular User')})</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="contact-page">
      {/* Sidebar - Only show for authenticated users */}
      {isAuthenticated && (
        <div 
          className={`contact-sidebar ${isHovering ? 'expanded' : 'collapsed'}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isHovering ? (
            <div className="sidebar-options">
              {!isAdmin && (
              <div 
                className={`sidebar-option ${activeTab === 'send' ? 'active' : ''}`}
                onClick={() => setActiveTab('send')}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send</span>
              </div>
              )}
              <div 
                className={`sidebar-option ${activeTab === 'receive' ? 'active' : ''}`}
                onClick={() => setActiveTab('receive')}
              >
                <FontAwesomeIcon icon={faInbox} />
                <span>{isAdmin ? 'Messages' : 'Receive'}</span>
              </div>
            </div>
          ) : (
            <div className="sidebar-bar">
              <div className="sidebar-arrow-icon">
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isAdmin && activeTab === 'send' ? (
        <div className="contact-content" id="contact-section">
          <div className="contact-header">
            <h1>LET'S KEEP IN TOUCH</h1>
            <div className="header-tabs">
              <button 
                className={`tab-button ${activeTab === 'send' ? 'active' : ''}`}
                onClick={() => setActiveTab('send')}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send</span>
              </button>
              {isAuthenticated && (
                <button 
                  className={`tab-button ${activeTab === 'receive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('receive')}
                >
                  <FontAwesomeIcon icon={faInbox} />
                  <span>Receive</span>
                </button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">Loading your information...</div>
          ) : (
            <div className={`contact-main ${isAdmin ? 'admin-contact-main' : ''}`}>
              <ContactDetails />
              
              <div className="contact-form">
                <h2>Send us a message</h2>
                {apiError && (
                  <div className="api-error-notice">
                    <p>{apiError}</p>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="auth-notice">
                    <p>Your information has been pre-filled and is read-only.</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name (letters only)" 
                          className={isAuthenticated ? 'disabled' : ''}
                          readOnly={isAuthenticated}
                        />
                        {isAuthenticated && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
                      </div>
                      {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <div className="input-with-icon">
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email address" 
                          className={isAuthenticated ? 'disabled' : ''}
                          readOnly={isAuthenticated}
                        />
                        {isAuthenticated && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
                      </div>
                      {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                    </div>
                  </div>
                  
                  {/* Use the PhoneInput component */}
                  <PhoneInput />
                  
                  <div className="form-group">
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your message (letters only)"
                    ></textarea>
                    {formErrors.message && <div className="form-error">{formErrors.message}</div>}
                  </div>
                  <button type="submit" className="send-button">SEND</button>
                </form>
              </div>
            </div>
          )}
          
          {!isAdmin && <ContactMap />}
        </div>
      ) : (
        <div className="contact-receive-container" id="contact-section">
          <div className="contact-header">
            <h1>{isAdmin ? 'MESSAGE MANAGEMENT' : 'LET\'S KEEP IN TOUCH'}</h1>
            <div className="header-tabs">
              {!isAdmin && (
              <button 
                className={`tab-button ${activeTab === 'send' ? 'active' : ''}`}
                onClick={() => setActiveTab('send')}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send</span>
              </button>
              )}
              {isAuthenticated && (
                <button 
                  className={`tab-button ${activeTab === 'receive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('receive')}
                >
                  <FontAwesomeIcon icon={faInbox} />
                  <span>{isAdmin ? 'Messages' : 'Receive'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className={`contact-main ${isAdmin ? 'admin-contact-main' : ''}`}>
            {!isAdmin && <ContactDetails />}
            
            {isAdmin && <AdminAuthStatus />}
            
            <div className="receive-content">
              {isAdmin ? (
                <>
                  <div className="message-filter-section">
                    <div className="message-tabs">
                      <button 
                        className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                      >
                        All
                      </button>
                      <button 
                        className={`filter-tab ${activeFilter === 'registered' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('registered')}
                      >
                        Registered Users
                      </button>
                      <button 
                        className={`filter-tab ${activeFilter === 'non_registered' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('non_registered')}
                      >
                        Non-Registered Users
                      </button>
                    </div>
                    
                    <div className="read-filter-tabs">
                      <button 
                        className={`read-tab ${activeReadFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveReadFilter('all')}
                      >
                        All
                      </button>
                      <button 
                        className={`read-tab ${activeReadFilter === 'read' ? 'active' : ''}`}
                        onClick={() => setActiveReadFilter('read')}
                      >
                        Read
                      </button>
                      <button 
                        className={`read-tab ${activeReadFilter === 'unread' ? 'active' : ''}`}
                        onClick={() => setActiveReadFilter('unread')}
                      >
                        Unread
                      </button>
                    </div>
                    
                    <div className="search-container">
                      <input 
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                      />
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    </div>
                  </div>
                  
                  <div className="messages-container">
                    {isLoadingMessages ? (
                      <div className="loading-messages">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="no-messages">
                        <p>No messages found matching your filters.</p>
                      </div>
                    ) : (
                      <div className="messages-list-container">
                        <div className="messages-list">
                          {messages.map(message => (
                            <div 
                              key={message.id} 
                              className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                              onClick={() => handleSelectMessage(message)}
                            >
                              <div className="message-user-icon">
                                {message.is_from_registered_user ? (
                                  <FontAwesomeIcon icon={faUserTie} />
                                ) : (
                                  <FontAwesomeIcon icon={faUser} />
                                )}
                                {!message.is_read && !message.has_reply && (
                                  <span className="unread-indicator user-message">
                                    <FontAwesomeIcon icon={faCircle} />
                                  </span>
                                )}
                                {message.has_reply && message.is_read === false && (
                                  <span className="unread-indicator admin-reply">
                                    <FontAwesomeIcon icon={faCircle} />
                                  </span>
                                )}
                              </div>
                              <div className="message-info">
                                <div className="message-sender">
                                  <span className="sender-name">{message.name}</span>
                                  <span className="message-date">
                                    {new Date(message.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="message-preview">
                                  <p>{message.message.substring(0, 40)}...</p>
                                </div>
                                <div className="message-contact">
                                  <span className="contact-email">{message.email}</span>
                                  <span className="contact-phone">{message.phone}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {selectedMessage && (
                          <div className="message-detail">
                            <div className="message-detail-header">
                              <div className="detail-user-info">
                                <h3>{selectedMessage.name}</h3>
                                <p className="user-contact-info">
                                  {selectedMessage.email} | {selectedMessage.phone || 'No phone'}
                                </p>
                                <p className="message-timestamp">
                                  Sent on {new Date(selectedMessage.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="message-actions">
                                {selectedMessage.is_read ? (
                                  <button 
                                    className="mark-button"
                                    onClick={async () => {
                                      await contactService.markAsUnread(selectedMessage.id);
                                      setMessages(messages.map(m => 
                                        m.id === selectedMessage.id ? { ...m, is_read: false } : m
                                      ));
                                      setSelectedMessage({...selectedMessage, is_read: false});
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faEyeSlash} /> Mark as Unread
                                  </button>
                                ) : (
                                  <button 
                                    className="mark-button"
                                    onClick={async () => {
                                      await contactService.markAsRead(selectedMessage.id);
                                      setMessages(messages.map(m => 
                                        m.id === selectedMessage.id ? { ...m, is_read: true } : m
                                      ));
                                      setSelectedMessage({...selectedMessage, is_read: true});
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faEye} /> Mark as Read
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="message-content">
                              <p>{selectedMessage.message}</p>
                            </div>
                            
                            <div className="reply-section">
                              <h4>Admin Reply <FontAwesomeIcon icon={faReply} /></h4>
                              {showReplyConfirmation && (
                                <div className="reply-confirmation">
                                  <p>Reply sent successfully!</p>
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </div>
                              )}
                              <form onSubmit={handleReply}>
                                <textarea 
                                  placeholder="Type your reply here..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                ></textarea>
                                <button type="submit" className="send-reply-button">
                                  Send Reply <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2>My Messages</h2>
                  {isAuthenticated ? (
                    <div className="user-messages-container">
                      {isLoadingMessages ? (
                        <div className="loading-messages">Loading your messages...</div>
                      ) : (
                        <div className="user-messages-content">
                          <div className="messages-stats">
                            <div className="stats-item">
                              <span className="stats-label">Total Messages:</span>
                              <span className="stats-value">{messageStats.total_messages || 0}</span>
                            </div>
                            <div className="stats-item">
                              <span className="stats-label">Unread:</span>
                              <span className="stats-value">{messageStats.unread_messages || 0}</span>
                            </div>
                          </div>
                          
                          <div className="user-search-container">
                            <input 
                              type="text"
                              placeholder="Search in your messages..."
                              value={searchQuery}
                              onChange={handleSearchChange}
                              className="search-input"
                            />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                          </div>
                          
                          {messages.length === 0 ? (
                            <div className="no-messages">
                              <p>You don't have any messages yet.</p>
                              <p>Messages from administrators will appear here.</p>
                            </div>
                          ) : (
                            <div className="messages-list-container">
                              <div className="messages-list">
                                {messages.map(message => (
                                  <div 
                                    key={message.id} 
                                    className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectMessage(message)}
                                  >
                                    <div className="message-user-icon">
                                      <FontAwesomeIcon icon={faUserTie} />
                                      {!message.is_read && !message.has_reply && (
                                        <span className="unread-indicator user-message">
                                          <FontAwesomeIcon icon={faCircle} />
                                        </span>
                                      )}
                                      {message.has_reply && message.is_read === false && (
                                        <span className="unread-indicator admin-reply">
                                          <FontAwesomeIcon icon={faCircle} />
                                        </span>
                                      )}
                                    </div>
                                    <div className="message-info">
                                      <div className="message-sender">
                                        <span className="sender-name">Administrator</span>
                                        <span className="message-date">
                                          {new Date(message.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="message-preview">
                                        <p>{message.message.substring(0, 40)}...</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {selectedMessage && (
                                <div className="message-detail">
                                  <div className="message-detail-header">
                                    <div className="detail-user-info">
                                      <h3>Message from Administrator</h3>
                                      <p className="message-timestamp">
                                        Received on {new Date(selectedMessage.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="message-content">
                                    <p>{selectedMessage.message}</p>
                                  </div>
                                  
                                  {selectedMessage.has_reply && (
                                    <div className="admin-reply-section">
                                      <h4>Admin Reply</h4>
                                      <div className="admin-reply-content">
                                        <p>{selectedMessage.reply_text}</p>
                                        <div className="reply-info">
                                          <small>Replied by: {selectedMessage.replied_by_details?.first_name || 'Admin'} {selectedMessage.replied_by_details?.last_name || ''}</small>
                                          <small>on {new Date(selectedMessage.replied_at).toLocaleString()}</small>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="login-required-message">
                      <p>Please log in to see your messages.</p>
                      <button 
                        className="login-button"
                        onClick={() => window.location.href = '/login'}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} /> Login
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {!isAdmin && <ContactMap />}
        </div>
      )}
    </div>
  );
}

export default Contact;