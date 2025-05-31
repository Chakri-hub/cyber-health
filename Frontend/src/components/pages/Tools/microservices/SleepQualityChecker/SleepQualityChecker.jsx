import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './SleepQualityChecker.css';

const SleepQualityChecker = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('tracker');
    const [hoursSlept, setHoursSlept] = useState('');
    const [wakeUpTime, setWakeUpTime] = useState('');
    const [restfulness, setRestfulness] = useState(3);
    const [disturbances, setDisturbances] = useState([]);
    const [screenTime, setScreenTime] = useState('');
    const [notes, setNotes] = useState('');
    const [sleepScore, setSleepScore] = useState(null);
    const [sleepTips, setSleepTips] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Disturbance options
    const disturbanceOptions = [
        { id: 1, label: 'Noise' },
        { id: 2, label: 'Light' },
        { id: 3, label: 'Temperature' },
        { id: 4, label: 'Discomfort' },
        { id: 5, label: 'Stress/Anxiety' },
        { id: 6, label: 'Bathroom Visits' },
        { id: 7, label: 'Pain' },
        { id: 8, label: 'Partner Disturbance' }
    ];

    // Screen time options
    const screenTimeOptions = [
        { value: 'none', label: 'No screen time before sleep' },
        { value: '0-30', label: '0-30 minutes' },
        { value: '30-60', label: '30-60 minutes' },
        { value: '60-120', label: '1-2 hours' },
        { value: '120+', label: 'More than 2 hours' }
    ];

    useEffect(() => {
        if (activeTab === 'history' && user) {
            fetchSleepHistory();
        }
    }, [activeTab, user]);

    const fetchSleepHistory = async () => {
        try {
            setLoading(true);
            console.log(`Fetching sleep history for user ${user.id}...`);
            
            // Add retry logic for network issues
            let retries = 2;
            let response;
            
            while (retries >= 0) {
                try {
                    response = await healthService.getSleepQualityHistory(user.id);
                    break; // Success, exit the retry loop
                } catch (err) {
                    if (retries === 0) throw err; // Last attempt failed
                    console.log(`Retry attempt ${2-retries+1} for fetching sleep history...`);
                    retries--;
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log('Sleep history response:', response);
            
            if (response.success && response.records) {
                setHistory(response.records);
            } else if (response.records) {
                setHistory(response.records);
            } else if (Array.isArray(response)) {
                setHistory(response);
            } else {
                console.error('Unexpected response format:', response);
                setError('Failed to parse sleep history. Check console for details.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching sleep history:', err);
            setError('Failed to load sleep history. Please try again.');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleHoursSleptChange = (e) => {
        // Only allow numbers and a single decimal point
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) && value <= 24) {
            setHoursSlept(value);
        }
    };

    const handleDisturbanceToggle = (disturbanceId) => {
        if (disturbances.includes(disturbanceId)) {
            setDisturbances(disturbances.filter(id => id !== disturbanceId));
        } else {
            setDisturbances([...disturbances, disturbanceId]);
        }
    };

    const handleNotesChange = (e) => {
        // Sanitize input - allow only letters, spaces, and basic punctuation
        const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s.,!?;:()'-]/g, '');
        setNotes(sanitizedValue);
    };

    const calculateSleepScore = () => {
        // Base score based on hours slept (0-40 points)
        let score = 0;
        
        // Ideal sleep is 7-9 hours
        const hours = parseFloat(hoursSlept);
        if (hours >= 7 && hours <= 9) {
            score += 40;
        } else if (hours >= 6 && hours < 7) {
            score += 30;
        } else if (hours > 9 && hours <= 10) {
            score += 30;
        } else if (hours >= 5 && hours < 6) {
            score += 20;
        } else if (hours > 10 && hours <= 12) {
            score += 20;
        } else {
            score += 10; // < 5 hours or > 12 hours
        }
        
        // Restfulness rating (0-30 points)
        score += (restfulness - 1) * 7.5; // 1-5 scale converted to 0-30 points
        
        // Deduct for disturbances (0-20 points deduction)
        const disturbanceDeduction = Math.min(disturbances.length * 3, 20);
        score -= disturbanceDeduction;
        
        // Deduct for screen time (0-10 points deduction)
        switch (screenTime) {
            case 'none':
                break; // No deduction
            case '0-30':
                score -= 2;
                break;
            case '30-60':
                score -= 4;
                break;
            case '60-120':
                score -= 7;
                break;
            case '120+':
                score -= 10;
                break;
            default:
                break;
        }
        
        // Ensure score is between 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        return score;
    };

    const generateSleepTips = (score) => {
        // Generate sleep tips based on score and inputs
        const tips = [];
        
        if (score < 50) {
            tips.push("Your sleep quality needs significant improvement.");
            tips.push("Consider consulting a healthcare professional.");
        }
        
        // Tips based on hours slept
        const hours = parseFloat(hoursSlept);
        if (hours < 7) {
            tips.push("Try to get at least 7 hours of sleep for optimal health.");
        } else if (hours > 9) {
            tips.push("Sleeping more than 9 hours regularly might indicate other health issues.");
        }
        
        // Tips based on restfulness
        if (restfulness < 3) {
            tips.push("Your low restfulness suggests your sleep quality could be improved.");
        }
        
        // Tips based on disturbances
        if (disturbances.includes(1)) { // Noise
            tips.push("Use earplugs or a white noise machine to minimize noise disturbances.");
        }
        if (disturbances.includes(2)) { // Light
            tips.push("Try using blackout curtains or a sleep mask to block out light.");
        }
        if (disturbances.includes(3)) { // Temperature
            tips.push("Keep your bedroom between 60-67°F (15-19°C) for optimal sleep.");
        }
        if (disturbances.includes(5)) { // Stress/Anxiety
            tips.push("Practice relaxation techniques like deep breathing before bed.");
        }
        
        // Tips based on screen time
        if (screenTime === '60-120' || screenTime === '120+') {
            tips.push("Reduce screen time at least 1 hour before bed to improve sleep quality.");
            tips.push("Try reading a book or practicing gentle stretches instead.");
        }
        
        // General good sleep hygiene tips
        if (tips.length < 3) {
            tips.push("Maintain a consistent sleep schedule, even on weekends.");
            tips.push("Create a relaxing bedtime routine to signal to your body it's time to sleep.");
        }
        
        return tips;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setError('');
        setSuccess('');
        
        // Validate required fields
        if (!hoursSlept) {
            setError('Please enter hours slept');
            return;
        }
        
        if (!wakeUpTime) {
            setError('Please enter wake-up time');
            return;
        }
        
        if (!user) {
            setError('Please sign in to save your sleep data');
            return;
        }
        
        try {
            setLoading(true);
            
            // Calculate sleep score
            const score = calculateSleepScore();
            setSleepScore(score);
            
            // Generate sleep tips
            const tips = generateSleepTips(score);
            setSleepTips(tips);
            
            // Prepare the data
            const now = new Date();
            const sleepData = {
                hoursSlept: parseFloat(hoursSlept),
                wakeUpTime: wakeUpTime,
                restfulness: restfulness,
                disturbances: disturbances.map(id => {
                    const disturbance = disturbanceOptions.find(d => d.id === id);
                    return disturbance ? disturbance.label : '';
                }),
                screenTime: screenTime,
                sleepScore: score,
                date: format(now, 'yyyy-MM-dd'),
                timestamp: now.toISOString(),
                notes: notes
            };
            
            console.log('Saving sleep data:', sleepData);
            
            // Add retry logic for network issues
            let retries = 2;
            let response;
            
            while (retries >= 0) {
                try {
                    response = await healthService.saveSleepQuality(user.id, sleepData);
                    break; // Success, exit the retry loop
                } catch (err) {
                    if (retries === 0) throw err; // Last attempt failed
                    console.log(`Retry attempt ${2-retries+1} for saving sleep data...`);
                    retries--;
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log('Save sleep response:', response);
            
            setSuccess('Sleep data recorded successfully!');
            
            // Refresh history if we're in history tab
            if (activeTab === 'history') {
                await fetchSleepHistory();
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving sleep data:', err);
            setError(`Failed to save sleep data: ${err.message || 'Network or server error'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setHoursSlept('');
        setWakeUpTime('');
        setRestfulness(3);
        setDisturbances([]);
        setScreenTime('');
        setNotes('');
        setSleepScore(null);
        setSleepTips([]);
    };

    return (
        <div className="sleep-quality-checker">
            <div className="sleep-header">
                <h1>Sleep Quality Checker</h1>
                <p>Track your sleep quality and get personalized tips for better rest</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can see the tracker interface but cannot save readings or view history.
                    </div>
                )}
            </div>

            <div className="tabs">
                <button 
                    className={activeTab === 'tracker' ? 'active' : ''} 
                    onClick={() => setActiveTab('tracker')}
                >
                    Track Sleep
                </button>
                <button 
                    className={`${activeTab === 'history' ? 'active' : ''} ${!user ? 'disabled-tab' : ''}`}
                    onClick={() => user ? setActiveTab('history') : setError('Please log in to view your sleep history')}
                >
                    View History
                </button>
            </div>

            {activeTab === 'tracker' && (
                <div className="tracker-section">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="hoursSlept">Hours Slept *</label>
                            <input 
                                type="text"
                                id="hoursSlept"
                                value={hoursSlept}
                                onChange={handleHoursSleptChange}
                                placeholder="Enter hours (e.g. 7.5)"
                                required
                            />
                            <small>Enter a value between 0 and 24</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="wakeUpTime">Wake-Up Time *</label>
                            <input 
                                type="time"
                                id="wakeUpTime"
                                value={wakeUpTime}
                                onChange={(e) => setWakeUpTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>How Restful Was Your Sleep? *</label>
                            <div className="rating-container">
                                <div className="rating-labels">
                                    <span>Not Restful</span>
                                    <span>Very Restful</span>
                                </div>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <label key={value} className="rating-option">
                                            <input
                                                type="radio"
                                                name="restfulness"
                                                value={value}
                                                checked={restfulness === value}
                                                onChange={() => setRestfulness(value)}
                                            />
                                            <span className="rating-value">{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group optional-section">
                            <label>Any Sleep Disturbances? (Optional)</label>
                            <div className="disturbance-options">
                                {disturbanceOptions.map((disturbance) => (
                                    <div 
                                        key={disturbance.id} 
                                        className={`disturbance-option ${disturbances.includes(disturbance.id) ? 'selected' : ''}`}
                                        onClick={() => handleDisturbanceToggle(disturbance.id)}
                                    >
                                        {disturbance.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group optional-section">
                            <label htmlFor="screenTime">Screen Time Before Bed (Optional)</label>
                            <select 
                                id="screenTime"
                                value={screenTime}
                                onChange={(e) => setScreenTime(e.target.value)}
                            >
                                <option value="">Select an option</option>
                                {screenTimeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group optional-section">
                            <label htmlFor="notes">Notes (Optional)</label>
                            <textarea 
                                id="notes"
                                value={notes}
                                onChange={handleNotesChange}
                                placeholder="Add any notes about your sleep..."
                                maxLength={200}
                            />
                            <div className="char-count">{notes.length}/200</div>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Calculate Sleep Score'}
                            </button>
                            <button 
                                type="button" 
                                className="secondary-button"
                                onClick={resetForm}
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    {sleepScore !== null && (
                        <div className="results-section">
                            <h2>Your Sleep Score</h2>
                            <div className={`sleep-score ${
                                sleepScore >= 80 ? 'excellent' : 
                                sleepScore >= 60 ? 'good' : 
                                sleepScore >= 40 ? 'fair' : 'poor'
                            }`}>
                                {sleepScore}
                            </div>
                            <div className="score-label">
                                {sleepScore >= 80 ? 'Excellent' : 
                                 sleepScore >= 60 ? 'Good' : 
                                 sleepScore >= 40 ? 'Fair' : 'Poor'}
                            </div>

                            <div className="sleep-tips">
                                <h3>Recommendations for Better Sleep</h3>
                                <ul>
                                    {sleepTips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="history-section">
                    {!user ? (
                        <div className="auth-required">
                            <h3>Authentication Required</h3>
                            <p>Please log in to view your sleep history.</p>
                        </div>
                    ) : loading ? (
                        <div className="loading">Loading your sleep history...</div>
                    ) : (
                        <>
                            <h2>Your Sleep History</h2>
                            {history.length === 0 ? (
                                <div className="no-data">No sleep records found. Start tracking your sleep quality to build your history.</div>
                            ) : (
                                <div className="history-list">
                                    {[...history]
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                        .map((entry, index) => (
                                            <div key={index} className="history-item">
                                                <div className="history-date">
                                                    {format(new Date(entry.timestamp), 'MMMM dd, yyyy')}
                                                </div>
                                                <div className="history-details">
                                                    <div className="detail-group">
                                                        <span className="detail-label">Hours Slept:</span>
                                                        <span className="detail-value">{entry.hours_slept}</span>
                                                    </div>
                                                    <div className="detail-group">
                                                        <span className="detail-label">Wake-up Time:</span>
                                                        <span className="detail-value">{entry.wake_up_time}</span>
                                                    </div>
                                                    <div className="detail-group">
                                                        <span className="detail-label">Restfulness:</span>
                                                        <span className="detail-value">{entry.restfulness}/5</span>
                                                    </div>
                                                    <div className="detail-group">
                                                        <span className="detail-label">Sleep Score:</span>
                                                        <span className={`detail-value sleep-score-value ${
                                                            entry.sleep_score >= 80 ? 'excellent' : 
                                                            entry.sleep_score >= 60 ? 'good' : 
                                                            entry.sleep_score >= 40 ? 'fair' : 'poor'
                                                        }`}>
                                                            {entry.sleep_score}
                                                        </span>
                                                    </div>
                                                </div>
                                                {entry.disturbances && entry.disturbances.length > 0 && (
                                                    <div className="history-disturbances">
                                                        <span className="detail-label">Disturbances:</span>
                                                        <div className="disturbance-tags">
                                                            {entry.disturbances.map((disturbance, i) => (
                                                                <span key={i} className="disturbance-tag">{disturbance}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {entry.notes && (
                                                    <div className="history-notes">
                                                        <span className="detail-label">Notes:</span>
                                                        <p>{entry.notes}</p>
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
        </div>
    );
};

export default SleepQualityChecker; 