const API_URL = 'http://127.0.0.1:8000/api';

export const tipService = {
  // Get all tips
  getAllTips: async () => {
    try {
      const response = await fetch(`${API_URL}/tips/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch tips');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tips:', error);
      throw error;
    }
  },
  
  // Get tips by category
  getTipsByCategory: async (categorySlug) => {
    try {
      const response = await fetch(`${API_URL}/tips/by_category/?slug=${categorySlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch tips by category');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tips by category:', error);
      throw error;
    }
  },
  
  // Save a new tip
  saveTip: async (tipData, token) => {
    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      
      // Add text fields to formData
      formData.append('title', tipData.title || 'Cybersecurity Tip');
      formData.append('content', tipData.text);
      formData.append('is_published', true);
      
      // Add category - using a default category ID of 1 if not specified
      formData.append('category', tipData.category || 1);
      
      // Add image if available
      if (tipData.image) {
        formData.append('image', tipData.image);
      }
      
      console.log('Tip data being sent:', {
        title: tipData.title || 'Cybersecurity Tip',
        content: tipData.text ? `${tipData.text.substring(0, 20)}...` : 'No content',
        category: tipData.category || 1,
        hasImage: !!tipData.image
      });
      
      // Simple headers without authentication for development
      const headers = {};
      
      const response = await fetch(`${API_URL}/tips/`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || `Failed to save tip: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to save tip: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      return data;
    } catch (error) {
      console.error('Error saving tip:', error);
      throw error;
    }
  },
  
  // Delete a tip
  deleteTip: async (tipId, token) => {
    try {
      // Simple headers without authentication for development
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${API_URL}/tips/${tipId}/`, {
        method: 'DELETE',
        headers,
        // Include credentials to send cookies for session authentication
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Failed to delete tip';
        } catch (e) {
          errorMessage = `Failed to delete tip: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting tip:', error);
      throw error;
    }
  },
  
  // Update tip order
  updateTipOrder: async (tipId, newOrder) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${API_URL}/tips/${tipId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ order: newOrder }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || `Failed to update tip order: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to update tip order: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating tip order:', error);
      throw error;
    }
  },
  
  // Reorder multiple tips at once
  reorderTips: async (orderData) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${API_URL}/tips/reorder/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || `Failed to reorder tips: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to reorder tips: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reordering tips:', error);
      throw error;
    }
  }
};