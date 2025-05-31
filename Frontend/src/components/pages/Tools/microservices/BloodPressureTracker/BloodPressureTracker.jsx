import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './BloodPressureTracker.css';

const BloodPressureTracker = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('instructions');
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [pulse, setPulse] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [notes, setNotes] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (activeTab === 'logger' && user) {
            fetchBloodPressureHistory();
        }
    }, [activeTab, user]);

    const fetchBloodPressureHistory = async () => {
        try {
            setLoading(true);
            const response = await healthService.getBloodPressureHistory(user.id);
            console.log('Blood pressure history response:', response);
            
            // Check if response has the expected format
            if (response.success && response.records) {
                setHistory(response.records);
            } else if (response.records) {
                // In case the API returns records directly without success wrapper
                setHistory(response.records);
            } else if (Array.isArray(response)) {
                // In case the API returns an array directly
                setHistory(response);
            } else {
                console.error('Unexpected response format:', response);
                setError('Failed to parse blood pressure history. Check console for details.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching blood pressure history:', err);
            setError('Failed to load blood pressure history. Please try again.');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any previous messages
        setError('');
        setSuccess('');
        
        if (!systolic || !diastolic) {
            setError('Systolic and diastolic readings are required');
            return;
        }

        // Validate notes to only allow characters
        if (notes && !/^[a-zA-Z\s]+$/.test(notes)) {
            setError('Notes field can only contain letters and spaces');
            return;
        }

        if (!user) {
            setError('Please sign in to save your blood pressure data');
            return;
        }

        try {
            setLoading(true);
            
            // Log the data we're trying to save
            const bpData = {
                systolic: parseInt(systolic),
                diastolic: parseInt(diastolic),
                pulse: pulse ? parseInt(pulse) : null,
                date: date,
                time: time,
                timestamp: new Date(`${date}T${time}`).toISOString(),
                notes
            };
            
            console.log('Saving blood pressure data:', bpData);
            
            const response = await healthService.saveBloodPressure(user.id, bpData);
            console.log('Save blood pressure response:', response);
            
            setSuccess('Blood pressure recorded successfully!');
            
            // Reset form
            setSystolic('');
            setDiastolic('');
            setPulse('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setTime(format(new Date(), 'HH:mm'));
            setNotes('');
            
            // Refresh history with a small delay to ensure the server has processed the new record
            setTimeout(() => {
                fetchBloodPressureHistory();
            }, 500);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving blood pressure:', err);
            setError(`Failed to save blood pressure data: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const interpretBloodPressure = (systolic, diastolic) => {
        if (systolic < 120 && diastolic < 80) {
            return { category: 'Normal', class: 'normal' };
        } else if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
            return { category: 'Elevated', class: 'elevated' };
        } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
            return { category: 'Hypertension Stage 1', class: 'hypertension-1' };
        } else if (systolic >= 140 || diastolic >= 90) {
            return { category: 'Hypertension Stage 2', class: 'hypertension-2' };
        } else if (systolic > 180 || diastolic > 120) {
            return { category: 'Hypertensive Crisis', class: 'crisis' };
        }
        return { category: 'Unknown', class: 'unknown' };
    };

    // Add handlers to filter non-numeric characters
    const handleSystolicChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setSystolic(value);
    };

    const handleDiastolicChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setDiastolic(value);
    };

    const handlePulseChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPulse(value);
    };

    // Handler to filter out numbers and special characters from notes
    const handleNotesChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        setNotes(value);
    };

    // Function to get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        setDate(format(now, 'yyyy-MM-dd'));
        setTime(format(now, 'HH:mm'));
    };

    // Handle date changes - force current date only
    const handleDateChange = (e) => {
        // Ignore user input and set to current date
        getCurrentDateTime();
    };

    // Handle time changes - force current time only
    const handleTimeChange = (e) => {
        // Ignore user input and set to current time
        getCurrentDateTime();
    };

    return (
        <div className="blood-pressure-tracker show-debug">
            <div className="blood-pressure-header">
                <h1>Blood Pressure Tracker</h1>
                <p>Monitor and record your blood pressure readings</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can see the tracker interface but cannot save readings or view history.
                    </div>
                )}
            </div>

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
                    Record & History
                </button>
            </div>

            {activeTab === 'instructions' && (
                <div className="instructions-section">
                    <h2>How to Measure Your Blood Pressure</h2>
                    <div className="instruction-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Prepare for the Reading</h3>
                            <p>Sit in a quiet, comfortable place. Rest for 5 minutes before taking your blood pressure. Don't smoke, drink caffeine, or exercise within 30 minutes of measuring.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Position Yourself Correctly</h3>
                            <p>Sit with your back straight and supported. Keep your feet flat on the floor and don't cross your legs. Rest your arm on a flat surface at heart level.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Place the Cuff Correctly</h3>
                            <p>Place the cuff directly on your bare skin, not over clothing. The bottom of the cuff should be directly above your elbow.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Take Multiple Readings</h3>
                            <p>Take two or three readings, 1 minute apart. Use the average of these readings for a more accurate measurement.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">5</div>
                        <div className="step-content">
                            <h3>Understanding the Numbers</h3>
                            <div className="bp-categories">
                                <div className="bp-category normal">
                                    <h4>Normal</h4>
                                    <p>Systolic: less than 120 mmHg</p>
                                    <p>Diastolic: less than 80 mmHg</p>
                                </div>
                                <div className="bp-category elevated">
                                    <h4>Elevated</h4>
                                    <p>Systolic: 120-129 mmHg</p>
                                    <p>Diastolic: less than 80 mmHg</p>
                                </div>
                                <div className="bp-category hypertension-1">
                                    <h4>Hypertension Stage 1</h4>
                                    <p>Systolic: 130-139 mmHg</p>
                                    <p>Diastolic: 80-89 mmHg</p>
                                </div>
                                <div className="bp-category hypertension-2">
                                    <h4>Hypertension Stage 2</h4>
                                    <p>Systolic: 140 or higher mmHg</p>
                                    <p>Diastolic: 90 or higher mmHg</p>
                                </div>
                                <div className="bp-category crisis">
                                    <h4>Hypertensive Crisis</h4>
                                    <p>Systolic: higher than 180 mmHg</p>
                                    <p>Diastolic: higher than 120 mmHg</p>
                                    <p className="warning">Seek emergency care immediately!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logger' && (
                <div className="tab-content-container">
                    <div className="record-bp-section">
                        <h3>Record Blood Pressure Reading</h3>
                        <form onSubmit={handleSubmit} className="bp-form">
                            <div className="bp-inputs">
                                <div className="form-group">
                                    <label>Systolic (mmHg)</label>
                                    <input
                                        type="text"
                                        value={systolic}
                                        onChange={handleSystolicChange}
                                        min="70"
                                        max="250"
                                        placeholder="120"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Diastolic (mmHg)</label>
                                    <input
                                        type="text"
                                        value={diastolic}
                                        onChange={handleDiastolicChange}
                                        min="40"
                                        max="150"
                                        placeholder="80"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pulse (bpm)</label>
                                    <input
                                        type="text"
                                        value={pulse}
                                        onChange={handlePulseChange}
                                        min="40"
                                        max="200"
                                        placeholder="72"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    readOnly
                                    required
                                />
                                <small className="date-hint">Current date only</small>
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    readOnly
                                    required
                                />
                                <small className="date-hint">Current time only</small>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={handleNotesChange}
                                    placeholder="Add any additional notes about this reading (letters only)"
                                    rows="3"
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Reading'}
                            </button>
                        </form>
                    </div>

                    <div className="history-section">
                        <h2>Blood Pressure History</h2>
                        {!user && <p className="login-prompt">Please sign in to view your blood pressure history.</p>}
                        {loading && <p>Loading history...</p>}
                        {user && !loading && history && history.length > 0 ? (
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Reading</th>
                                            <th>Pulse</th>
                                            <th>Category</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((record, index) => {
                                            try {
                                                const interpretation = interpretBloodPressure(record.systolic, record.diastolic);
                                                return (
                                                    <tr key={index}>
                                                        <td>{format(new Date(record.timestamp || `${record.date}T${record.time}`), 'MMM d, yyyy h:mm a')}</td>
                                                        <td>{record.systolic}/{record.diastolic} mmHg</td>
                                                        <td>{record.pulse ? `${record.pulse} bpm` : 'N/A'}</td>
                                                        <td className={interpretation.class}>{interpretation.category}</td>
                                                        <td>{record.notes || 'N/A'}</td>
                                                    </tr>
                                                );
                                            } catch (err) {
                                                console.error('Error rendering record:', record, err);
                                                return (
                                                    <tr key={index} className="error-row">
                                                        <td colSpan="5">Error displaying this record: {err.message}</td>
                                                    </tr>
                                                );
                                            }
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            user && !loading && (
                                <div>
                                    <p className="no-records">No blood pressure records found. Start tracking your readings!</p>
                                    {history && (
                                        <div className="debug-info">
                                            <p>Debug info: History object type: {typeof history}</p>
                                            {Array.isArray(history) && <p>History array length: {history.length}</p>}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodPressureTracker; 