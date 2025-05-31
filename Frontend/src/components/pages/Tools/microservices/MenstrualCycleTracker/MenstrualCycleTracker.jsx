import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './MenstrualCycleTracker.css';

const MenstrualCycleTracker = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const userId = user?.id;
  const isAuthenticated = !!userId;

  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    flow_intensity: 'medium',
    symptoms: [],
    notes: '',
  });

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const symptomOptions = [
    'cramps', 'headache', 'bloating', 'fatigue', 
    'mood swings', 'backache', 'breast tenderness'
  ];

  useEffect(() => {
    if (userId) {
      fetchHistory();
    } else {
      // Load data from localStorage if user is not logged in
      loadFromLocalStorage();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/health/menstrual-cycle/${userId}/`);
      if (Array.isArray(response.data)) {
        setHistory(response.data);
        // Also update localStorage as backup
        localStorage.setItem('menstrualCycleHistory', JSON.stringify(response.data));
        setIsOffline(false);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setMessage('Failed to load history from server. Loading from local storage if available.');
      loadFromLocalStorage();
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const localData = localStorage.getItem('menstrualCycleHistory');
      if (localData) {
        setHistory(JSON.parse(localData));
        setMessage('Data loaded from local storage.');
      } else {
        setHistory([]);
        setMessage('No local data available.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setHistory([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for notes field
    if (name === 'notes') {
      // Only allow letters, spaces, and basic punctuation
      const sanitizedValue = value.replace(/[^a-zA-Z\s.,;:?!()]/g, '');
      setFormData({ ...formData, [name]: sanitizedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prevState => {
      const updatedSymptoms = prevState.symptoms.includes(symptom)
        ? prevState.symptoms.filter(s => s !== symptom)
        : [...prevState.symptoms, symptom];
      
      return { ...prevState, symptoms: updatedSymptoms };
    });
  };

  const calculateNextCycle = () => {
    if (history.length < 2) return 'Need more data to predict';
    
    // Calculate average cycle length based on history
    let totalDays = 0;
    let cycleCounts = 0;
    
    // Sort history by start_date in descending order
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.start_date) - new Date(a.start_date)
    );
    
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const currentStart = new Date(sortedHistory[i].start_date);
      const prevStart = new Date(sortedHistory[i + 1].start_date);
      const daysDiff = Math.round((currentStart - prevStart) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff < 60) { // Reasonable cycle length
        totalDays += daysDiff;
        cycleCounts++;
      }
    }
    
    if (cycleCounts === 0) return 'Need more data to predict';
    
    const avgCycleLength = Math.round(totalDays / cycleCounts);
    const lastPeriodStart = new Date(sortedHistory[0].start_date);
    const nextPeriodDate = new Date(lastPeriodStart);
    nextPeriodDate.setDate(lastPeriodStart.getDate() + avgCycleLength);
    
    return nextPeriodDate.toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent data saving for unauthenticated users
    if (!isAuthenticated) {
      setMessage('Please log in to save your data.');
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage('');
      
      // Create an entry with timestamp
      const entry = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Always save to local storage first
      const updatedHistory = [entry, ...history];
      localStorage.setItem('menstrualCycleHistory', JSON.stringify(updatedHistory));
      
      if (userId) {
        // Try to save to server if user is logged in
        try {
          const response = await axios.post(`/api/health/menstrual-cycle/${userId}/`, formData);
          
          if (response.data.success) {
            setMessage('Menstrual cycle data saved successfully!');
            fetchHistory(); // Refresh from server
            setIsOffline(false);
          } else {
            setMessage('Failed to save data to server, but saved locally.');
            setHistory(updatedHistory); // Update UI with local data
            setIsOffline(true);
          }
        } catch (error) {
          console.error('Error saving data to server:', error);
          setMessage('Saved locally. Will sync to server when connection is restored.');
          setHistory(updatedHistory); // Update UI with local data
          setIsOffline(true);
        }
      } else {
        // If no user ID, just use the local data
        setMessage('Data saved locally. Sign in to sync with your account.');
        setHistory(updatedHistory);
      }
      
      // Reset form
      setFormData({
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        flow_intensity: 'medium',
        symptoms: [],
        notes: '',
      });
    } catch (error) {
      console.error('Error in submit process:', error);
      setMessage('An error occurred while saving data.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    // This is a simplified calendar view
    // In a real app, you'd use a more sophisticated calendar component
    if (history.length === 0) return <p>No data to display in calendar</p>;
    
    return (
      <div className="cycle-calendar">
        <h4>Recent Cycles</h4>
        <div className="calendar-entries">
          {history.slice(0, 5).map((entry, idx) => (
            <div key={idx} className="calendar-entry">
              <span className="date">{new Date(entry.start_date).toLocaleDateString()}</span>
              <span className={`flow-indicator flow-${entry.flow_intensity}`}></span>
              {entry.end_date && (
                <span className="duration">
                  {Math.round((new Date(entry.end_date) - new Date(entry.start_date)) / (1000 * 60 * 60 * 24))} days
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="prediction">
          <p><strong>Next period prediction:</strong> {calculateNextCycle()}</p>
        </div>
      </div>
    );
  };

  const renderLoginPrompt = () => {
    if (!isAuthenticated) {
      return (
        <div className="login-prompt-banner">
          <p>Please log in to save your data to your account. <a href="/login">Login</a> or <a href="/register">Register</a></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="menstrual-cycle-tracker">
      <div className="tracker-container">
        <div className="tracker-form">
          <h2>Menstrual Cycle Tracker</h2>
          <p>Track your menstrual cycle to predict future periods and monitor symptoms.</p>
          
          {renderLoginPrompt()}
          {isOffline && <div className="offline-notice">Working in offline mode. Data is saved locally.</div>}
          {message && <div className="message">{message}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Date (optional):</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Flow Intensity:</label>
              <select 
                name="flow_intensity" 
                value={formData.flow_intensity}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
                <option value="very heavy">Very Heavy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Symptoms:</label>
              <div className="symptoms-checkbox">
                {symptomOptions.map((symptom) => (
                  <div key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      id={symptom}
                      checked={formData.symptoms.includes(symptom)}
                      onChange={() => handleSymptomChange(symptom)}
                    />
                    <label htmlFor={symptom}>{symptom.charAt(0).toUpperCase() + symptom.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
              />
              <small className="input-helper">Only letters and basic punctuation allowed. No numbers or special characters.</small>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading || !isAuthenticated}
              title={!isAuthenticated ? "Please log in to save data" : ""}
            >
              {isLoading ? 'Saving...' : 'Save Period Data'}
            </button>
            
            {!isAuthenticated && (
              <div className="login-required-note">
                <small>* Login required to save data</small>
              </div>
            )}
          </form>
        </div>
        
        {isAuthenticated ? (
          <div className="tracker-history">
            <h3>Your Cycle History</h3>
            {isLoading ? (
              <p>Loading history...</p>
            ) : (
              <>
                {renderCalendar()}
                
                <div className="history-list">
                  <h4>Recent Records</h4>
                  {history.length === 0 ? (
                    <p>No history yet. Add your first period data.</p>
                  ) : (
                    <div className="history-entries">
                      {history.slice(0, 5).map((entry, idx) => (
                        <div key={idx} className="history-entry">
                          <div className="history-date">
                            <strong>Start:</strong> {new Date(entry.start_date).toLocaleDateString()}
                            {entry.end_date && (
                              <span> | <strong>End:</strong> {new Date(entry.end_date).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="history-details">
                            <span className={`flow-badge ${entry.flow_intensity}`}>
                              {entry.flow_intensity.charAt(0).toUpperCase() + entry.flow_intensity.slice(1)} flow
                            </span>
                            {entry.symptoms.length > 0 && (
                              <div className="symptoms-list">
                                <strong>Symptoms:</strong> {entry.symptoms.join(', ')}
                              </div>
                            )}
                            {entry.notes && <div className="notes"><strong>Notes:</strong> {entry.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="tracker-history">
            <h3>Your Cycle History</h3>
            <div className="login-required-message">
              <p>Please log in to view your cycle history and predictions.</p>
              <p>Create an account to track your cycles, receive period predictions, and get personalized insights.</p>
              <div className="login-buttons">
                <a href="/login" className="login-btn">Login</a>
                <a href="/register" className="register-btn">Register</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenstrualCycleTracker; 