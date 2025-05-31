import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './IntermittentFastingTimer.css';

const IntermittentFastingTimer = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // Reference for timer interval
  const timerRef = useRef(null);

  // State variables
  const [fastingWindow, setFastingWindow] = useState('16:8');
  const [customFastHours, setCustomFastHours] = useState(16);
  const [customEatHours, setCustomEatHours] = useState(8);
  const [isCustom, setIsCustom] = useState(false);
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState({
    mood: 'neutral',
    energy: 'medium',
    hunger: 'medium',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('timer');

  // Pre-defined fasting window options
  const fastingWindowOptions = [
    { label: '16:8 (Popular)', value: '16:8', fastHours: 16, eatHours: 8 },
    { label: '18:6', value: '18:6', fastHours: 18, eatHours: 6 },
    { label: '20:4', value: '20:4', fastHours: 20, eatHours: 4 },
    { label: '14:10 (Beginner)', value: '14:10', fastHours: 14, eatHours: 10 },
    { label: 'OMAD (23:1)', value: '23:1', fastHours: 23, eatHours: 1 },
    { label: 'Custom', value: 'custom' }
  ];

  // Calculate actual fasting hours based on selection
  const getFastingHours = () => {
    if (isCustom) {
      return parseInt(customFastHours, 10);
    }
    const option = fastingWindowOptions.find(opt => opt.value === fastingWindow);
    return option ? option.fastHours : 16;
  };

  // Calculate actual eating hours based on selection
  const getEatingHours = () => {
    if (isCustom) {
      return parseInt(customEatHours, 10);
    }
    const option = fastingWindowOptions.find(opt => opt.value === fastingWindow);
    return option ? option.eatHours : 8;
  };

  // Format time in HH:MM:SS format
  const formatTime = (time) => {
    return [
      time.hours.toString().padStart(2, '0'),
      time.minutes.toString().padStart(2, '0'),
      time.seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Load saved data when component mounts
  useEffect(() => {
    if (user) {
      // Load fasting preferences
      const fastingPrefs = localStorage.getItem(`fastingPrefs_${user.id}`);
      if (fastingPrefs) {
        const prefs = JSON.parse(fastingPrefs);
        if (prefs.isCustom) {
          setIsCustom(true);
          setCustomFastHours(prefs.customFastHours);
          setCustomEatHours(prefs.customEatHours);
        } else {
          setFastingWindow(prefs.fastingWindow);
        }
      }
      
      // Load active fasting session
      const activeSession = localStorage.getItem(`fastingActive_${user.id}`);
      if (activeSession) {
        const session = JSON.parse(activeSession);
        setIsFasting(true);
        setStartTime(session.startTime);
      }
      
      // Load fasting logs
      const savedLogs = localStorage.getItem(`fastingLogs_${user.id}`);
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    }
  }, [user]);

  // Update timer every second
  useEffect(() => {
    if (isFasting && startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        setCurrentTime(now);
        
        // Calculate time elapsed since starting fast
        const startTimeDate = new Date(startTime);
        const elapsedMs = now - startTimeDate;
        
        // Calculate remaining time
        const totalFastingMs = getFastingHours() * 60 * 60 * 1000;
        const remainingMs = totalFastingMs - elapsedMs;
        
        if (remainingMs <= 0) {
          // Fast is complete
          clearInterval(timerRef.current);
          completeSession();
        } else {
          // Update remaining time display
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          
          setRemainingTime({ hours, minutes, seconds });
          
          // Update progress percentage
          const progressPercent = (elapsedMs / totalFastingMs) * 100;
          setProgress(Math.min(progressPercent, 100));
        }
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [isFasting, startTime]);

  // Handle custom hours input with sanitization
  const handleCustomHoursChange = (e, setterFunction) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitizedValue, 10);
    
    // Ensure total is 24 hours and values are within valid ranges
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 23) {
      setterFunction(sanitizedValue);
    }
  };

  // Handle fasting window change
  const handleWindowChange = (e) => {
    const value = e.target.value;
    setFastingWindow(value);
    setIsCustom(value === 'custom');
    
    // Save preferences
    savePreferences(value, value === 'custom');
  };

  // Save user preferences
  const savePreferences = (windowValue, isCustomValue) => {
    if (!user) return;
    
    const prefs = {
      fastingWindow: windowValue,
      isCustom: isCustomValue,
      customFastHours,
      customEatHours
    };
    
    localStorage.setItem(`fastingPrefs_${user.id}`, JSON.stringify(prefs));
  };

  // Start fasting session
  const startFasting = () => {
    const now = new Date();
    setIsFasting(true);
    setStartTime(now.toISOString());
    
    // Save active session to localStorage
    if (user) {
      const session = {
        startTime: now.toISOString(),
        fastingHours: getFastingHours(),
        eatingHours: getEatingHours()
      };
      localStorage.setItem(`fastingActive_${user.id}`, JSON.stringify(session));
    }
  };

  // End fasting session early
  const endFasting = () => {
    clearInterval(timerRef.current);
    setIsFasting(false);
    
    // Add to logs if user confirms
    const shouldLog = window.confirm('Would you like to log this fasting session?');
    
    if (shouldLog) {
      openLogForm();
    } else {
      resetFastingState();
    }
    
    // Remove active session from localStorage
    if (user) {
      localStorage.removeItem(`fastingActive_${user.id}`);
    }
  };

  // Complete fasting session (when timer ends)
  const completeSession = () => {
    setIsFasting(false);
    setProgress(100);
    
    // Ask user to log the session
    openLogForm();
    
    // Remove active session from localStorage
    if (user) {
      localStorage.removeItem(`fastingActive_${user.id}`);
    }
    
    setMessage('Fast completed! Great job!');
    setTimeout(() => setMessage(''), 5000);
  };

  // Reset fasting state without logging
  const resetFastingState = () => {
    setIsFasting(false);
    setStartTime(null);
    setProgress(0);
    setRemainingTime({ hours: 0, minutes: 0, seconds: 0 });
  };

  // Open log form after fasting
  const openLogForm = () => {
    setActiveTab('logs');
  };

  // Handle log form input changes
  const handleLogChange = (field, value) => {
    setCurrentLog(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save log
  const saveLog = () => {
    if (!startTime) return;
    
    // Calculate fasting duration
    const startTimeDate = new Date(startTime);
    const endTime = new Date();
    const durationMs = endTime - startTimeDate;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Create log entry
    const newLog = {
      id: Date.now(),
      startTime,
      endTime: endTime.toISOString(),
      duration: durationHours.toFixed(1),
      plannedDuration: getFastingHours(),
      completed: durationHours >= getFastingHours(),
      ...currentLog,
      date: new Date().toISOString()
    };
    
    // Add to logs
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    
    // Save to localStorage
    if (user) {
      localStorage.setItem(`fastingLogs_${user.id}`, JSON.stringify(updatedLogs));
    }
    
    // Reset state
    resetFastingState();
    setCurrentLog({
      mood: 'neutral',
      energy: 'medium',
      hunger: 'medium',
      notes: ''
    });
    
    setMessage('Fast logged successfully!');
    setTimeout(() => setMessage(''), 3000);
    
    // Go back to timer
    setActiveTab('timer');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate eating window start and end times
  const getEatingWindowTimes = () => {
    if (!startTime) return { start: '--:--', end: '--:--' };
    
    const startTimeDate = new Date(startTime);
    const fastingEndTime = new Date(startTimeDate.getTime() + getFastingHours() * 60 * 60 * 1000);
    const eatingEndTime = new Date(fastingEndTime.getTime() + getEatingHours() * 60 * 60 * 1000);
    
    const formatTimeOnly = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return {
      start: formatTimeOnly(fastingEndTime),
      end: formatTimeOnly(eatingEndTime)
    };
  };

  return (
    <div className="intermittent-fasting-timer">
      <h2>Intermittent Fasting Timer</h2>
      <p className="tool-description">
        Track your fasting and eating windows with this timer. Set your preferred fasting schedule, 
        log your experiences, and maintain a healthy intermittent fasting routine.
      </p>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'timer' ? 'tab-active' : ''}
          onClick={() => setActiveTab('timer')}
        >
          Timer
        </button>
        <button 
          className={activeTab === 'logs' ? 'tab-active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
        <button 
          className={activeTab === 'guide' ? 'tab-active' : ''}
          onClick={() => setActiveTab('guide')}
        >
          Guide
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'timer' && (
          <div className="timer-tab">
            <div className="fasting-options">
              <h3>Fasting Window</h3>
              <div className="input-group">
                <label htmlFor="fasting-window">Select Fasting Schedule:</label>
                <select 
                  id="fasting-window" 
                  value={fastingWindow}
                  onChange={handleWindowChange}
                  disabled={isFasting}
                >
                  {fastingWindowOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {isCustom && (
                <div className="custom-hours">
                  <div className="input-group">
                    <label htmlFor="custom-fast-hours">Fast Hours:</label>
                    <input 
                      type="text" 
                      id="custom-fast-hours" 
                      value={customFastHours}
                      onChange={(e) => handleCustomHoursChange(e, setCustomFastHours)}
                      disabled={isFasting}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="custom-eat-hours">Eat Hours:</label>
                    <input 
                      type="text" 
                      id="custom-eat-hours" 
                      value={customEatHours}
                      onChange={(e) => handleCustomHoursChange(e, setCustomEatHours)}
                      disabled={isFasting}
                    />
                  </div>
                  <button 
                    className="save-custom-button" 
                    onClick={() => savePreferences(fastingWindow, isCustom)}
                    disabled={isFasting}
                  >
                    Save Custom Schedule
                  </button>
                </div>
              )}
              
              <div className="schedule-summary">
                <p>You'll fast for <span className="hours-highlight">{getFastingHours()} hours</span> and 
                   eat for <span className="hours-highlight">{getEatingHours()} hours</span></p>
              </div>
            </div>
            
            <div className="timer-display">
              {isFasting ? (
                <>
                  <h3>Current Fast</h3>
                  <div className="progress-container">
                    <div className="progress-circle">
                      <div className="progress-bar" style={{ transform: `rotate(${progress * 3.6}deg)` }}></div>
                      <div className="progress-center">
                        <div className="remaining-time">{formatTime(remainingTime)}</div>
                        <div className="progress-percent">{Math.floor(progress)}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="fast-details">
                    <p>Fast started: <strong>{formatDate(startTime)}</strong></p>
                    <p>Eating window: <strong>{getEatingWindowTimes().start} - {getEatingWindowTimes().end}</strong></p>
                  </div>
                  
                  <div className="button-container">
                    <button className="end-fast-button" onClick={endFasting}>
                      End Fast Early
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Start a New Fast</h3>
                  <div className="timer-ready">
                    <div className="ready-circle">
                      <span className="ready-text">Ready</span>
                    </div>
                  </div>
                  
                  <div className="button-container">
                    <button className="start-fast-button" onClick={startFasting}>
                      Start Fasting Now
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {message && <p className="message">{message}</p>}
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="logs-tab">
            {startTime && !isFasting ? (
              <div className="log-form">
                <h3>Log Your Fasting Experience</h3>
                
                <div className="log-group">
                  <label>How did you feel during your fast?</label>
                  <div className="mood-buttons">
                    <button 
                      className={`mood-button ${currentLog.mood === 'bad' ? 'active' : ''}`}
                      onClick={() => handleLogChange('mood', 'bad')}
                    >
                      😞 Difficult
                    </button>
                    <button 
                      className={`mood-button ${currentLog.mood === 'neutral' ? 'active' : ''}`}
                      onClick={() => handleLogChange('mood', 'neutral')}
                    >
                      😐 Neutral
                    </button>
                    <button 
                      className={`mood-button ${currentLog.mood === 'good' ? 'active' : ''}`}
                      onClick={() => handleLogChange('mood', 'good')}
                    >
                      😊 Great
                    </button>
                  </div>
                </div>
                
                <div className="log-group">
                  <label>Energy level:</label>
                  <div className="rating-buttons">
                    <button 
                      className={`rating-button ${currentLog.energy === 'low' ? 'active' : ''}`}
                      onClick={() => handleLogChange('energy', 'low')}
                    >
                      Low
                    </button>
                    <button 
                      className={`rating-button ${currentLog.energy === 'medium' ? 'active' : ''}`}
                      onClick={() => handleLogChange('energy', 'medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`rating-button ${currentLog.energy === 'high' ? 'active' : ''}`}
                      onClick={() => handleLogChange('energy', 'high')}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                <div className="log-group">
                  <label>Hunger level:</label>
                  <div className="rating-buttons">
                    <button 
                      className={`rating-button ${currentLog.hunger === 'low' ? 'active' : ''}`}
                      onClick={() => handleLogChange('hunger', 'low')}
                    >
                      Low
                    </button>
                    <button 
                      className={`rating-button ${currentLog.hunger === 'medium' ? 'active' : ''}`}
                      onClick={() => handleLogChange('hunger', 'medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`rating-button ${currentLog.hunger === 'high' ? 'active' : ''}`}
                      onClick={() => handleLogChange('hunger', 'high')}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                <div className="log-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea 
                    id="notes"
                    value={currentLog.notes}
                    onChange={(e) => handleLogChange('notes', e.target.value.replace(/[<>]/g, ''))}
                    placeholder="How did your fast go? Any challenges or observations?"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="button-container">
                  <button 
                    className="save-log-button" 
                    onClick={saveLog}
                    disabled={!user}
                  >
                    {user ? 'Save Log' : 'Login to Save Log'}
                  </button>
                </div>
                
                {!user && (
                  <p className="login-message">Please log in to save your fasting logs</p>
                )}
              </div>
            ) : (
              <>
                <h3>Fasting History</h3>
                {logs.length === 0 ? (
                  <p className="no-logs">No fasting sessions have been logged yet.</p>
                ) : (
                  <div className="logs-list">
                    {logs.map(log => (
                      <div key={log.id} className="log-card">
                        <div className="log-header">
                          <span className="log-date">{formatDate(log.date)}</span>
                          <span className={`log-status ${log.completed ? 'completed' : 'incomplete'}`}>
                            {log.completed ? 'Completed' : 'Partial'}
                          </span>
                        </div>
                        
                        <div className="log-details">
                          <div className="log-detail">
                            <strong>Duration:</strong> {log.duration} hrs / {log.plannedDuration} hrs
                          </div>
                          <div className="log-detail">
                            <strong>Mood:</strong> {
                              log.mood === 'good' ? '😊 Great' : 
                              log.mood === 'neutral' ? '😐 Neutral' : '😞 Difficult'
                            }
                          </div>
                          <div className="log-detail">
                            <strong>Energy:</strong> {log.energy.charAt(0).toUpperCase() + log.energy.slice(1)}
                          </div>
                          <div className="log-detail">
                            <strong>Hunger:</strong> {log.hunger.charAt(0).toUpperCase() + log.hunger.slice(1)}
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="log-notes">
                            <strong>Notes:</strong> {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'guide' && (
          <div className="guide-tab">
            <h3>Intermittent Fasting Guide</h3>
            
            <div className="guide-section">
              <h4>What is Intermittent Fasting?</h4>
              <p>
                Intermittent fasting is an eating pattern that cycles between periods of fasting and eating.
                It doesn't specify which foods to eat, but rather when you should eat them.
              </p>
            </div>
            
            <div className="guide-section">
              <h4>Common Fasting Methods</h4>
              <ul className="guide-list">
                <li>
                  <strong>16:8 Method:</strong> Fast for 16 hours and restrict your eating to an 8-hour window, such as 12-8 PM.
                  This is the most popular and beginner-friendly approach.
                </li>
                <li>
                  <strong>18:6 Method:</strong> Fast for 18 hours with a 6-hour eating window.
                </li>
                <li>
                  <strong>20:4 Method:</strong> Also known as the "Warrior Diet" - involves fasting for 20 hours and eating during a 4-hour window.
                </li>
                <li>
                  <strong>14:10 Method:</strong> A milder approach with a 14-hour fast and 10-hour eating window. Great for beginners.
                </li>
                <li>
                  <strong>OMAD (One Meal a Day):</strong> Eating all your daily calories in just one meal, fasting for 23 hours.
                </li>
              </ul>
            </div>
            
            <div className="guide-section">
              <h4>Benefits of Intermittent Fasting</h4>
              <ul className="guide-list">
                <li>May help with weight loss and fat burning</li>
                <li>Can improve metabolic health and insulin sensitivity</li>
                <li>May reduce inflammation in the body</li>
                <li>Potential benefits for heart health</li>
                <li>May improve cellular repair processes (autophagy)</li>
                <li>Possible benefits for brain health</li>
              </ul>
            </div>
            
            <div className="guide-section">
              <h4>Tips for Success</h4>
              <ul className="guide-list">
                <li>Stay hydrated during fasting periods (water, black coffee, and unsweetened tea are usually allowed)</li>
                <li>Start with a more gentle fasting window (like 14:10) if you're new to fasting</li>
                <li>Ease into your chosen fasting schedule gradually</li>
                <li>Focus on nutrient-dense, whole foods during your eating window</li>
                <li>Pay attention to how your body responds and adjust as needed</li>
                <li>Be consistent but flexible - occasional adjustments are fine</li>
              </ul>
            </div>
            
            <div className="guide-section caution">
              <h4>⚠️ Important Note</h4>
              <p>
                Intermittent fasting is not recommended for everyone. Consult with a healthcare professional
                before starting, especially if you are pregnant, breastfeeding, under 18, have a history of
                disordered eating, or have certain medical conditions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntermittentFastingTimer; 