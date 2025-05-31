import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './FertilityTracker.css';

const FertilityTracker = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const userId = user?.id;
  const isAuthenticated = !!userId;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    basal_body_temperature: '',
    fertile_window: false,
    ovulation_day: false,
    notes: '',
  });

  const [history, setHistory] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    basal_body_temperature: '',
    notes: ''
  });

  useEffect(() => {
    if (userId) {
      fetchHistory();
      fetchCycleData();
    } else {
      // Load data from localStorage if user is not logged in
      loadFromLocalStorage();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/health/fertility-tracker/${userId}/`);
      if (Array.isArray(response.data)) {
        setHistory(response.data);
        // Also update localStorage as backup
        localStorage.setItem('fertilityTrackerHistory', JSON.stringify(response.data));
        setIsOffline(false);
      }
    } catch (error) {
      console.error('Error fetching fertility data:', error);
      setMessage('Failed to load fertility history from server. Loading from local storage if available.');
      loadFromLocalStorage();
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      // Load fertility history
      const fertilityData = localStorage.getItem('fertilityTrackerHistory');
      if (fertilityData) {
        setHistory(JSON.parse(fertilityData));
      } else {
        setHistory([]);
      }
      
      // Load cycle data
      const cycleHistoryData = localStorage.getItem('menstrualCycleHistory');
      if (cycleHistoryData) {
        setCycleData(JSON.parse(cycleHistoryData));
      } else {
        setCycleData([]);
      }
      
      if (fertilityData || cycleHistoryData) {
        setMessage('Data loaded from local storage.');
      } else {
        setMessage('No local data available.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setHistory([]);
      setCycleData([]);
    }
  };

  const fetchCycleData = async () => {
    try {
      const response = await axios.get(`/api/health/menstrual-cycle/${userId}/`);
      if (Array.isArray(response.data)) {
        setCycleData(response.data);
        // Also save to localStorage for offline access
        localStorage.setItem('menstrualCycleHistory', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching cycle data:', error);
      // Try to get cycle data from localStorage
      const localCycleData = localStorage.getItem('menstrualCycleHistory');
      if (localCycleData) {
        setCycleData(JSON.parse(localCycleData));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation error when user starts typing
    setValidationErrors({
      ...validationErrors,
      [name]: ''
    });
    
    // Handle different input types with validation
    if (name === 'basal_body_temperature') {
      // Only allow numbers and decimal point for temperature
      const sanitizedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = sanitizedValue.split('.');
      const finalValue = parts.length > 1 
        ? `${parts[0]}.${parts.slice(1).join('')}` 
        : sanitizedValue;
      
      // Validate temperature range if there's a value
      if (finalValue && !isNaN(parseFloat(finalValue))) {
        const temp = parseFloat(finalValue);
        if (temp < 35.0 || temp > 42.0) {
          setValidationErrors({
            ...validationErrors,
            basal_body_temperature: 'Temperature must be between 35.0°C and 42.0°C'
          });
        }
      }
      
      setFormData({
        ...formData,
        [name]: finalValue
      });
    } 
    else if (name === 'notes') {
      // Only allow letters and basic punctuation (no numbers or special characters)
      const sanitizedValue = value.replace(/[^a-zA-Z\s.,?!]/g, '');
      
      // Show validation error if input was sanitized
      if (sanitizedValue !== value) {
        setValidationErrors({
          ...validationErrors,
          notes: 'Only letters and basic punctuation are allowed'
        });
      }
      
      setFormData({
        ...formData,
        [name]: sanitizedValue
      });
    }
    else {
      // For other fields, use the standard handling
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const calculateFertileWindow = () => {
    if (cycleData.length < 2) return { start: null, end: null, ovulation: null };

    // Calculate average cycle length
    const sortedCycles = [...cycleData].sort((a, b) => 
      new Date(b.start_date) - new Date(a.start_date)
    );

    let totalDays = 0;
    let cycles = 0;
    
    for (let i = 0; i < sortedCycles.length - 1; i++) {
      const currentStart = new Date(sortedCycles[i].start_date);
      const prevStart = new Date(sortedCycles[i + 1].start_date);
      const daysDiff = Math.round((currentStart - prevStart) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff < 60) {
        totalDays += daysDiff;
        cycles++;
      }
    }
    
    if (cycles === 0) return { start: null, end: null, ovulation: null };
    
    const avgCycleLength = Math.round(totalDays / cycles);
    const lastPeriod = new Date(sortedCycles[0].start_date);
    
    // Estimate ovulation day (typically 14 days before next period)
    const ovulationDay = new Date(lastPeriod);
    ovulationDay.setDate(lastPeriod.getDate() + (avgCycleLength - 14));
    
    // Fertile window is typically 5 days before ovulation plus the ovulation day
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDay);
    
    return {
      start: fertileStart,
      end: fertileEnd,
      ovulation: ovulationDay
    };
  };

  const isDateInFertileWindow = (dateToCheck) => {
    const { start, end } = calculateFertileWindow();
    if (!start || !end) return false;
    
    const date = new Date(dateToCheck);
    return date >= start && date <= end;
  };

  const isOvulationDay = (dateToCheck) => {
    const { ovulation } = calculateFertileWindow();
    if (!ovulation) return false;
    
    const date = new Date(dateToCheck);
    return date.toDateString() === ovulation.toDateString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const handleFertilityWindowToggle = () => {
    const currentDate = formData.date;
    const isFertileWindow = isDateInFertileWindow(currentDate);
    const isOvulation = isOvulationDay(currentDate);
    
    setFormData({
      ...formData,
      fertile_window: isFertileWindow,
      ovulation_day: isOvulation
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent data saving for unauthenticated users
    if (!isAuthenticated) {
      setMessage('Please log in to save your data.');
      return;
    }
    
    // Validate before submission
    let hasErrors = false;
    const errors = { ...validationErrors };
    
    // Check temperature if provided
    if (formData.basal_body_temperature) {
      const temp = parseFloat(formData.basal_body_temperature);
      if (isNaN(temp) || temp < 35.0 || temp > 42.0) {
        errors.basal_body_temperature = 'Temperature must be between 35.0°C and 42.0°C';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
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
      localStorage.setItem('fertilityTrackerHistory', JSON.stringify(updatedHistory));
      
      if (userId) {
        // Try to save to server if user is logged in
        try {
          const response = await axios.post(`/api/health/fertility-tracker/${userId}/`, formData);
          
          if (response.data.success) {
            setMessage('Fertility data saved successfully!');
            fetchHistory(); // Refresh from server
            setIsOffline(false);
          } else {
            setMessage('Failed to save data to server, but saved locally.');
            setHistory(updatedHistory); // Update UI with local data
            setIsOffline(true);
          }
        } catch (error) {
          console.error('Error saving fertility data to server:', error);
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
        date: new Date().toISOString().slice(0, 10),
        basal_body_temperature: '',
        fertile_window: false,
        ovulation_day: false,
        notes: '',
      });
      setValidationErrors({
        basal_body_temperature: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error in submit process:', error);
      setMessage('An error occurred while saving data.');
    } finally {
      setIsLoading(false);
    }
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

  const renderTemperatureChart = () => {
    if (history.length < 3) {
      return <p>Need more data for temperature chart (at least 3 entries)</p>;
    }
    
    // Sort history by date
    const sortedHistory = [...history]
      .filter(entry => entry.basal_body_temperature)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Get last 14 entries with temperature
    
    if (sortedHistory.length < 3) {
      return <p>Need more temperature data for chart</p>;
    }
    
    // Find min and max temperatures for scaling
    const temps = sortedHistory.map(entry => parseFloat(entry.basal_body_temperature));
    const minTemp = Math.min(...temps) - 0.1;
    const maxTemp = Math.max(...temps) + 0.1;
    
    return (
      <div className="temperature-chart">
        <h4>Basal Body Temperature Chart</h4>
        <div className="chart-container">
          <div className="temp-labels">
            {[...Array(5)].map((_, i) => {
              const temp = maxTemp - (i * (maxTemp - minTemp) / 4);
              return <div key={i} className="temp-label">{temp.toFixed(1)}°C</div>;
            })}
          </div>
          <div className="chart-content">
            {sortedHistory.map((entry, idx) => {
              const temp = parseFloat(entry.basal_body_temperature);
              const percentage = 100 - ((temp - minTemp) / (maxTemp - minTemp) * 100);
              
              return (
                <div key={idx} className="chart-bar">
                  <div 
                    className={`bar-value ${entry.fertile_window ? 'fertile' : ''} ${entry.ovulation_day ? 'ovulation' : ''}`}
                    style={{ top: `${percentage}%` }}
                    title={`${temp.toFixed(1)}°C on ${formatDate(entry.date)}`}
                  />
                  <div className="bar-date">{new Date(entry.date).getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-item"><span className="legend-color"></span> Temperature</div>
          <div className="legend-item"><span className="legend-color fertile"></span> Fertile Window</div>
          <div className="legend-item"><span className="legend-color ovulation"></span> Ovulation Day</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fertility-tracker">
      <div className="tracker-container">
        <div className="tracker-form">
          <h2>Fertility & Ovulation Tracker</h2>
          <p>Track your fertile window with basal body temperature and cycle data.</p>
          
          {renderLoginPrompt()}
          {isOffline && <div className="offline-notice">Working in offline mode. Data is saved locally.</div>}
          {message && <div className="message">{message}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Basal Body Temperature (°C):</label>
              <input
                type="text"
                name="basal_body_temperature"
                value={formData.basal_body_temperature}
                onChange={handleChange}
                placeholder="36.5"
              />
              {validationErrors.basal_body_temperature && (
                <div className="validation-error">{validationErrors.basal_body_temperature}</div>
              )}
              <small>Measure first thing in the morning before getting out of bed</small>
            </div>
            
            <div className="form-group">
              <button type="button" onClick={handleFertilityWindowToggle} className="fertility-check-btn">
                Check Fertility Window
              </button>
              
              <div className="fertility-indicators">
                <div className="indicator">
                  <label>
                    <input
                      type="checkbox"
                      name="fertile_window"
                      checked={formData.fertile_window}
                      onChange={handleChange}
                    />
                    Fertile Window
                  </label>
                </div>
                <div className="indicator">
                  <label>
                    <input
                      type="checkbox"
                      name="ovulation_day"
                      checked={formData.ovulation_day}
                      onChange={handleChange}
                    />
                    Ovulation Day
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any observations..."
              />
              {validationErrors.notes && (
                <div className="validation-error">{validationErrors.notes}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading || !isAuthenticated}
              title={!isAuthenticated ? "Please log in to save data" : ""}
            >
              {isLoading ? 'Saving...' : 'Save Fertility Data'}
            </button>
            
            {!isAuthenticated && (
              <div className="login-required-note">
                <small>* Login required to save data</small>
              </div>
            )}
          </form>
        </div>
        
        <div className="tracker-visualizations">
          <div className="fertility-window-info">
            <h3>Fertility Window</h3>
            <div className="window-dates">
              {cycleData.length >= 2 ? (
                <>
                  <p>
                    <strong>Fertile Window:</strong> {' '}
                    {formatDate(calculateFertileWindow().start)} - {formatDate(calculateFertileWindow().end)}
                  </p>
                  <p>
                    <strong>Estimated Ovulation Day:</strong> {' '}
                    {formatDate(calculateFertileWindow().ovulation)}
                  </p>
                </>
              ) : (
                <p>Need more cycle data to calculate fertility window (at least 2 periods).</p>
              )}
            </div>
          </div>
          
          {renderTemperatureChart()}
          
          <div className="history-list">
            <h3>Recent Readings</h3>
            {history.length === 0 ? (
              <p>No readings yet. Start tracking your fertility data.</p>
            ) : (
              <div className="history-entries">
                {history.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="history-entry">
                    <div className="history-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      {entry.basal_body_temperature && (
                        <div className="temp-reading">
                          <strong>BBT:</strong> {entry.basal_body_temperature}°C
                        </div>
                      )}
                      <div className="fertility-status">
                        {entry.fertile_window && <span className="badge fertile">Fertile Window</span>}
                        {entry.ovulation_day && <span className="badge ovulation">Ovulation Day</span>}
                      </div>
                      {entry.notes && <div className="notes"><strong>Notes:</strong> {entry.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilityTracker; 