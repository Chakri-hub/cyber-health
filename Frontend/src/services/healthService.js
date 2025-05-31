const API_URL = 'http://127.0.0.1:8000/api';

export const healthService = {
    // Heart Rate
    saveHeartRate: async (userId, data) => {
        try {
            const response = await fetch(`${API_URL}/health/heart-rate/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save heart rate');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving heart rate:', error);
            throw error;
        }
    },
    
    getHeartRateHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/heart-rate/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/heart-rate/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            console.log('Heart rate history response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get heart rate records (Status: ${response.status})`);
            }
            
            const data = await response.json();
            console.log('Heart rate history data:', data);
            return data;
        } catch (error) {
            console.error('Error getting heart rate records:', error);
            throw error;
        }
    },

    // Blood Pressure
    saveBloodPressure: async (userId, data) => {
        try {
            // Log the request for debugging
            console.log(`Making POST request to ${API_URL}/health/blood-pressure/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/blood-pressure/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            // Log the raw response for debugging
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to save blood pressure (Status: ${response.status})`);
            }
            
            // Parse and return the response
            try {
                const responseData = await response.json();
                console.log('Success response:', responseData);
                return responseData;
            } catch (e) {
                // If there's no JSON in the response (e.g., empty response)
                console.log('No JSON in success response, returning simple success object');
                return { success: true };
            }
        } catch (error) {
            console.error('Error saving blood pressure:', error);
            throw error;
        }
    },
    
    getBloodPressureHistory: async (userId) => {
        try {
            // Log the request for debugging
            console.log(`Making GET request to ${API_URL}/health/blood-pressure/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/blood-pressure/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            // Log the raw response for debugging
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get blood pressure records (Status: ${response.status})`);
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
            console.error('Error getting blood pressure records:', error);
            throw error;
        }
    },
    
    // SpO2 (Oxygen Saturation)
    saveSpO2: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/spo2/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/spo2/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to save SpO2 (Status: ${response.status})`);
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
            console.error('Error saving SpO2:', error);
            throw error;
        }
    },
    
    getSpO2History: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/spo2/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/spo2/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get SpO2 records (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return [];
            }
        } catch (error) {
            console.error('Error getting SpO2 records:', error);
            throw error;
        }
    },
    
    // Respiratory Rate
    saveRespiratoryRate: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/respiratory-rate/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/respiratory-rate/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to save respiratory rate (Status: ${response.status})`);
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
            console.error('Error saving respiratory rate:', error);
            throw error;
        }
    },
    
    getRespiratoryRateHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/respiratory-rate/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/respiratory-rate/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get respiratory rate records (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return [];
            }
        } catch (error) {
            console.error('Error getting respiratory rate records:', error);
            throw error;
        }
    },

    // Body Temperature
    saveTemperature: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/temperature/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/temperature/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to save temperature (Status: ${response.status})`);
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
            console.error('Error saving temperature:', error);
            throw error;
        }
    },
    
    getTemperatureHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/temperature/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/temperature/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get temperature records (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Temperature history data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return [];
            }
        } catch (error) {
            console.error('Error getting temperature records:', error);
            throw error;
        }
    },
    
    // Weight Logger with BMI
    saveWeight: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/weight/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/weight/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to save weight (Status: ${response.status})`);
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
            console.error('Error saving weight:', error);
            throw error;
        }
    },
    
    getWeightHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/weight/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/weight/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get weight records (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Weight history data:', responseData);
                return responseData;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return [];
            }
        } catch (error) {
            console.error('Error getting weight records:', error);
            throw error;
        }
    },

    // Mood Tracker
    saveMood: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/mood/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/mood/${userId}/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Disable credentials temporarily if CORS is an issue
                // credentials: 'include',
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
                throw new Error(errorData.error || `Failed to save mood (Status: ${response.status})`);
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
            console.error('Error saving mood:', error);
            throw error;
        }
    },
    
    getMoodHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/mood/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/mood/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get mood history (Status: ${response.status})`);
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
            console.error('Error getting mood history:', error);
            throw error;
        }
    },
    
    // Anxiety Assessment (GAD-7)
    saveAnxietyAssessment: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/anxiety/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/anxiety/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to save anxiety assessment (Status: ${response.status})`);
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
            console.error('Error saving anxiety assessment:', error);
            throw error;
        }
    },
    
    getAnxietyHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/anxiety/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/anxiety/${userId}/`, {
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
                throw new Error(errorData.error || `Failed to get anxiety history (Status: ${response.status})`);
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
            console.error('Error getting anxiety history:', error);
            throw error;
        }
    },
    
    // Depression Assessment (PHQ-9)
    saveDepressionAssessment: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/depression/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            // Add retry logic
            let attempts = 0;
            const maxAttempts = 3;
            let response;
            
            while (attempts < maxAttempts) {
                try {
                    response = await fetch(`${API_URL}/health/depression/${userId}/`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include', // Enable credentials
                        body: JSON.stringify(data)
                    });
                    
                    // If we get a response (even an error response), break the retry loop
                    break;
                } catch (connectionError) {
                    attempts++;
                    if (attempts >= maxAttempts) throw connectionError;
                    console.log(`Connection attempt ${attempts} failed, retrying...`);
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to save depression assessment (Status: ${response.status})`);
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
            console.error('Error saving depression assessment:', error);
            return { success: false, error: error.message || 'Network or server error' };
        }
    },
    
    getDepressionHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/depression/${userId}/`);
            
            // Add retry logic
            let attempts = 0;
            const maxAttempts = 3;
            let response;
            
            while (attempts < maxAttempts) {
                try {
                    response = await fetch(`${API_URL}/health/depression/${userId}/`, {
                        method: 'GET',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include', // Enable sending cookies with the request
                    });
                    
                    // If we get a response (even an error response), break the retry loop
                    break;
                } catch (connectionError) {
                    attempts++;
                    if (attempts >= maxAttempts) throw connectionError;
                    console.log(`Connection attempt ${attempts} failed, retrying...`);
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log('Raw response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `Status code ${response.status}` };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || `Failed to get depression history (Status: ${response.status})`);
            }
            
            try {
                const responseData = await response.json();
                console.log('Success response data:', responseData);
                
                // Handle various response formats
                if (responseData.records) {
                    return responseData;
                } else if (Array.isArray(responseData)) {
                    return { success: true, records: responseData };
                } else {
                    return { success: true, records: [] };
                }
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                return { records: [] };
            }
        } catch (error) {
            console.error('Error getting depression history:', error);
            // Return empty records array instead of throwing to prevent component crashes
            return { records: [] };
        }
    },
    
    // Sleep Quality Checker
    saveSleepQuality: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/sleep/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/sleep/${userId}/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Disable credentials temporarily if CORS is an issue
                // credentials: 'include',
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
                throw new Error(errorData.error || `Failed to save sleep quality data (Status: ${response.status})`);
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
            console.error('Error saving sleep quality data:', error);
            throw error;
        }
    },
    
    getSleepQualityHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/sleep/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/sleep/${userId}/`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Disable credentials temporarily if CORS is an issue
                // credentials: 'include',
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
                throw new Error(errorData.error || `Failed to get sleep quality history (Status: ${response.status})`);
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
            console.error('Error getting sleep quality history:', error);
            throw error;
        }
    },
    
    // Sleep History (alias for getSleepQualityHistory for compatibility)
    getSleepHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/sleep/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/sleep/${userId}/`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
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
                throw new Error(errorData.error || `Failed to get sleep history (Status: ${response.status})`);
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
            console.error('Error getting sleep history:', error);
            throw error;
        }
    },
    
    // Mental Fatigue Checker
    saveMentalFatigue: async (userId, data) => {
        try {
            console.log(`Making POST request to ${API_URL}/health/mental-fatigue/${userId}/`);
            console.log('Request body:', JSON.stringify(data));
            
            const response = await fetch(`${API_URL}/health/mental-fatigue/${userId}/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Disable credentials temporarily if CORS is an issue
                // credentials: 'include',
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
                throw new Error(errorData.error || `Failed to save mental fatigue data (Status: ${response.status})`);
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
            console.error('Error saving mental fatigue data:', error);
            throw error;
        }
    },
    
    getMentalFatigueHistory: async (userId) => {
        try {
            console.log(`Making GET request to ${API_URL}/health/mental-fatigue/${userId}/`);
            
            const response = await fetch(`${API_URL}/health/mental-fatigue/${userId}/`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Disable credentials temporarily if CORS is an issue
                // credentials: 'include',
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
                throw new Error(errorData.error || `Failed to get mental fatigue history (Status: ${response.status})`);
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
            console.error('Error getting mental fatigue history:', error);
            throw error;
        }
    },
};