// Menstrual Cycle Tracking Service
const API_URL = 'http://127.0.0.1:8000/api';

export const menstrualCycleService = {
    // Save menstrual cycle data
    saveCycleData: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/menstrual-cycle/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/menstrual-cycle/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to save menstrual cycle data (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response:', responseData);
                return responseData;
            } catch (e) {
                console.log('No JSON in success response, returning simple success object');
                return { success: true };
            }
        } catch (error) {
            console.error('Error saving menstrual cycle data:', error);
            throw error;
        }
    },
    
    // Get menstrual cycle history
    getCycleHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/menstrual-cycle/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/menstrual-cycle/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get menstrual cycle records (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return { records: [] };
            }
        } catch (error) {
            console.error('Error getting menstrual cycle records:', error);
            throw error;
        }
    },
    
    // Get cycle predictions
    getCyclePredictions: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/menstrual-cycle/predictions/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/menstrual-cycle/predictions/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get cycle predictions (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Predictions data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return { predictions: [] };
            }
        } catch (error) {
            console.error('Error getting cycle predictions:', error);
            throw error;
        }
    },
    
    // Log symptoms
    logSymptoms: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/menstrual-cycle/symptoms/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/menstrual-cycle/symptoms/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to log symptoms (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response:', responseData);
                return responseData;
            } catch (e) {
                console.log('No JSON in success response, returning simple success object');
                return { success: true };
            }
        } catch (error) {
            console.error('Error logging symptoms:', error);
            throw error;
        }
    },
    
    // Get symptoms history
    getSymptomsHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/menstrual-cycle/symptoms/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/menstrual-cycle/symptoms/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get symptoms history (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Symptoms history data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return { records: [] };
            }
        } catch (error) {
            console.error('Error getting symptoms history:', error);
            throw error;
        }
    }
};