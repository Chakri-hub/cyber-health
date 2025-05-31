const API_URL = 'http://127.0.0.1:8000/api';

export const authService = {
    // Request OTP for registration
    requestRegistrationOTP: async (email, captchaToken) => {
        try {
            // Removed console.log for security
            const response = await fetch(`${API_URL}/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    captchaToken 
                }),
            });
            
            const data = await response.json();
            // Removed console.log of OTP response for security
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }
            
            return data;
        } catch (error) {
            console.error('Error requesting OTP:', error);
            throw error;
        }
    },
    
    // Verify OTP and complete registration
    verifyOTP: async (email, otp, firstName, lastName, gender, phone) => {
        try {
            // Removed console.log for security
            const response = await fetch(`${API_URL}/users/verify-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    otp, 
                    firstName,
                    lastName,
                    gender,
                    phone
                }),
            });
            
            const data = await response.json();
            // Removed console.log of verification response for security
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }
            
            return data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    },
    
    // Request OTP for login
    requestLoginOTP: async (email, phone, captchaToken) => {
        try {
            // Removed console.log for security
            const response = await fetch(`${API_URL}/users/login-request-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    phone,
                    captchaToken 
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Account lockout
                    throw new Error(data.error || 'Account temporarily locked. Try again later.');
                } else if (response.status === 429) {
                    // Rate limiting
                    const attemptsMessage = data.attempts ? ` (${data.attempts} attempts)` : '';
                    throw new Error(data.error || `Too many login attempts${attemptsMessage}. Please try again later.`);
                } else {
                    throw new Error(data.error || 'Failed to send login OTP');
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error requesting login OTP:', error);
            throw error;
        }
    },
    
    // Verify login OTP
    verifyLoginOTP: async (email, otp) => {
        try {
            // Removed console.log for security
            const response = await fetch(`${API_URL}/users/login-verify-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Account lockout
                    throw new Error(data.error || 'Account temporarily locked. Try again later.');
                } else if (response.status === 429) {
                    // Rate limiting
                    const attemptsMessage = data.attempts ? ` (${data.attempts} attempts)` : '';
                    throw new Error(data.error || `Too many verification attempts${attemptsMessage}. Please try again later.`);
                } else {
                    throw new Error(data.error || 'Failed to verify login OTP');
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    },

    // Logout user and update last logout time
    logout: async (userId) => {
        try {
            if (!userId) {
                console.warn('No user ID provided for logout');
                return { success: true }; // Return success even if no userId to avoid UI issues
            }

            const response = await fetch(`${API_URL}/users/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
                credentials: 'include',
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.warn('Error during logout API call:', data.error);
                // We still want to clear local storage even if the API call fails
            }
            
            return data;
        } catch (error) {
            console.error('Error during logout:', error);
            // We still want to clear localStorage even if there's an error
            return { success: true };
        }
    },
    
    // Validate token on page load
    validateToken: async (token) => {
        try {
            if (!token) {
                return { valid: false };
            }
            
            // Create a simple endpoint to validate the token
            const response = await fetch(`${API_URL}/users/validate-token/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                return { valid: false };
            }
            
            const data = await response.json();
            return { valid: true, user: data.user };
        } catch (error) {
            console.error('Error validating token:', error);
            return { valid: false };
        }
    },
    
    // Resend registration OTP
    resendRegistrationOTP: async (email, captchaToken = null) => {
        try {
            const response = await fetch(`${API_URL}/users/resend-registration-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    captchaToken 
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend OTP');
            }
            
            return data;
        } catch (error) {
            console.error('Error resending registration OTP:', error);
            throw error;
        }
    },
    
    // Resend login OTP
    resendLoginOTP: async (email, captchaToken = null) => {
        try {
            const response = await fetch(`${API_URL}/users/resend-login-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    captchaToken 
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Account lockout
                    throw new Error(data.error || 'Account temporarily locked. Try again later.');
                } else if (response.status === 429) {
                    // Rate limiting
                    const attemptsMessage = data.attempts ? ` (${data.attempts} attempts)` : '';
                    throw new Error(data.error || `Too many resend attempts${attemptsMessage}. Please try again later.`);
                } else {
                    throw new Error(data.error || 'Failed to resend login OTP');
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error resending login OTP:', error);
            throw error;
        }
    },
    
    // Reset rate limit for a specific email (admin use only)
    resetRateLimit: async (email, adminKey) => {
        try {
            const response = await fetch(`${API_URL}/users/reset-rate-limit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    admin_key: adminKey
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset rate limit');
            }
            
            return data;
        } catch (error) {
            console.error('Error resetting rate limit:', error);
            throw error;
        }
    },
};