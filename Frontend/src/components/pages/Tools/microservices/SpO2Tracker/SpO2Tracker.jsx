import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { healthService } from '../../../../../services/healthService';
import './SpO2Tracker.css';

// Utility function for safe date formatting
const safeFormatDate = (date, formatString) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

function SpO2Tracker() {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [pulse, setPulse] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('instructions');

  // Function to get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    setDate(format(now, 'yyyy-MM-dd'));
    setTime(format(now, 'HH:mm'));
  };

  // Force current date/time on form submission and when tab changes
  useEffect(() => {
    if (activeTab === 'logger') {
      getCurrentDateTime();
      if (user) {
        fetchSpO2History();
      }
    }
  }, [activeTab, user]);

  // Prevent date changes - force current date only
  const handleDateChange = (e) => {
    // Ignore user date changes and keep current date
    getCurrentDateTime();
  };

  // Prevent time changes - force current time only
  const handleTimeChange = (e) => {
    // Ignore user time changes and keep current time
    getCurrentDateTime();
  };

  // Input validation handlers
  const handleOxygenLevelChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    // Keep oxygen level between 0-100
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setOxygenLevel(value);
    }
  };

  const handlePulseChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPulse(value);
  };

  const handleNotesChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setNotes(value);
  };

  const fetchSpO2History = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await healthService.getSpO2History(user.id);
      setHistory(data);
    } catch (err) {
      console.error('Error fetching SpO2 history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!oxygenLevel) {
      setError('Oxygen saturation level is required');
      return;
    }
    
    const oxygenNum = parseInt(oxygenLevel);
    const pulseNum = parseInt(pulse);
    
    if (isNaN(oxygenNum) || oxygenNum < 70 || oxygenNum > 100) {
      setError('Oxygen saturation must be between 70 and 100%');
      return;
    }
    
    if (pulse && (isNaN(pulseNum) || pulseNum < 30 || pulseNum > 220)) {
      setError('Pulse must be between 30 and 220 bpm');
      return;
    }

    // Validate notes field to only contain letters and spaces
    if (notes && !/^[a-zA-Z\s]+$/.test(notes)) {
      setError('Notes can only contain letters and spaces');
      return;
    }

    if (!user) {
      setError('Please sign in to save your SpO2 data');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update to current date and time before submitting
      getCurrentDateTime();
      
      const category = interpretSpO2(oxygenNum);
      
      await healthService.saveSpO2(user.id, {
        oxygen_level: oxygenNum,
        pulse: pulseNum || null,
        category,
        date,
        time,
        notes
      });
      
      setSuccess('SpO2 reading saved successfully');
      
      // Reset form
      setOxygenLevel('');
      setPulse('');
      // Keep current date/time
      getCurrentDateTime();
      setNotes('');
      
      // Refresh history
      fetchSpO2History();
      
    } catch (err) {
      console.error('Error saving SpO2:', err);
      setError('Failed to save SpO2 reading');
    } finally {
      setLoading(false);
    }
  };

  const interpretSpO2 = (oxygenLevel) => {
    if (oxygenLevel >= 95) return 'Normal';
    if (oxygenLevel >= 90) return 'Mild Hypoxemia';
    if (oxygenLevel >= 85) return 'Moderate Hypoxemia';
    return 'Severe Hypoxemia';
  };

  return (
    <div className="spo2-tracker-container">
      <h2 className="spo2-title">SpO2 Tracker</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'instructions' ? 'active' : ''} 
          onClick={() => setActiveTab('instructions')}
        >
          Instructions
        </button>
        <button 
          className={activeTab === 'logger' ? 'active' : ''} 
          onClick={() => setActiveTab('logger')}
        >
          Log SpO2
        </button>
      </div>
      
      {activeTab === 'instructions' && (
        <div className="instructions-container">
          <h3>How to Measure Oxygen Saturation (SpO2)</h3>
          
          <h4>What is SpO2?</h4>
          <p>
            SpO2 (peripheral oxygen saturation) is a measure of the oxygen level in your blood. It represents the percentage of hemoglobin binding sites in your bloodstream occupied by oxygen.
          </p>
          
          <h4>Using a Pulse Oximeter</h4>
          <ol>
            <li>Sit in a comfortable position and rest for 5 minutes before measuring.</li>
            <li>Make sure your hands are warm - cold hands may affect readings.</li>
            <li>Remove any nail polish or artificial nails from the finger you'll use for measurement.</li>
            <li>Place the pulse oximeter on your finger (usually index finger or middle finger).</li>
            <li>Keep your hand still and wait for the reading to stabilize (usually 5-10 seconds).</li>
            <li>Note the SpO2 percentage and pulse rate displayed.</li>
            <li>Record your reading along with the date and time.</li>
          </ol>
          
          <h4>Understanding Your Readings</h4>
          <p>
            <strong>Normal:</strong> 95-100%<br />
            <strong>Mild Hypoxemia:</strong> 90-94%<br />
            <strong>Moderate Hypoxemia:</strong> 85-89%<br />
            <strong>Severe Hypoxemia:</strong> Below 85%
          </p>
          
          <p className="note">
            <strong>Note:</strong> This tool is not a substitute for professional medical advice. If you have abnormal readings, especially below 90%, consult a healthcare provider.
          </p>
        </div>
      )}
      
      {activeTab === 'logger' && (
        <div>
          <div className="form-container">
            <h3>Log Your Oxygen Saturation</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="oxygen-level">Oxygen Saturation (%)</label>
                  <input
                    id="oxygen-level"
                    type="text"
                    value={oxygenLevel}
                    onChange={handleOxygenLevelChange}
                    placeholder="96"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pulse">Pulse (bpm)</label>
                  <input
                    id="pulse"
                    type="text"
                    value={pulse}
                    onChange={handlePulseChange}
                    placeholder="72"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    readOnly
                    required
                  />
                  <small className="date-hint">Current date only</small>
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    readOnly
                    required
                  />
                  <small className="date-hint">Current time only</small>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (letters only)</label>
                <textarea
                  id="notes"
                  rows="2"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any notes about your reading (letters only)"
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Reading'}
              </button>
            </form>
          </div>
          
          <div className="history-container">
            <h3>History</h3>
            
            {history.length === 0 ? (
              <p>No readings recorded yet.</p>
            ) : (
              <div className="table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Oxygen (%)</th>
                      <th>Pulse (bpm)</th>
                      <th>Category</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date} {record.time}</td>
                        <td>{record.oxygen_level}%</td>
                        <td>{record.pulse || 'N/A'}</td>
                        <td>{record.category}</td>
                        <td>{record.notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpO2Tracker; 