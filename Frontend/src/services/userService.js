const API_URL = 'http://127.0.0.1:8000/api';

export const userService = {
    getAllUsers,
    deleteUser,
    changeUserRole,
    updateUserInfo,
    getUserDetails,
    uploadProfilePicture,
    removeProfilePicture
};

async function getAllUsers(token) {
    try {
        // Create headers with proper authentication
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        const response = await fetch(`${API_URL}/users/all/`, {
            method: 'GET',
            headers,
            // Include credentials to send cookies for session authentication
            credentials: 'include',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch users');
        }
        
        const users = data.users;
        const transformedUsers = users.map(user => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.email === 'pchakradhar91@gmail.com' || user.is_superuser ? 'super-admin' : (user.is_staff ? 'admin' : 'user'),
            lastLogin: user.last_login || 'Never',
            isActive: user.is_active,
            dateJoined: user.date_joined || 'Unknown',
            isEmailVerified: user.is_email_verified,
            phoneNumber: user.phone_number || 'Not provided',
            gender: user.gender || 'Not specified',
            createdAt: user.created_at || 'Unknown'
        }));
        
        return transformedUsers;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function deleteUser(userId, token) {
    try {
        // Create headers with proper authentication
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        const response = await fetch(`${API_URL}/users/delete/${userId}/`, {
            method: 'DELETE',
            headers,
            // Include credentials to send cookies for session authentication
            credentials: 'include',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user');
        }
        
        return data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function changeUserRole(userId, newRole, token) {
    try {
        // Create headers with proper authentication
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        const response = await fetch(`${API_URL}/users/change-role/${userId}/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ is_admin: newRole === 'admin' }),
            // Include credentials to send cookies for session authentication
            credentials: 'include',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to change user role');
        }
        
        return data;
    } catch (error) {
        console.error('Error changing user role:', error);
        throw error;
    }
}

async function updateUserInfo(userId, userData, token) {
    try {
        // Create headers with proper authentication
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        // Process the date if it exists to ensure proper format
        const processedUserData = { ...userData };
        
        // Log the date before processing
        console.log('Date value before processing:', processedUserData.dob);
        
        // If dob exists and is not null, ensure it's in the right format
        if (processedUserData.dob) {
            // Make sure it's in the format YYYY-MM-DD
            const dateObj = new Date(processedUserData.dob);
            if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                processedUserData.dob = `${year}-${month}-${day}`;
            }
        }
        
        // Log the processed date
        console.log('Date value after processing:', processedUserData.dob);
        
        const response = await fetch(`${API_URL}/users/update/${userId}/`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(processedUserData),
            // Include credentials to send cookies for session authentication
            credentials: 'include',
        });
        
        // Check if response is ok before trying to parse as JSON
        if (!response.ok) {
            // Try to parse error response, but handle gracefully if it's not valid JSON
            let errorData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with status: ${response.status}`);
                } catch (jsonError) {
                    // If parsing JSON fails, use the response text
                    const text = await response.text();
                    throw new Error(text || `Server responded with status: ${response.status}`);
                }
            } else {
                // If not JSON, just get the response text
                const text = await response.text();
                throw new Error(text || `Server responded with status: ${response.status}`);
            }
        }
        
        // Try to parse the response as JSON, with fallback handling
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                // Log success with the processed data
                console.log('User info update successful with dob:', processedUserData.dob);
                
                return {
                    ...data,
                    processedData: processedUserData // Include the processed data in the response
                };
            } else {
                // If server didn't return JSON, create a success response
                console.log('Non-JSON response but successful with dob:', processedUserData.dob);
                
                return {
                    success: true,
                    message: 'User information updated successfully',
                    processedData: processedUserData
                };
            }
        } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // Return a success object even if JSON parsing fails
            return {
                success: true,
                message: 'User information updated successfully',
                processedData: processedUserData
            };
        }
    } catch (error) {
        console.error('Error updating user information:', error);
        throw error;
    }
}

async function getUserDetails(userId, token) {
    try {
        console.log(`Getting details for user ID: ${userId}`);
        
        // Create headers with proper authentication
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
            
            // Also add Bearer token in case that's what the backend expects
            headers['Authorization'] = `Bearer ${token}`;
            console.log(`Using token for authentication: ${token.substring(0, 10)}...`);
        } else {
            console.log('No token available for authentication');
        }
        
        const response = await fetch(`${API_URL}/users/details/${userId}/`, {
            method: 'GET',
            headers,
            // Include credentials to send cookies for session authentication
            credentials: 'include',
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch user details');
        }
        
        const data = await response.json();
        console.log('User details response:', data);
        
        // Ensure devices array exists
        if (!data.devices) {
            console.log('No devices array in response, adding empty array');
            data.devices = [];
        }
        
        // Format dates for device information if available
        if (Array.isArray(data.devices)) {
            console.log(`Processing ${data.devices.length} devices`);
            data.devices.forEach((device, index) => {
                console.log(`Device ${index + 1}:`, device);
                
                // Ensure created_at and last_seen are properly formatted for display
                if (device.created_at) {
                    device.created_at = new Date(device.created_at).toISOString();
                }
                if (device.last_seen) {
                    device.last_seen = new Date(device.last_seen).toISOString();
                }
            });
        } else {
            console.error('Devices is not an array:', data.devices);
            data.devices = [];
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

async function uploadProfilePicture(userId, imageFile, token) {
    try {
        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Create headers with authentication if token provided
        const headers = {};
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        const response = await fetch(`${API_URL}/users/upload-profile-picture/${userId}/`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });
        
        // Check if response is ok before trying to parse as JSON
        if (!response.ok) {
            let errorData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with status: ${response.status}`);
                } catch (jsonError) {
                    const text = await response.text();
                    throw new Error(text || `Server responded with status: ${response.status}`);
                }
            } else {
                const text = await response.text();
                throw new Error(text || `Server responded with status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
    }
}

async function removeProfilePicture(userId, token) {
    try {
        // Create headers with authentication if token provided
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            // Create a proper Basic Auth header
            const email = JSON.parse(localStorage.getItem('user'))?.email || 'admin';
            const basicAuthToken = btoa(`${email}:${token}`);
            headers['Authorization'] = `Basic ${basicAuthToken}`;
        }
        
        const response = await fetch(`${API_URL}/users/remove-profile-picture/${userId}/`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });
        
        // Check if response is ok before trying to parse as JSON
        if (!response.ok) {
            let errorData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with status: ${response.status}`);
                } catch (jsonError) {
                    const text = await response.text();
                    throw new Error(text || `Server responded with status: ${response.status}`);
                }
            } else {
                const text = await response.text();
                throw new Error(text || `Server responded with status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error removing profile picture:', error);
        throw error;
    }
}