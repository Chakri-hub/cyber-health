// API service for contact messages
import apiClient from './apiService';

// Using apiClient which already has the base URL configured correctly

// Helper function to get CSRF token from cookies
const getCSRFToken = () => {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return '';
};

// Helper function to get user roles/permissions
const getUserPermissions = () => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) return { isAdmin: false, isSuperAdmin: false };
        
        const user = JSON.parse(userData);
        return {
            isAdmin: user.is_staff || user.is_superuser || user.role === 'admin' || user.role === 'super-admin',
            isSuperAdmin: user.is_superuser || user.role === 'super-admin',
            userId: user.id
        };
    } catch (error) {
        console.error('Error checking user permissions:', error);
        return { isAdmin: false, isSuperAdmin: false };
    }
};

const contactService = {
    // Send a contact message
    async sendMessage(messageData) {
        try {
            // Debug logging
            console.log('Sending contact message with data:', messageData);
            
            // For non-authenticated users, if phone is missing, set it to empty string
            if (!messageData.phone) {
                messageData.phone = '';
            }
            
            // Use the apiClient which has withCredentials set to true
            // This will properly handle authentication and CSRF tokens
            const response = await apiClient.post('/contact/send/', messageData);
            console.log('Contact message sent successfully:', response);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error details:', error.response ? error.response.data : 'No response data');
            console.error('Status code:', error.response ? error.response.status : 'No status code');
            throw error;
        }
    },
    
    // Get all messages (admin only)
    async getAllMessages(filters = {}) {
        try {
            // Check admin permissions first
            const { isAdmin } = getUserPermissions();
            if (!isAdmin) {
                throw new Error('Admin permissions required');
            }
            
            // Construct query params from filters
            const queryParams = new URLSearchParams();
            if (filters.read !== undefined) queryParams.append('read', filters.read);
            if (filters.userType) queryParams.append('user_type', filters.userType);
            if (filters.search) queryParams.append('search', filters.search);
            
            const queryString = queryParams.toString();
            const endpoint = queryString ? `/contact/messages/?${queryString}` : '/contact/messages/';
            
            console.log('Fetching messages with endpoint:', endpoint);
            
            // Use apiClient which already handles authentication and CSRF tokens
            const response = await apiClient.get(endpoint);
            
            console.log('Authentication successful');
            return response.data;
            
        } catch (error) {
            console.error('Error fetching messages:', error);
            
            // Provide more specific error information
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            
            throw error;
        }
    },
    
    // Get messages statistics (admin only)
    async getMessageStats() {
        try {
            // Check admin permissions first
            const { isAdmin } = getUserPermissions();
            if (!isAdmin) {
                throw new Error('Admin permissions required');
            }
            
            console.log('Fetching message stats');
            
            // Use apiClient which already handles authentication and CSRF tokens
            const response = await apiClient.get('/contact/messages/stats/');
            
            console.log('Authentication successful for stats');
            return response.data;
            
        } catch (error) {
            console.error('Error fetching message stats:', error);
            
            // Provide more specific error information
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            
            throw error;
        }
    },
    
    // Get messages for current user
    async getUserMessages(filters = {}) {
        try {
            // Ensure user is authenticated
            const userData = localStorage.getItem('user');
            if (!userData) {
                throw new Error('User authentication required');
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token missing');
            }
            
            // Construct query params from filters
            const queryParams = new URLSearchParams();
            if (filters.read !== undefined) queryParams.append('read', filters.read);
            if (filters.search) queryParams.append('search', filters.search);
            
            const queryString = queryParams.toString();
            const endpoint = queryString ? `/contact/messages/user_messages/?${queryString}` : '/contact/messages/user_messages/';
            
            console.log('Fetching user messages with endpoint:', endpoint);
            
            // Use apiClient which already handles authentication
            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('Error fetching user messages:', error);
            
            // Provide better error handling for 403 errors
            if (error.response && error.response.status === 403) {
                console.error('Permission denied. You may not have access to view messages.');
                return { results: [], error: 'Permission denied' };
            }
            
            // Return empty results instead of throwing to prevent UI breakage
            return { results: [], error: error.message };
        }
    },
    
    // Get message stats for current user
    async getUserMessageStats() {
        try {
            // Ensure user is authenticated
            const userData = localStorage.getItem('user');
            if (!userData) {
                throw new Error('User authentication required');
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token missing');
            }
            
            console.log('Fetching user message stats');
            
            // Use apiClient which already handles authentication
            const response = await apiClient.get('/contact/messages/user_stats/');
            return response.data;
        } catch (error) {
            console.error('Error fetching user message stats:', error);
            
            // Provide better error handling for 403 errors
            if (error.response && error.response.status === 403) {
                console.error('Permission denied. You may not have access to view message statistics.');
                return {
                    total_messages: 0,
                    read_messages: 0,
                    unread_messages: 0,
                    error: 'Permission denied'
                };
            }
            
            // Return default stats instead of throwing to prevent UI breakage
            return {
                total_messages: 0,
                read_messages: 0,
                unread_messages: 0,
                error: error.message
            };
        }
    },
    
    // Get a single message by ID
    async getMessage(messageId) {
        try {
            const response = await apiClient.get(`/contact/messages/${messageId}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching message ${messageId}:`, error);
            throw error;
        }
    },
    
    // Mark a message as read
    async markAsRead(messageId) {
        try {
            const response = await apiClient.post(`/contact/messages/${messageId}/mark_as_read/`, {});
            return response.data;
        } catch (error) {
            console.error(`Error marking message ${messageId} as read:`, error);
            throw error;
        }
    },
    
    // Mark a message as unread
    async markAsUnread(messageId) {
        try {
            const response = await apiClient.post(`/contact/messages/${messageId}/mark_as_unread/`, {});
            return response.data;
        } catch (error) {
            console.error(`Error marking message ${messageId} as unread:`, error);
            throw error;
        }
    },
    
    // Send a reply to a message (admin only)
    async sendReply(messageId, replyText) {
        try {
            // Check admin permissions first
            const { isAdmin } = getUserPermissions();
            if (!isAdmin) {
                throw new Error('Admin permissions required');
            }
            
            console.log('Sending reply to message:', messageId);
            
            const response = await apiClient.post(`/contact/messages/${messageId}/reply/`, {
                reply_text: replyText
            });
            
            console.log('Reply sent successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error sending reply to message ${messageId}:`, error);
            throw error;
        }
    }
};

export default contactService;