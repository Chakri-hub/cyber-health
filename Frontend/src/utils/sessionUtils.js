// Session timeout utilities for handling user inactivity
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

// Default session timeout in milliseconds (30 minutes)
const DEFAULT_TIMEOUT = 30 * 60 * 1000;
// Warning before timeout (5 minutes before expiry)
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000;

let timeoutId = null;
let warningTimeoutId = null;
let lastActivityTime = Date.now();
let activeTimeoutDuration = DEFAULT_TIMEOUT;

// Initialize session timeout tracker
export const initSessionTimeoutTracker = (timeout = DEFAULT_TIMEOUT) => {
  // Store the active timeout duration
  activeTimeoutDuration = timeout;
  console.log(`Session timeout initialized: ${timeout/60000} minutes`);
  
  // Reset the session timeout when the page loads
  resetSessionTimeout(timeout);

  // Add event listeners for user activity
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown', 
    'scroll', 'touchstart', 'click', 'contextmenu'
  ];
  
  // Add event listeners
  activityEvents.forEach(event => {
    window.addEventListener(event, () => onUserActivity(timeout));
  });
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check if session has expired when tab becomes visible again
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityTime;
      console.log(`Tab visible after ${inactiveTime/1000} seconds`);
      
      if (inactiveTime >= timeout) {
        console.log('Session expired while tab was inactive');
        endSession();
      } else {
        console.log('Resetting session timeout on tab visibility');
        resetSessionTimeout(timeout);
      }
    }
  });
  
  // Handle browser close/refresh (not reliable, but helps in some cases)
  window.addEventListener('beforeunload', () => {
    // Clear any timeout to avoid memory leaks
    clearTimeouts();
  });
};

// Handle user activity
const onUserActivity = (timeout) => {
  // Update last activity time
  lastActivityTime = Date.now();
  // Reset timeout
  resetSessionTimeout(timeout);
};

// Show warning before session timeout
const showSessionWarning = () => {
  // Get the current state to check if user is logged in
  const state = store.getState();
  const { user } = state.auth;
  
  // Only show warning if user is logged in
  if (user) {
    console.log('Session expiring soon warning');
    alert('Your session will expire soon due to inactivity. Please click OK to continue.');
    
    // User acknowledged the warning, reset the session
    resetSessionTimeout(activeTimeoutDuration);
  }
};

// Reset the session timeout
export const resetSessionTimeout = (timeout = DEFAULT_TIMEOUT) => {
  // Clear existing timeouts
  clearTimeouts();
  
  // Get the current state to check if user is logged in
  const state = store.getState();
  const { user } = state.auth;
  
  // Only set timeouts if user is logged in
  if (user) {
    console.log(`Setting session timeout: ${timeout/60000} minutes`);
    
    // Set warning timeout (5 minutes before expiry)
    if (timeout > WARNING_BEFORE_TIMEOUT) {
      warningTimeoutId = setTimeout(() => {
        showSessionWarning();
      }, timeout - WARNING_BEFORE_TIMEOUT);
    }
    
    // Set session expiry timeout
    timeoutId = setTimeout(() => {
      console.log('Session timeout triggered');
      endSession();
    }, timeout);
  }
};

// Clear all timeouts
const clearTimeouts = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }
};

// End the user session due to inactivity
export const endSession = () => {
  // Clear timeouts
  clearTimeouts();
  
  // Get the current state
  const state = store.getState();
  const { user } = state.auth;
  
  // Only logout if the user is logged in
  if (user) {
    console.log('Ending session due to inactivity');
    
    // Dispatch logout action
    store.dispatch(logout());
    
    // Alert the user
    alert('Your session has expired due to inactivity. Please log in again.');
    
    // Redirect to login page
    window.location.href = '/';
  }
}; 