import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Helper function to get user from storage
const getUserFromStorage = () => {
  // Prefer sessionStorage for better security
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  // Fallback to localStorage if needed (for compatibility)
  const localUser = localStorage.getItem('user');
  if (localUser) {
    // Migrate user from localStorage to sessionStorage for better session management
    const parsedUser = JSON.parse(localUser);
    sessionStorage.setItem('user', JSON.stringify(parsedUser));
    return parsedUser;
  }
  
  return null;
};

// Helper function to get token from storage
const getTokenFromStorage = () => {
  // Prefer sessionStorage for better security
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    return sessionToken;
  }
  
  // Fallback to localStorage if needed (for compatibility)
  const localToken = localStorage.getItem('token');
  if (localToken) {
    // Migrate token from localStorage to sessionStorage for better session management
    sessionStorage.setItem('token', localToken);
    return localToken;
  }
  
  return null;
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isLoading: false,
  error: null,
};

// Create logout thunk action
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    const { user } = getState().auth;
    if (user && user.id) {
      await authService.logout(user.id);
    }
    return true;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      // Store in sessionStorage instead of localStorage for better session management
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      sessionStorage.setItem('token', action.payload.token);
      
      // Also store in localStorage for backward compatibility
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false; // Explicitly set authentication status to false
      
      // Clear all authentication data from storages
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('profileUpdatePopupDismissed');
      
      // Clear any session cookies by setting them to expire
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        // Use the existing logout reducer logic
        state.user = null;
        state.token = null;
        state.error = null;
        state.isAuthenticated = false;
        
        // Clear all authentication data from storages
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('profileUpdatePopupDismissed');
        
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      });
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;