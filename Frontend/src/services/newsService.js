const API_URL = 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // Add JWT token as a cookie as well for redundancy
    document.cookie = `jwt=${token}; path=/; SameSite=Lax`;
    console.log('Auth headers being sent:', headers);
  } else {
    console.log('No auth token found in localStorage');
  }
  
  return headers;
};

export const newsService = {
  // Get all news videos
  getAllNews: async () => {
    try {
      // Force refresh token status from localStorage
      const token = localStorage.getItem('token');
      const headers = getAuthHeaders();
      
      console.log('Making API request to news endpoint with auth token:', !!token);
      
      const response = await fetch(`${API_URL}/news/`, {
        method: 'GET',
        headers,
        credentials: 'include', // Important for sending cookies
      });
      
      console.log('News API response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch news');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },
  
  // Fetch YouTube video data (title, description, thumbnail) from a URL
  fetchYoutubeData: async (youtubeUrl) => {
    try {
      const response = await fetch(`${API_URL}/news/youtube-data/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ url: youtubeUrl }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch YouTube data');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      throw error;
    }
  },
  
  // Save a new news video
  saveNewsVideo: async (newsData) => {
    try {
      const response = await fetch(`${API_URL}/news/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(newsData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save news video');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving news video:', error);
      throw error;
    }
  },
  
  // Delete a news video
  deleteNewsVideo: async (newsId) => {
    try {
      const response = await fetch(`${API_URL}/news/${newsId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete news video');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting news video:', error);
      throw error;
    }
  },
  
  // Reorder news videos
  reorderNews: async (orderData) => {
    try {
      console.log('Making reorder request with data:', orderData);
      const response = await fetch(`${API_URL}/news/reorder/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      
      console.log('Reorder response status:', response.status);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.error || `Failed to reorder news videos: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to reorder news videos: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Reorder success data:', data);
      return data;
    } catch (error) {
      console.error('Error reordering news videos:', error);
      throw error;
    }
  }
}; 