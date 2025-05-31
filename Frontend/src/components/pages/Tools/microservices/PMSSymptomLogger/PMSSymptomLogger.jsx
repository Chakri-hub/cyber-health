import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './PMSSymptomLogger.css';

const PMSSymptomLogger = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const userId = user?.id;
  const isAuthenticated = !!userId;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    symptoms: [],
    severity: 'medium',
    notes: '',
  });

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    date: '',
    notes: ''
  });

  // Get today's date in yyyy-mm-dd format for min/max date validation
  const today = new Date().toISOString().slice(0, 10);

  const symptomOptions = [
    'mood swings', 'cravings', 'bloating', 'irritability', 
    'headache', 'fatigue', 'anxiety', 'breast tenderness'
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild', description: 'Noticeable but does not interfere with daily activities' },
    { value: 'medium', label: 'Medium', description: 'Moderately uncomfortable and may affect some activities' },
    { value: 'severe', label: 'Severe', description: 'Significantly impacts daily activities and well-being' }
  ];

  const symptomTips = {
    'mood swings': [
      'Practice mindfulness meditation for 10 minutes daily',
      'Get regular exercise to boost endorphins',
      'Maintain a consistent sleep schedule'
    ],
    'cravings': [
      'Eat smaller, more frequent meals to stabilize blood sugar',
      'Choose complex carbohydrates over simple sugars',
      'Stay hydrated throughout the day'
    ],
    'bloating': [
      'Reduce salt intake during PMS week',
      'Avoid carbonated beverages',
      'Try gentle yoga poses focusing on digestion'
    ],
    'irritability': [
      'Practice deep breathing exercises when feeling tense',
      'Consider journaling to express emotions',
      'Take breaks from stressful situations when possible'
    ],
    'headache': [
      'Apply a cold or warm compress to your forehead',
      'Stay hydrated and avoid alcohol',
      'Practice relaxation techniques to reduce tension'
    ],
    'fatigue': [
      'Prioritize 7-8 hours of quality sleep',
      'Consider a B-vitamin supplement (consult your doctor)',
      'Take short power naps if needed'
    ],
    'anxiety': [
      'Practice guided relaxation or meditation',
      'Limit caffeine intake',
      'Talk with a trusted friend or professional'
    ],
    'breast tenderness': [
      'Wear a supportive bra',
      'Apply a warm compress',
      'Reduce salt and caffeine intake'
    ]
  };

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
      const response = await axios.get(`/api/health/pms-symptom/${userId}/`);
      if (Array.isArray(response.data)) {
        setHistory(response.data);
        // Also update localStorage as backup
        localStorage.setItem('pmsSymptomHistory', JSON.stringify(response.data));
        setIsOffline(false);
      }
    } catch (error) {
      console.error('Error fetching PMS symptom history:', error);
      setMessage('Failed to load history from server. Loading from local storage if available.');
      loadFromLocalStorage();
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const localData = localStorage.getItem('pmsSymptomHistory');
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
    
    // Clear validation errors when user starts typing
    setValidationErrors({
      ...validationErrors,
      [name]: ''
    });
    
    if (name === 'date') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      
      // Reset time part for accurate comparison
      selectedDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > currentDate) {
        setValidationErrors({
          ...validationErrors,
          date: 'Future dates are not allowed'
        });
      }
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
      return; // Skip the standard update below since we've handled notes specially
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prevState => {
      const updatedSymptoms = prevState.symptoms.includes(symptom)
        ? prevState.symptoms.filter(s => s !== symptom)
        : [...prevState.symptoms, symptom];
      
      return { ...prevState, symptoms: updatedSymptoms };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent data saving for unauthenticated users
    if (!isAuthenticated) {
      setMessage('Please log in to save your data.');
      return;
    }
    
    // Validate form before submission
    const errors = { ...validationErrors };
    let hasErrors = false;
    
    // Validate date
    const selectedDate = new Date(formData.date);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > currentDate) {
      errors.date = 'Future dates are not allowed';
      hasErrors = true;
    }
    
    if (formData.symptoms.length === 0) {
      setMessage('Please select at least one symptom.');
      return;
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
      localStorage.setItem('pmsSymptomHistory', JSON.stringify(updatedHistory));
      
      if (userId) {
        // Try to save to server if user is logged in
        try {
          const response = await axios.post(`/api/health/pms-symptom/${userId}/`, formData);
          
          if (response.data.success) {
            setMessage('PMS symptom data saved successfully!');
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
        date: new Date().toISOString().slice(0, 10),
        symptoms: [],
        severity: 'medium',
        notes: '',
      });
      setValidationErrors({
        date: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error in submit process:', error);
      setMessage('An error occurred while saving data.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMostCommonSymptoms = () => {
    if (history.length === 0) return [];
    
    // Count occurrences of each symptom
    const symptomCounts = {};
    
    history.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count
    const sortedSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3 symptoms
      .map(([symptom]) => symptom);
    
    return sortedSymptoms;
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

  const renderSymptomTips = () => {
    const commonSymptoms = getMostCommonSymptoms();
    
    if (commonSymptoms.length === 0) {
      return (
        <div className="no-tips">
          <p>Log your symptoms to get personalized management tips.</p>
        </div>
      );
    }
    
    return (
      <div className="symptom-tips">
        <h4>Personalized Management Tips</h4>
        <p>Based on your most common symptoms:</p>
        
        {commonSymptoms.map(symptom => (
          <div key={symptom} className="symptom-tip-group">
            <h5>{symptom.charAt(0).toUpperCase() + symptom.slice(1)}</h5>
            <ul>
              {symptomTips[symptom].map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };
  
  const renderWeeklySymptomSummary = () => {
    if (history.length === 0) return null;
    
    // Group by symptom and by week
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const currentWeekEntries = history.filter(entry => 
      new Date(entry.date) >= oneWeekAgo && new Date(entry.date) <= today
    );
    
    const previousWeekEntries = history.filter(entry => 
      new Date(entry.date) >= twoWeeksAgo && new Date(entry.date) < oneWeekAgo
    );
    
    if (currentWeekEntries.length === 0 && previousWeekEntries.length === 0) {
      return null;
    }
    
    // Count symptoms in each week
    const countSymptomsInPeriod = (entries) => {
      const counts = {};
      entries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
          counts[symptom] = (counts[symptom] || 0) + 1;
        });
      });
      return counts;
    };
    
    const currentWeekCounts = countSymptomsInPeriod(currentWeekEntries);
    const previousWeekCounts = countSymptomsInPeriod(previousWeekEntries);
    
    // Get all unique symptoms
    const allSymptoms = new Set([
      ...Object.keys(currentWeekCounts),
      ...Object.keys(previousWeekCounts)
    ]);
    
    if (allSymptoms.size === 0) return null;
    
    return (
      <div className="weekly-summary">
        <h4>Weekly Symptom Comparison</h4>
        
        <div className="weekly-chart">
          {Array.from(allSymptoms).map(symptom => {
            const currentCount = currentWeekCounts[symptom] || 0;
            const previousCount = previousWeekCounts[symptom] || 0;
            const change = currentCount - previousCount;
            
            return (
              <div key={symptom} className="symptom-comparison">
                <div className="symptom-name">{symptom.charAt(0).toUpperCase() + symptom.slice(1)}</div>
                <div className="comparison-bars">
                  <div className="previous-week">
                    <div className="bar" style={{ width: `${Math.min(100, previousCount * 20)}%` }}></div>
                    <span className="count">{previousCount}</span>
                  </div>
                  <div className="current-week">
                    <div className="bar" style={{ width: `${Math.min(100, currentCount * 20)}%` }}></div>
                    <span className="count">{currentCount}</span>
                  </div>
                </div>
                <div className={`change ${change > 0 ? 'increase' : change < 0 ? 'decrease' : ''}`}>
                  {change !== 0 && (
                    <span>{change > 0 ? '+' : ''}{change} from last week</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="chart-legend">
          <div className="legend-item"><span className="previous-week-color"></span> Previous week</div>
          <div className="legend-item"><span className="current-week-color"></span> Current week</div>
        </div>
      </div>
    );
  };

  const calculateSeverityScore = () => {
    if (history.length === 0) return { score: 0, level: 'none' };
    
    // Only consider entries from the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const recentEntries = history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    if (recentEntries.length === 0) return { score: 0, level: 'none' };
    
    // Calculate average severity
    let totalScore = 0;
    recentEntries.forEach(entry => {
      if (entry.severity === 'mild') totalScore += 1;
      else if (entry.severity === 'medium') totalScore += 2;
      else if (entry.severity === 'severe') totalScore += 3;
    });
    
    const avgScore = totalScore / recentEntries.length;
    
    // Determine level
    let level = 'none';
    if (avgScore < 1.5) level = 'mild';
    else if (avgScore < 2.5) level = 'moderate';
    else level = 'severe';
    
    return { score: avgScore.toFixed(1), level };
  };

  return (
    <div className="pms-symptom-logger">
      <div className="symptom-container">
        <div className="symptom-form">
          <h2>PMS Symptom Logger</h2>
          <p>Track and manage your premenstrual symptoms over time.</p>
          
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
                max={today}
                required
              />
              {validationErrors.date && (
                <div className="validation-error">{validationErrors.date}</div>
              )}
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
              <label>Symptom Severity:</label>
              <div className="severity-options">
                {severityOptions.map(option => (
                  <div key={option.value} className="severity-option">
                    <input
                      type="radio"
                      id={option.value}
                      name="severity"
                      value={option.value}
                      checked={formData.severity === option.value}
                      onChange={handleChange}
                    />
                    <label htmlFor={option.value}>
                      <div className="severity-name">{option.label}</div>
                      <div className="severity-desc">{option.description}</div>
                    </label>
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
                placeholder="Add any additional observations..."
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
              {isLoading ? 'Saving...' : 'Save Symptom Data'}
            </button>
            
            {!isAuthenticated && (
              <div className="login-required-note">
                <small>* Login required to save data</small>
              </div>
            )}
          </form>
        </div>
        
        {isAuthenticated ? (
          <div className="symptom-analysis">
            <h3>Your PMS Pattern</h3>
            
            {history.length > 0 && (
              <div className="severity-summary">
                <h4>Monthly PMS Severity</h4>
                <div className={`severity-meter ${calculateSeverityScore().level}`}>
                  <div className="meter-label">Mild</div>
                  <div className="meter-bar">
                    <div className="meter-fill" style={{ 
                      width: `${Math.min(100, parseFloat(calculateSeverityScore().score) * 33)}%` 
                    }}></div>
                  </div>
                  <div className="meter-label">Severe</div>
                  <div className="meter-score">Score: {calculateSeverityScore().score}/3.0</div>
                </div>
              </div>
            )}
            
            {renderWeeklySymptomSummary()}
            
            {renderSymptomTips()}
            
            <div className="history-list">
              <h4>Recent Logs</h4>
              {history.length === 0 ? (
                <p>No history yet. Start logging your symptoms.</p>
              ) : (
                <div className="history-entries">
                  {history.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="history-entry">
                      <div className="history-date">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="history-details">
                        <div className="symptoms-list">
                          {entry.symptoms.map(symptom => (
                            <span key={symptom} className="symptom-tag">
                              {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                            </span>
                          ))}
                        </div>
                        <div className={`severity-badge ${entry.severity}`}>
                          {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                        </div>
                        {entry.notes && <div className="notes">{entry.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="symptom-analysis">
            <h3>Your PMS Pattern</h3>
            <div className="login-required-message">
              <p>Please log in to view your symptom history and analysis.</p>
              <p>Create an account to track your symptoms, get personalized management tips, and monitor patterns over time.</p>
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

export default PMSSymptomLogger; 