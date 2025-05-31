import React, { useState, useEffect } from 'react';
import './WaistToHipRatio.css';
import { useSelector } from 'react-redux';

const WaistToHipRatio = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [ratio, setRatio] = useState(null);
  const [riskLevel, setRiskLevel] = useState('');
  const [gender, setGender] = useState('male');
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [savedData, setSavedData] = useState([]);
  const [message, setMessage] = useState('');
  
  // Validation states
  const [validWaist, setValidWaist] = useState(true);
  const [validHip, setValidHip] = useState(true);

  // Input validation is now handled via CSS classes
  
  // Validate inputs whenever they change
  useEffect(() => {
    // Waist validation (must not be empty and must be a valid number)
    setValidWaist(waist !== '' && !isNaN(waist) && parseFloat(waist) > 0);
    
    // Hip validation (must not be empty and must be a valid number)
    setValidHip(hip !== '' && !isNaN(hip) && parseFloat(hip) > 0);
    
  }, [waist, hip]);

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedWHRData = localStorage.getItem(`waistToHipRatioData_${user.id}`);
      if (savedWHRData) {
        setSavedData(JSON.parse(savedWHRData));
      }
    } else {
      // Clear data when no user is logged in
      setSavedData([]);
    }
  }, [user]);

  // Handle waist input change with sanitization
  const handleWaistChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setWaist(sanitizedValue);
  };

  // Handle hip input change with sanitization
  const handleHipChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setHip(sanitizedValue);
  };

  // Calculate waist-to-hip ratio
  const calculateRatio = () => {
    if (!validWaist || !validHip) {
      setMessage('Please enter valid measurements');
      return;
    }

    const waistValue = parseFloat(waist);
    const hipValue = parseFloat(hip);
    
    if (waistValue <= 0 || hipValue <= 0) {
      setMessage('Measurements must be greater than 0');
      return;
    }
    
    const calculatedRatio = waistValue / hipValue;
    setRatio(calculatedRatio.toFixed(2));
    
    // Determine risk level based on gender and ratio
    determineRiskLevel(calculatedRatio);
    
    setMessage('');
  };

  // Determine cardiovascular risk level based on WHR and gender
  const determineRiskLevel = (calculatedRatio) => {
    if (gender === 'male') {
      if (calculatedRatio < 0.90) {
        setRiskLevel('Low');
      } else if (calculatedRatio >= 0.90 && calculatedRatio < 1.0) {
        setRiskLevel('Moderate');
      } else {
        setRiskLevel('High');
      }
    } else { // female
      if (calculatedRatio < 0.80) {
        setRiskLevel('Low');
      } else if (calculatedRatio >= 0.80 && calculatedRatio < 0.85) {
        setRiskLevel('Moderate');
      } else {
        setRiskLevel('High');
      }
    }
  };
  
  // Save the current measurement to local storage
  const saveData = () => {
    if (!user) {
      setMessage('Please log in to save your measurements');
      return;
    }
    
    if (ratio === null) {
      setMessage('Please calculate your ratio first');
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      waist,
      hip,
      ratio,
      riskLevel,
      gender
    };
    
    const updatedData = [...savedData, newEntry];
    setSavedData(updatedData);
    
    // Save data with user-specific key
    localStorage.setItem(`waistToHipRatioData_${user.id}`, JSON.stringify(updatedData));
    
    setMessage('Data saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  
  // Reset form fields
  const resetForm = () => {
    setWaist('');
    setHip('');
    setRatio(null);
    setRiskLevel('');
    setMessage('');
    setValidWaist(true);
    setValidHip(true);
  };
  
  // Toggle unit system
  const switchUnit = () => {
    resetForm();
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  // Get appropriate unit label
  const unitLabel = unit === 'metric' ? 'cm' : 'inches';

  return (
    <div className="waist-hip-ratio">
      <h2>Waist-to-Hip Ratio Calculator</h2>
      <p className="tool-description">
        Calculate your waist-to-hip ratio (WHR) to assess potential health risks associated with body fat distribution. 
        WHR is a measure used to determine if you have a healthy fat distribution.
      </p>

      <div className="unit-toggle">
        <span className={unit === 'metric' ? 'active' : ''}>Metric (cm)</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={unit === 'imperial'} 
            onChange={switchUnit} 
          />
          <span className="slider round"></span>
        </label>
        <span className={unit === 'imperial' ? 'active' : ''}>Imperial (inches)</span>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label>Gender:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
              />
              Female
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="waist">Waist Circumference</label>
          <div className="input-group">
            <input
                type="text"
                className={`form-control ${!validWaist ? 'invalid' : ''}`}
                id="waist"
                value={waist}
                onChange={handleWaistChange}
                placeholder={`Waist measurement in ${unitLabel}`}
              />
            <div className="input-group-append">
              <span className="input-group-text">{unitLabel}</span>
            </div>
          </div>
          {!validWaist && <div className="validation-error">Please enter a valid waist measurement</div>}
        </div>

        <div className="form-group">
          <label htmlFor="hip">Hip Circumference</label>
          <div className="input-group">
            <input
                type="text"
                className={`form-control ${!validHip ? 'invalid' : ''}`}
                id="hip"
                value={hip}
                onChange={handleHipChange}
                placeholder={`Hip measurement in ${unitLabel}`}
              />
            <div className="input-group-append">
              <span className="input-group-text">{unitLabel}</span>
            </div>
          </div>
          {!validHip && <div className="validation-error">Please enter a valid hip measurement</div>}
        </div>

        <div className="buttons-container">
          <button 
            className="calculate-button" 
            onClick={calculateRatio}
            disabled={!validWaist || !validHip}
          >
            Calculate Ratio
          </button>

          <button 
            className="reset-button" 
            onClick={resetForm}
          >
            Reset
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {ratio !== null && (
          <div className="results">
            <h3>Your Results</h3>
            
            <div className="result-card">
              <div className="result-value">{ratio}</div>
              <div className="result-label">Waist-to-Hip Ratio</div>
            </div>
            
            <div className="risk-assessment">
              <h4>Health Risk Assessment</h4>
              <div className={`risk-level risk-${riskLevel.toLowerCase()}`}>
                {riskLevel} Risk
              </div>
              <p className="risk-explanation">
                {gender === 'male' ? (
                  <>
                    <strong>For men:</strong> A WHR below 0.90 indicates low risk, 0.90-0.99 indicates moderate risk, and 1.0 or higher indicates high risk for cardiovascular diseases.
                  </>
                ) : (
                  <>
                    <strong>For women:</strong> A WHR below 0.80 indicates low risk, 0.80-0.84 indicates moderate risk, and 0.85 or higher indicates high risk for cardiovascular diseases.
                  </>
                )}
              </p>
            </div>
            
            {user ? (
              <button 
                className="save-button" 
                onClick={saveData}
              >
                Save This Measurement
              </button>
            ) : (
              <div className="login-prompt">
                <p>Please log in to save your measurements</p>
              </div>
            )}
          </div>
        )}

        {user && savedData.length > 0 && (
          <div className="history-section">
            <h3>Your Measurement History</h3>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Waist ({unitLabel})</th>
                    <th>Hip ({unitLabel})</th>
                    <th>Ratio</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {savedData.slice().reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.waist}</td>
                      <td>{entry.hip}</td>
                      <td>{entry.ratio}</td>
                      <td className={`risk-${entry.riskLevel.toLowerCase()}`}>{entry.riskLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaistToHipRatio;