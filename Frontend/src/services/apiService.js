import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include cookies in all requests
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  config => {
    // Try multiple token sources to ensure we have a valid token
    let token = localStorage.getItem('token');
    
    // If not available directly, check if there's user data with a token
    if (!token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.token) {
            token = user.token;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    }
    
    if (token) {
      // Try multiple authentication header formats
      // Some Django backends expect different formats
      
      // Format 1: Bearer token (OAuth2 style)
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // For debugging
      console.log('Using token for authentication:', token.substring(0, 10) + '...');
    } else {
      console.warn('No authentication token available for request to:', config.url);
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log detailed error information
    console.error('API error:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle 401/403 errors (authentication/authorization issues)
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('Authentication error. Verify your login status.');
        // You could redirect to login or dispatch an auth error action here
      }
    }
    
    return Promise.reject(error);
  }
);

export const deviceService = {
  // Save device information
  saveDeviceInfo: (deviceData) => {
    console.log('Saving device info:', deviceData);
    
    // Ensure we have the required data
    if (!deviceData) {
      console.error('No device data provided');
      return Promise.reject(new Error('No device data provided'));
    }
    
    return apiClient.post('/users/save-device-info/', { 
      device_info: deviceData 
    }).then(response => {
      console.log('Device info save response:', response.data);
      return response;
    }).catch(error => {
      console.error('Error saving device info:', error);
      throw error;
    });
  },
  
  // Get all devices (admin only)
  getAllDevices: () => {
    console.log('Fetching all devices');
    return apiClient.get('/users/devices/all/').then(response => {
      console.log('All devices response:', response.data);
      return response;
    }).catch(error => {
      console.error('Error fetching all devices:', error);
      throw error;
    });
  },
  
  // Get devices for a specific user
  getUserDevices: (userId) => {
    console.log(`Fetching devices for user ${userId}`);
    return apiClient.get(`/users/devices/${userId}/`).then(response => {
      console.log(`User devices response for ${userId}:`, response.data);
      return response;
    }).catch(error => {
      console.error(`Error fetching devices for user ${userId}:`, error);
      throw error;
    });
  },
  
  // Delete a device
  deleteDevice: (deviceId) => {
    console.log(`Deleting device ${deviceId}`);
    return apiClient.delete(`/users/devices/delete/${deviceId}/`).then(response => {
      console.log(`Device delete response for ${deviceId}:`, response.data);
      return response;
    }).catch(error => {
      console.error(`Error deleting device ${deviceId}:`, error);
      throw error;
    });
  }
};

export default apiClient; 