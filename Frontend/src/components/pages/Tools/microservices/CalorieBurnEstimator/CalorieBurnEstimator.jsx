import React, { useState, useEffect } from 'react';
import './CalorieBurnEstimator.css';
import { useSelector } from 'react-redux';

const CalorieBurnEstimator = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [activity, setActivity] = useState('running');
  const [metricType, setMetricType] = useState('time'); // 'time' or 'distance'
  const [timeValue, setTimeValue] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [weight, setWeight] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [message, setMessage] = useState('');
  
  // Validation states
  const [validWeight, setValidWeight] = useState(true);
  const [validTime, setValidTime] = useState(true);
  const [validDistance, setValidDistance] = useState(true);

  // Activity MET values (Metabolic Equivalent of Task)
  const metValues = {
    running: {
      slow: 8.0,      // slow (10 min/mile or 6 mph)
      moderate: 9.8,  // moderate (8 min/mile or 7.5 mph)
      fast: 11.8      // fast (6 min/mile or 10 mph)
    },
    walking: {
      slow: 2.5,      // slow (2 mph)
      moderate: 3.5,  // moderate (3 mph)
      fast: 4.3       // fast (4 mph)
    },
    cycling: {
      slow: 4.0,      // slow (<10 mph)
      moderate: 8.0,  // moderate (12-14 mph)
      fast: 10.0      // fast (14-16 mph)
    },
    swimming: {
      slow: 4.5,      // casual
      moderate: 7.0,  // moderate
      fast: 10.0      // fast, vigorous
    },
    elliptical: 5.0,
    stairMaster: 9.0,
    rowing: {
      moderate: 7.0,
      vigorous: 8.5
    },
    yoga: 3.0,
    weightLifting: 3.5,
    hiking: 5.3,
    dancing: 4.8,
    gardening: 3.8,
    basketball: 6.5,
    tennis: 7.3,
    soccer: 8.0
  };

  // Input validation is now handled via CSS classes
  
  // Validate inputs whenever they change
  useEffect(() => {
    // Weight validation
    setValidWeight(weight !== '' && !isNaN(weight) && parseFloat(weight) > 0);
    
    // Time validation (if using time)
    setValidTime(timeValue === '' || (!isNaN(timeValue) && parseFloat(timeValue) > 0));
    
    // Distance validation (if using distance)
    setValidDistance(distanceValue === '' || (!isNaN(distanceValue) && parseFloat(distanceValue) > 0));
    
  }, [weight, timeValue, distanceValue]);

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedCalorieData = localStorage.getItem(`calorieBurnData_${user.id}`);
      if (savedCalorieData) {
        setSavedData(JSON.parse(savedCalorieData));
      }
    } else {
      // Clear data when no user is logged in
      setSavedData([]);
    }
  }, [user]);

  // Handle weight input change with sanitization
  const handleWeightChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setWeight(sanitizedValue);
  };

  // Handle time input change with sanitization
  const handleTimeChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setTimeValue(sanitizedValue);
  };

  // Handle distance input change with sanitization
  const handleDistanceChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setDistanceValue(sanitizedValue);
  };

  // Calculate calories burned
  const calculateCalories = () => {
    if (!validWeight || (metricType === 'time' && !validTime) || (metricType === 'distance' && !validDistance)) {
      setMessage('Please enter valid values');
      return;
    }

    if (weight === '') {
      setMessage('Please enter your weight');
      return;
    }

    if ((metricType === 'time' && timeValue === '') || 
        (metricType === 'distance' && distanceValue === '')) {
      setMessage('Please enter a value for your selected metric');
      return;
    }

    const weightValue = parseFloat(weight);
    const weightInKg = unit === 'metric' ? weightValue : weightValue * 0.453592; // Convert lbs to kg

    let met;
    // Determine MET value based on activity and intensity
    if (typeof metValues[activity] === 'object') {
      // For activities with intensity levels, use moderate as default
      met = metValues[activity].moderate;
    } else {
      met = metValues[activity];
    }

    let calories = 0;
    
    if (metricType === 'time') {
      // Formula: calories = METs × weight (kg) × duration (hours)
      const timeInHours = parseFloat(timeValue) / 60; // Convert minutes to hours
      calories = met * weightInKg * timeInHours;
    } else {
      // For distance-based calculation, we need to estimate time first
      // This is a simplification and would need to be adjusted for accuracy
      let distanceInKm = parseFloat(distanceValue);
      if (unit === 'imperial') {
        distanceInKm = distanceInKm * 1.60934; // Convert miles to km
      }

      // Estimate time based on average speeds (very simplified)
      let timeInHours;
      switch (activity) {
        case 'running':
          timeInHours = distanceInKm / 10; // Assuming 10 km/h for moderate running
          break;
        case 'walking':
          timeInHours = distanceInKm / 5; // Assuming 5 km/h for moderate walking
          break;
        case 'cycling':
          timeInHours = distanceInKm / 20; // Assuming 20 km/h for moderate cycling
          break;
        default:
          timeInHours = distanceInKm / 10; // Default fallback
      }

      calories = met * weightInKg * timeInHours;
    }

    // Round to nearest whole number
    calories = Math.round(calories);
    setCaloriesBurned(calories);
    setMessage('');
  };
  
  // Save the current calculation to local storage
  const saveData = () => {
    if (!user) {
      setMessage('Please log in to save your data');
      return;
    }
    
    if (caloriesBurned === null) {
      setMessage('Please calculate calories first');
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      activity,
      metricType,
      timeValue: metricType === 'time' ? timeValue : '',
      distanceValue: metricType === 'distance' ? distanceValue : '',
      weight,
      caloriesBurned,
      unit
    };
    
    const updatedData = [...savedData, newEntry];
    setSavedData(updatedData);
    
    // Save data with user-specific key
    localStorage.setItem(`calorieBurnData_${user.id}`, JSON.stringify(updatedData));
    
    setMessage('Data saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  
  // Reset form fields
  const resetForm = () => {
    setTimeValue('');
    setDistanceValue('');
    setWeight('');
    setCaloriesBurned(null);
    setMessage('');
    setValidWeight(true);
    setValidTime(true);
    setValidDistance(true);
  };
  
  // Toggle unit system
  const switchUnit = () => {
    resetForm();
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  // Get appropriate unit labels
  const weightLabel = unit === 'metric' ? 'kg' : 'lbs';
  const distanceLabel = unit === 'metric' ? 'km' : 'miles';

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="calorie-burn-estimator">
      <h2>Calorie Burn Estimator</h2>
      <p className="tool-description">
        Estimate calories burned during various physical activities based on your weight, activity type, and duration or distance.
      </p>

      <div className="unit-toggle">
        <span className={unit === 'metric' ? 'active' : ''}>Metric (kg/km)</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={unit === 'imperial'} 
            onChange={switchUnit} 
          />
          <span className="slider round"></span>
        </label>
        <span className={unit === 'imperial' ? 'active' : ''}>Imperial (lbs/miles)</span>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="weight">Your Weight</label>
          <div className="input-group">
            <input
              type="text"
              id="weight"
              value={weight}
              onChange={handleWeightChange}
              placeholder={`Weight in ${weightLabel}`}
              className={`form-control ${!validWeight ? 'invalid' : ''}`}
            />
            <div className="input-group-append">
              <span className="input-group-text">{weightLabel}</span>
            </div>
          </div>
          {!validWeight && <div className="validation-error">Please enter a valid weight</div>}
        </div>

        <div className="form-group">
          <label htmlFor="activity">Activity Type</label>
          <select 
            id="activity" 
            className="form-control"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            <option value="running">Running</option>
            <option value="walking">Walking</option>
            <option value="cycling">Cycling</option>
            <option value="swimming">Swimming</option>
            <option value="elliptical">Elliptical Trainer</option>
            <option value="stairMaster">Stair Master</option>
            <option value="rowing">Rowing Machine</option>
            <option value="yoga">Yoga</option>
            <option value="weightLifting">Weight Lifting</option>
            <option value="hiking">Hiking</option>
            <option value="dancing">Dancing</option>
            <option value="gardening">Gardening</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
            <option value="soccer">Soccer</option>
          </select>
        </div>

        <div className="form-group">
          <label>Calculation Method</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="time"
                checked={metricType === 'time'}
                onChange={() => setMetricType('time')}
              />
              Time-based
            </label>
            <label>
              <input
                type="radio"
                value="distance"
                checked={metricType === 'distance'}
                onChange={() => setMetricType('distance')}
              />
              Distance-based
            </label>
          </div>
        </div>

        {metricType === 'time' ? (
          <div className="form-group">
            <label htmlFor="time">Activity Duration</label>
            <div className="input-group">
              <input
                type="text"
                id="time"
                value={timeValue}
                onChange={handleTimeChange}
                placeholder="Duration in minutes"
                className={`form-control ${!validTime ? 'invalid' : ''}`}
              />
              <div className="input-group-append">
                <span className="input-group-text">min</span>
              </div>
            </div>
            {!validTime && <div className="validation-error">Please enter a valid time</div>}
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="distance">Activity Distance</label>
            <div className="input-group">
              <input
                type="text"
                id="distance"
                value={distanceValue}
                onChange={handleDistanceChange}
                placeholder={`Distance in ${distanceLabel}`}
                className={`form-control ${!validDistance ? 'invalid' : ''}`}
              />
              <div className="input-group-append">
                <span className="input-group-text">{distanceLabel}</span>
              </div>
            </div>
            {!validDistance && <div className="validation-error">Please enter a valid distance</div>}
          </div>
        )}

        <div className="buttons-container">
          <button 
            className="calculate-button" 
            onClick={calculateCalories}
            disabled={!validWeight || (metricType === 'time' && !validTime) || (metricType === 'distance' && !validDistance)}
          >
            Calculate Calories
          </button>

          <button 
            className="reset-button" 
            onClick={resetForm}
          >
            Reset
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {caloriesBurned !== null && (
          <div className="results">
            <h3>Your Results</h3>
            
            <div className="result-card">
              <div className="result-value">{caloriesBurned}</div>
              <div className="result-label">Calories Burned</div>
            </div>
            
            <div className="activity-summary">
              <h4>Activity Summary</h4>
              <ul>
                <li><strong>Activity:</strong> {activity.charAt(0).toUpperCase() + activity.slice(1)}</li>
                {metricType === 'time' ? (
                  <li><strong>Duration:</strong> {timeValue} minutes</li>
                ) : (
                  <li><strong>Distance:</strong> {distanceValue} {distanceLabel}</li>
                )}
                <li><strong>Your Weight:</strong> {weight} {weightLabel}</li>
              </ul>
            </div>
            
            {user ? (
              <button 
                className="save-button" 
                onClick={saveData}
              >
                Save This Workout
              </button>
            ) : (
              <div className="login-prompt">
                <p>Please log in to save your workout data</p>
              </div>
            )}
          </div>
        )}

        {user && savedData.length > 0 && (
          <div className="history-section">
            <h3>Your Workout History</h3>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    {/* Show either Time or Distance column, not both */}
                    <th>{metricType === 'time' ? 'Duration (min)' : `Distance (${distanceLabel})`}</th>
                    <th>Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {savedData.slice().reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.activity.charAt(0).toUpperCase() + entry.activity.slice(1)}</td>
                      <td>
                        {entry.metricType === 'time' 
                          ? `${entry.timeValue} min` 
                          : `${entry.distanceValue} ${entry.unit === 'metric' ? 'km' : 'miles'}`
                        }
                      </td>
                      <td>{entry.caloriesBurned}</td>
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

export default CalorieBurnEstimator;