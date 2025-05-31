import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import './HeartRateGuide.css';

const HeartRateGuide = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  
  const [heartRate, setHeartRate] = useState('');
  const [rateStatus, setRateStatus] = useState(null); // 'low', 'normal', 'high', null
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch heart rate history when the tab is changed or user logs in
  useEffect(() => {
    if (showHistory && user) {
      fetchHeartRateHistory();
    }
  }, [showHistory, user]);
  
  // Calculate status based on heart rate
  const calculateStatus = (rate) => {
    const bpm = parseInt(rate);
    if (isNaN(bpm)) return null;
    
    if (bpm < 60) return 'low';
    if (bpm > 100) return 'high';
    return 'normal';
  };
  
  const handleHeartRateChange = (e) => {
    // Only allow digits, filter out any other characters
    const value = e.target.value.replace(/[^0-9]/g, '');
    setHeartRate(value);
    setRateStatus(calculateStatus(value));
  };
  
  // Handle notes input to allow only letters and spaces
  const handleNotesChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setNotes(value);
  };
  
  const fetchHeartRateHistory = async () => {
    // Only fetch if user is logged in
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await healthService.getHeartRateHistory(user.id);
      console.log('Heart rate history response:', result);
      
      // The response is now an array of records directly
      if (Array.isArray(result)) {
        console.log('First record example:', result[0]);
        setHistory(result);
      } else {
        console.error('Unexpected history format:', result);
        setError('Failed to load heart rate history');
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching heart rate history:', err);
      setError('Failed to load heart rate history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!heartRate || isNaN(parseInt(heartRate))) {
      alert('Please enter a valid heart rate');
      return;
    }
    
    // Only save if user is logged in
    if (!user) {
      alert('Please sign in to save your heart rate data');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = {
        value: heartRate,
        category: rateStatus,
        notes: notes
      };
      
      console.log('Saving heart rate:', { 
        ...data,
        userId: user?.id 
      });
      
      const result = await healthService.saveHeartRate(user.id, data);
      
      if (result.success) {
        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Reset form
        setHeartRate('');
        setNotes('');
        setRateStatus(null);
      } else {
        alert('Failed to save heart rate data');
      }
    } catch (err) {
      console.error('Error saving heart rate:', err);
      alert('Error saving heart rate data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="heart-rate-guide">
      <div className="heart-rate-header">
        <h2>Heart Rate Guide & Logger</h2>
        <div className="heart-rate-tabs">
          <button 
            className={!showHistory ? 'active' : ''} 
            onClick={() => setShowHistory(false)}
          >
            Guide & Log
          </button>
          <button 
            className={showHistory ? 'active' : ''} 
            onClick={() => setShowHistory(true)}
            disabled={!user}
          >
            History
          </button>
        </div>
      </div>
      
      {!showHistory ? (
        <div className="heart-rate-content">
          <div className="instruction-container">
            <h3>How to Check Your Pulse</h3>
            <div className="instruction-steps">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Find Your Pulse</h4>
                  <p style={{ color: 'white' }}>Place your index and middle fingers on your wrist (below your thumb) or on your neck (to the side of your windpipe).</p>
                </div>
              </div>
              
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Count the Beats</h4>
                  <p style={{ color: 'white' }}>Count the beats for 30 seconds and multiply by 2, or count for 15 seconds and multiply by 4.</p>
                </div>
              </div>
              
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Record Your Result</h4>
                  <p style={{ color: 'white' }}>Enter your heart rate in the form below. Normal resting heart rate is typically between 60-100 BPM.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="logger-container">
            <h3>Log Your Heart Rate</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="heartRate">Heart Rate (BPM)</label>
                <input
                  type="text"
                  id="heartRate"
                  value={heartRate}
                  onChange={handleHeartRateChange}
                  placeholder="Enter BPM"
                  className={rateStatus ? `status-${rateStatus}` : ''}
                  min="30"
                  max="220"
                  disabled={loading}
                />
                {rateStatus && (
                  <div className={`status-message status-${rateStatus}`}>
                    {rateStatus === 'low' && 'Below normal range (<60 BPM)'}
                    {rateStatus === 'normal' && 'Within normal range (60-100 BPM)'}
                    {rateStatus === 'high' && 'Above normal range (>100 BPM)'}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (letters only)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="e.g., Resting, After exercise, etc."
                  disabled={loading}
                  style={{color: '#000000', border: '3px solid #1a237e'}}
                />
              </div>
              
              <button 
                type="submit" 
                className="save-button"
                disabled={!user || loading}
              >
                {loading ? 'Saving...' : 'Save Heart Rate'}
              </button>
              
              {!user && (
                <div className="login-required">
                  <p>Please sign in to save your heart rate data</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className="success-message">
                  Heart rate saved successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="history-container">
          <h3>Heart Rate History</h3>
          
          {loading && (
            <div className="loading-message">Loading your heart rate history...</div>
          )}
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {!loading && !error && history.length > 0 ? (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Heart Rate</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(entry => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.recorded_at).toLocaleString()}</td>
                      <td>{entry.rate} BPM</td>
                      <td className={`status-${entry.status}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </td>
                      <td>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading && !error ? (
            <p className="no-data">No heart rate data available. Start logging your heart rate to build history.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HeartRateGuide; 