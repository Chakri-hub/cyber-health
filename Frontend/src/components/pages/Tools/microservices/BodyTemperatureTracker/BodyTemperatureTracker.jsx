import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { healthService } from '../../../../../services/healthService';
import './BodyTemperatureTracker.css';

const BodyTemperatureTracker = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    
    const [activeTab, setActiveTab] = useState('instructions');
    const [temperature, setTemperature] = useState('');
    const [unit, setUnit] = useState('celsius');
    const [method, setMethod] = useState('oral');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Function to get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        setDate(format(now, 'yyyy-MM-dd'));
        setTime(format(now, 'HH:mm'));
    };
    
    // Update date and time when the component loads or tab changes
    useEffect(() => {
        if (activeTab === 'logger') {
            getCurrentDateTime();
        }
    }, [activeTab]);
    
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
    
    // Input validation for temperature
    const handleTemperatureChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setTemperature(value);
    };
    
    // Handle notes input
    const handleNotesChange = (e) => {
        // Only allow letters and spaces, remove special characters and numbers
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        setNotes(value);
    };
    
    // Convert temperature between units
    const convertTemperature = (temp, fromUnit, toUnit) => {
        if (!temp || isNaN(temp)) return '';
        
        const tempValue = parseFloat(temp);
        
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
            return ((tempValue * 9/5) + 32).toFixed(1);
        } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
            return ((tempValue - 32) * 5/9).toFixed(1);
        }
        
        return tempValue.toFixed(1);
    };
    
    // Toggle between Celsius and Fahrenheit
    const toggleUnit = () => {
        const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
        const convertedTemp = convertTemperature(temperature, unit, newUnit);
        setUnit(newUnit);
        setTemperature(convertedTemp);
    };
    
    // Determine temperature status
    const interpretTemperature = (temp, tempUnit) => {
        let tempInCelsius = parseFloat(temp);
        if (tempUnit === 'fahrenheit') {
            tempInCelsius = (tempInCelsius - 32) * 5/9;
        }
        
        // Different normal ranges based on measurement method
        let lowThreshold, highThreshold;
        
        switch (method) {
            case 'oral':
                lowThreshold = 36.0;
                highThreshold = 37.5;
                break;
            case 'ear':
                lowThreshold = 35.8;
                highThreshold = 37.8;
                break;
            case 'forehead':
                lowThreshold = 35.8;
                highThreshold = 37.6;
                break;
            case 'armpit':
                lowThreshold = 35.5;
                highThreshold = 37.0;
                break;
            case 'rectal':
                lowThreshold = 36.6;
                highThreshold = 38.0;
                break;
            default:
                lowThreshold = 36.0;
                highThreshold = 37.5;
        }
        
        if (tempInCelsius < lowThreshold) return 'Low';
        if (tempInCelsius <= highThreshold) return 'Normal';
        if (tempInCelsius <= 38.0) return 'Mild Fever';
        if (tempInCelsius <= 39.0) return 'Moderate Fever';
        if (tempInCelsius <= 40.0) return 'High Fever';
        return 'Very High Fever';
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError('');
        setSuccess('');
        
        // Set a default temperature if none is provided
        const tempValue = temperature ? parseFloat(temperature) : 37.0;
        
        try {
            setLoading(true);
            
            // Update to current date and time before submitting
            getCurrentDateTime();
            
            const status = temperature ? interpretTemperature(temperature, unit) : 'Normal';
            
            // Create the data object to send to the API
            const temperatureData = {
                temperature: tempValue,
                unit: unit,
                method: method,
                status: status,
                date: date,
                time: time,
                notes: notes
            };
            
            console.log('Saving temperature data:', temperatureData);
            
            // Call the API to save temperature data
            const result = await healthService.saveTemperature(user.id, temperatureData);
            
            setSuccess('Temperature recorded successfully!');
            
            // Reset form
            setTemperature('');
            // Keep current date/time
            getCurrentDateTime();
            setNotes('');
            
        } catch (err) {
            console.error('Error saving temperature:', err);
            setError('Failed to save data: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="body-temperature-tracker">
            <div className="temperature-header">
                <h1>Body Temperature Tracker</h1>
                <p>Record and monitor your body temperature</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can use the tracker, but cannot save readings.
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
                    Record Temperature
                </button>
            </div>
            
            {activeTab === 'instructions' && (
                <div className="instructions-section">
                    <h2>How to Measure Body Temperature</h2>
                    
                    <div className="instruction-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Choose the Right Method</h3>
                            <div className="method-cards">
                                <div className="method-card">
                                    <h4>Oral (Mouth)</h4>
                                    <p>Place the thermometer under the tongue and close the mouth.</p>
                                    <p>Normal: 36.0°C - 37.5°C (96.8°F - 99.5°F)</p>
                                </div>
                                
                                <div className="method-card">
                                    <h4>Ear (Tympanic)</h4>
                                    <p>Insert the probe into the ear canal following device instructions.</p>
                                    <p>Normal: 35.8°C - 37.8°C (96.4°F - 100.0°F)</p>
                                </div>
                                
                                <div className="method-card">
                                    <h4>Forehead (Temporal)</h4>
                                    <p>Scan across the forehead following the device instructions.</p>
                                    <p>Normal: 35.8°C - 37.6°C (96.4°F - 99.7°F)</p>
                                </div>
                                
                                <div className="method-card">
                                    <h4>Armpit (Axillary)</h4>
                                    <p>Place in the center of the armpit with arm pressed against body.</p>
                                    <p>Normal: 35.5°C - 37.0°C (95.9°F - 98.6°F)</p>
                                </div>
                                
                                <div className="method-card">
                                    <h4>Rectal</h4>
                                    <p>Most accurate method, often used for infants.</p>
                                    <p>Normal: 36.6°C - 38.0°C (97.9°F - 100.4°F)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="instruction-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Follow Proper Technique</h3>
                            <ul className="technique-list">
                                <li>Wait at least 30 minutes after eating, drinking, or exercising before taking oral temperature.</li>
                                <li>For electronic thermometers, wait for the device to signal completion.</li>
                                <li>Clean the thermometer before and after each use according to manufacturer instructions.</li>
                                <li>For ear thermometers, pull the ear gently up and back for adults, or down and back for children.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="instruction-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Understand Your Results</h3>
                            <div className="temperature-categories">
                                <div className="temp-category low">
                                    <h4>Low Temperature</h4>
                                    <p>Below normal range for the method used</p>
                                    <p>May indicate hypothermia or other conditions</p>
                                </div>
                                
                                <div className="temp-category normal">
                                    <h4>Normal Temperature</h4>
                                    <p>Within the normal range for the method used</p>
                                </div>
                                
                                <div className="temp-category fever-mild">
                                    <h4>Mild Fever</h4>
                                    <p>37.6°C - 38.0°C (99.7°F - 100.4°F)</p>
                                </div>
                                
                                <div className="temp-category fever-moderate">
                                    <h4>Moderate Fever</h4>
                                    <p>38.1°C - 39.0°C (100.5°F - 102.2°F)</p>
                                </div>
                                
                                <div className="temp-category fever-high">
                                    <h4>High Fever</h4>
                                    <p>39.1°C - 40.0°C (102.3°F - 104.0°F)</p>
                                    <p>Seek medical attention if persistent</p>
                                </div>
                                
                                <div className="temp-category fever-very-high">
                                    <h4>Very High Fever</h4>
                                    <p>Above 40.0°C (104.0°F)</p>
                                    <p>Seek immediate medical attention</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="instruction-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Important Notes</h3>
                            <ul className="important-notes">
                                <li>Temperature varies throughout the day, typically lowest in the morning and highest in the evening.</li>
                                <li>Different measurement methods will give slightly different readings.</li>
                                <li>Children and infants may have higher normal temperatures than adults.</li>
                                <li>Seek medical attention for high fevers, especially in infants, young children, or when accompanied by severe symptoms.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'logger' && (
                <div className="logger-section">
                    <h2>Record Body Temperature</h2>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <form onSubmit={handleSubmit} className="temperature-form">
                        <div className="measurement-section">
                            <div className="form-group">
                                <label>Temperature</label>
                                <div className="temperature-input-group">
                                    <input
                                        type="text"
                                        value={temperature}
                                        onChange={handleTemperatureChange}
                                        placeholder={unit === 'celsius' ? '37.0' : '98.6'}
                                        required
                                    />
                                    <span className="unit-indicator">°{unit === 'celsius' ? 'C' : 'F'}</span>
                                    <button
                                        type="button"
                                        className="unit-toggle"
                                        onClick={toggleUnit}
                                    >
                                        Switch to °{unit === 'celsius' ? 'F' : 'C'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Measurement Method</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    required
                                >
                                    <option value="oral">Oral (Mouth)</option>
                                    <option value="ear">Ear (Tympanic)</option>
                                    <option value="forehead">Forehead (Temporal)</option>
                                    <option value="armpit">Armpit (Axillary)</option>
                                    <option value="rectal">Rectal</option>
                                </select>
                            </div>
                        </div>
                        
                        {temperature && !isNaN(parseFloat(temperature)) && (
                            <div className={`temperature-status ${interpretTemperature(temperature, unit).toLowerCase().replace(' ', '-')}`}>
                                <strong>Status:</strong> {interpretTemperature(temperature, unit)}
                            </div>
                        )}
                        
                        <div className="form-row">
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
                        </div>
                        
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={notes}
                                onChange={handleNotesChange}
                                placeholder="Add any symptoms or other notes about this reading"
                                rows="3"
                            />
                        </div>
                        
                        <button
                            type="submit" 
                            className="save-btn"
                        >
                            Save Reading
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BodyTemperatureTracker; 