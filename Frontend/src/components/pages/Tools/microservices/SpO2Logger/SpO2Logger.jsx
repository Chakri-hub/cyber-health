import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './SpO2Logger.css';

const SpO2Logger = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('instructions');
    const [oxygenLevel, setOxygenLevel] = useState('');
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
            fetchSpO2History();
        }
    }, [activeTab, user]);

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
        try {
            setLoading(true);
            // This will need to be implemented in the backend
            const response = await healthService.getSpO2History(user.id);
            console.log('SpO2 history response:', response);
            
            if (response.success && response.records) {
                setHistory(response.records);
            } else if (response.records) {
                setHistory(response.records);
            } else if (Array.isArray(response)) {
                setHistory(response);
            } else {
                console.error('Unexpected response format:', response);
                setError('Failed to parse SpO2 history. Check console for details.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching SpO2 history:', err);
            setError('Failed to load SpO2 history. Please try again.');
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
        
        if (!oxygenLevel) {
            setError('Oxygen saturation level is required');
            return;
        }

        // Validate oxygen level range
        const oxygenValue = parseInt(oxygenLevel);
        if (oxygenValue < 70 || oxygenValue > 100) {
            setError('Oxygen saturation must be between 70% and 100%');
            return;
        }

        // Validate notes to only allow characters
        if (notes && !/^[a-zA-Z\s]+$/.test(notes)) {
            setError('Notes field can only contain letters and spaces');
            return;
        }

        if (!user) {
            setError('Please sign in to save your SpO2 data');
            return;
        }

        try {
            setLoading(true);
            
            // Log the data we're trying to save
            const spO2Data = {
                oxygenLevel: parseInt(oxygenLevel),
                pulse: pulse ? parseInt(pulse) : null,
                date: date,
                time: time,
                timestamp: new Date(`${date}T${time}`).toISOString(),
                notes,
                status: interpretOxygenLevel(parseInt(oxygenLevel))
            };
            
            console.log('Saving SpO2 data:', spO2Data);
            
            // This needs to be implemented in the backend
            const response = await healthService.saveSpO2(user.id, spO2Data);
            console.log('Save SpO2 response:', response);
            
            setSuccess('Oxygen saturation recorded successfully!');
            
            // Reset form
            setOxygenLevel('');
            setPulse('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setTime(format(new Date(), 'HH:mm'));
            setNotes('');
            
            // Refresh history with a small delay to ensure the server has processed the new record
            setTimeout(() => {
                fetchSpO2History();
            }, 500);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving SpO2:', err);
            setError(`Failed to save SpO2 data: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const interpretOxygenLevel = (level) => {
        if (level >= 95) {
            return { category: 'Normal', class: 'normal' };
        } else if (level >= 91 && level <= 94) {
            return { category: 'Mild Hypoxemia', class: 'mild' };
        } else if (level >= 86 && level <= 90) {
            return { category: 'Moderate Hypoxemia', class: 'moderate' };
        } else {
            return { category: 'Severe Hypoxemia', class: 'severe' };
        }
    };

    return (
        <div className="spo2-logger">
            <div className="spo2-header">
                <h1>SpO₂ Oxygen Saturation Logger</h1>
                <p>Monitor and record your blood oxygen levels</p>
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
                    <h2>How to Use a Pulse Oximeter</h2>
                    <div className="instruction-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Prepare for the Reading</h3>
                            <p>Sit in a comfortable position and make sure your hand is warm, relaxed, and held below heart level. Remove nail polish if you're wearing any as it can affect the reading.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Place the Device Correctly</h3>
                            <p>Clip the pulse oximeter onto your fingertip (usually index finger or middle finger) with the display facing up. Make sure your finger is clean and dry.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Wait for a Reading</h3>
                            <p>The device will begin detecting your oxygen level and pulse rate. It may take a few seconds for the numbers to stabilize. Keep your hand still during the measurement.</p>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Understanding the Results</h3>
                            <div className="spo2-categories">
                                <div className="spo2-category normal">
                                    <h4>Normal</h4>
                                    <p>SpO₂: 95-100%</p>
                                    <p>Healthy individuals typically have oxygen saturation levels of 95% or higher.</p>
                                </div>
                                <div className="spo2-category mild">
                                    <h4>Mild Hypoxemia</h4>
                                    <p>SpO₂: 91-94%</p>
                                    <p>May indicate minor oxygen issues. Consider rechecking and consulting a doctor if persistent.</p>
                                </div>
                                <div className="spo2-category moderate">
                                    <h4>Moderate Hypoxemia</h4>
                                    <p>SpO₂: 86-90%</p>
                                    <p>Indicates potentially significant oxygen issues that should be evaluated by a healthcare provider.</p>
                                </div>
                                <div className="spo2-category severe">
                                    <h4>Severe Hypoxemia</h4>
                                    <p>SpO₂: Below 86%</p>
                                    <p className="warning">Indicates serious oxygen deprivation. Seek immediate medical attention!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="instruction-step">
                        <div className="step-number">5</div>
                        <div className="step-content">
                            <h3>Important Notes</h3>
                            <ul className="important-notes">
                                <li>If you have cold hands, poor circulation, or anemia, readings may be lower.</li>
                                <li>Many pulse oximeters are not FDA-approved for medical use - use for general monitoring only.</li>
                                <li>If you experience difficulty breathing, chest pain, confusion, or bluish lips along with low SpO₂, seek emergency medical care immediately.</li>
                                <li>Regular tracking can help identify trends but should not replace medical advice.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logger' && (
                <div className="tab-content-container">
                    <div className="record-spo2-section">
                        <h3>Record Oxygen Saturation Reading</h3>
                        <form onSubmit={handleSubmit} className="spo2-form">
                            <div className="spo2-inputs">
                                <div className="form-group">
                                    <label>SpO₂ (%)</label>
                                    <input
                                        type="text"
                                        value={oxygenLevel}
                                        onChange={handleOxygenLevelChange}
                                        placeholder="96"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pulse (bpm)</label>
                                    <input
                                        type="text"
                                        value={pulse}
                                        onChange={handlePulseChange}
                                        placeholder="72"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes (letters only)</label>
                                <textarea
                                    value={notes}
                                    onChange={handleNotesChange}
                                    placeholder="Add any additional notes about this reading"
                                    rows="3"
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Reading'}
                            </button>
                        </form>
                    </div>

                    <div className="history-section">
                        <h2>SpO₂ History</h2>
                        {!user && <p className="login-prompt">Please sign in to view your SpO₂ history.</p>}
                        {loading && <p>Loading history...</p>}
                        {user && !loading && history && history.length > 0 ? (
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>SpO₂</th>
                                            <th>Pulse</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((record, index) => {
                                            try {
                                                const interpretation = interpretOxygenLevel(record.oxygenLevel);
                                                return (
                                                    <tr key={index}>
                                                        <td>{format(new Date(record.timestamp || `${record.date}T${record.time}`), 'MMM d, yyyy h:mm a')}</td>
                                                        <td>{record.oxygenLevel}%</td>
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
                                    <p className="no-records">No SpO₂ records found. Start tracking your oxygen levels!</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpO2Logger; 