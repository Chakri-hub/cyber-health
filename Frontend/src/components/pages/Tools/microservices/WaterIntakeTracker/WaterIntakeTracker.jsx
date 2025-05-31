import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './WaterIntakeTracker.css';

const WaterIntakeTracker = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [goal, setGoal] = useState('2000'); // In milliliters (ml)
  const [unit, setUnit] = useState('ml'); // 'ml' or 'oz'
  const [cups, setCups] = useState([]);
  const [cupSize, setCupSize] = useState('250'); // Default cup size in ml
  const [savedData, setSavedData] = useState([]);
  const [message, setMessage] = useState('');
  
  // Validation states
  const [validGoal, setValidGoal] = useState(true);
  const [validCupSize, setValidCupSize] = useState(true);
  
  // Helper function to style inputs based on validation
  const getInputStyle = (isValid) => {
    return {
      border: isValid ? '1px solid #ced4da' : '1px solid #dc3545',
      backgroundColor: isValid ? '#fff' : '#fff8f8'
    };
  };
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Get today's date in YYYY-MM-DD format
  const today = formatDate(new Date());
  
  // Load saved data from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedWaterData = localStorage.getItem(`waterIntake_${user.id}`);
      if (savedWaterData) {
        setSavedData(JSON.parse(savedWaterData));
        
        // Find data for today
        const todayData = JSON.parse(savedWaterData).find(
          item => formatDate(item.date) === today
        );
        
        if (todayData) {
          setGoal(todayData.goal || '2000');
          setUnit(todayData.unit || 'ml');
          setCups(todayData.cups || []);
          setCupSize(todayData.cupSize || '250');
        }
      }
    } else {
      // Clear data when no user is logged in
      setSavedData([]);
      setCups([]);
    }
  }, [user, today]);

  // Validate inputs whenever they change
  useEffect(() => {
    setValidGoal(goal !== '' && !isNaN(goal) && parseInt(goal, 10) > 0);
    setValidCupSize(cupSize !== '' && !isNaN(cupSize) && parseInt(cupSize, 10) > 0);
  }, [goal, cupSize]);

  // Handle goal input change with sanitization
  const handleGoalChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
    setGoal(sanitizedValue);
  };
  
  // Handle cup size input change with sanitization
  const handleCupSizeChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
    setCupSize(sanitizedValue);
  };

  // Calculate total water intake
  const calculateTotalIntake = () => {
    if (cups.length === 0) return 0;
    
    return cups.reduce((total, cup) => total + parseInt(cup.size, 10), 0);
  };
  
  // Convert between ml and oz
  const convertUnit = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'ml' && toUnit === 'oz') {
      return Math.round(value / 29.5735); // ml to oz
    } else {
      return Math.round(value * 29.5735); // oz to ml
    }
  };
  
  // Get display value based on unit
  const getDisplayValue = (value) => {
    if (unit === 'ml') {
      return value;
    } else {
      return convertUnit(value, 'ml', 'oz');
    }
  };
  
  // Toggle between ml and oz
  const toggleUnit = () => {
    const newUnit = unit === 'ml' ? 'oz' : 'ml';
    setUnit(newUnit);
  };
  
  // Add a cup of water
  const addCup = () => {
    if (!validCupSize) {
      setMessage('Please enter a valid cup size');
      return;
    }
    
    const newCup = {
      id: Date.now(),
      size: parseInt(cupSize, 10),
      time: new Date().toISOString()
    };
    
    setCups([...cups, newCup]);
    setMessage('Cup added!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Remove the last cup
  const removeCup = () => {
    if (cups.length === 0) {
      setMessage('No cups to remove');
      return;
    }
    
    setCups(cups.slice(0, -1));
    setMessage('Last cup removed!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Save data to localStorage
  const saveData = () => {
    if (!user) {
      setMessage('Please log in to save your data');
      return;
    }
    
    if (!validGoal) {
      setMessage('Please enter a valid daily goal');
      return;
    }
    
    // Check if we already have an entry for today
    const existingDataIndex = savedData.findIndex(
      item => formatDate(item.date) === today
    );
    
    let newSavedData;
    
    if (existingDataIndex >= 0) {
      // Update today's entry
      newSavedData = [...savedData];
      newSavedData[existingDataIndex] = {
        ...newSavedData[existingDataIndex],
        goal,
        unit,
        cups,
        cupSize,
        totalIntake: calculateTotalIntake()
      };
    } else {
      // Create a new entry for today
      newSavedData = [
        ...savedData,
        {
          id: Date.now(),
          date: today,
          goal,
          unit,
          cups,
          cupSize,
          totalIntake: calculateTotalIntake()
        }
      ];
    }
    
    // Save to localStorage
    localStorage.setItem(`waterIntake_${user.id}`, JSON.stringify(newSavedData));
    setSavedData(newSavedData);
    
    setMessage('Data saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Reset form
  const resetForm = () => {
    setGoal('2000');
    setCups([]);
    setCupSize('250');
    setMessage('Form reset!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Calculate percentage of daily goal consumed
  const calculatePercentage = () => {
    const total = calculateTotalIntake();
    const targetGoal = parseInt(goal, 10);
    return Math.min(Math.round((total / targetGoal) * 100), 100);
  };
  
  // Get water bottle fill level as percentage
  const getWaterFillLevel = () => {
    return Math.min(calculatePercentage(), 100);
  };

  return (
    <div className="water-intake-tracker">
      <h2>Water Intake Tracker</h2>
      <p className="tool-description">
        Track your daily water consumption and stay hydrated. 
        Set a personal goal and visualize your progress throughout the day.
      </p>
      
      <div className="tracker-container">
        <div className="water-goal-section">
          <h3>Daily Water Goal</h3>
          <div className="input-group goal-input">
            <label htmlFor="daily-goal">Target Intake:</label>
            <div className="unit-input">
              <input 
                type="text" 
                id="daily-goal" 
                value={goal} 
                onChange={handleGoalChange}
                style={getInputStyle(validGoal)}
              />
              <button 
                className="unit-toggle"
                onClick={toggleUnit}
              >
                {unit}
              </button>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="cup-size">Cup Size:</label>
            <div className="unit-input">
              <input 
                type="text" 
                id="cup-size" 
                value={cupSize} 
                onChange={handleCupSizeChange}
                style={getInputStyle(validCupSize)}
              />
              <span className="unit-label">{unit}</span>
            </div>
          </div>
          
          <div className="add-buttons">
            <button 
              className="add-cup-button"
              onClick={addCup}
              disabled={!validCupSize}
            >
              Add Cup
            </button>
            <button 
              className="remove-cup-button"
              onClick={removeCup}
              disabled={cups.length === 0}
            >
              Remove Last
            </button>
          </div>
          
          <div className="message-container">
            {message && <p className="message">{message}</p>}
          </div>
        </div>
        
        <div className="water-visualization-section">
          <h3>Today's Progress</h3>
          
          <div className="water-bottle-container">
            <div className="water-bottle">
              <div 
                className="water-fill"
                style={{ height: `${getWaterFillLevel()}%` }}
              ></div>
              <div className="water-overlay"></div>
            </div>
            
            <div className="water-stats">
              <div className="water-percentage">{calculatePercentage()}%</div>
              <div className="water-amount">
                {getDisplayValue(calculateTotalIntake())} / {getDisplayValue(parseInt(goal, 10))} {unit}
              </div>
            </div>
          </div>
          
          <div className="cups-log">
            <h4>Cups Consumed Today ({cups.length})</h4>
            <div className="cups-container">
              {cups.map((cup, index) => (
                <div key={cup.id} className="cup-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 2L5 22H19L21 2H3Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V3H7V2Z" fill="#2196F3"/>
                    <path className="cup-fill" d="M5 4H19L18 19H6L5 4Z" fill="#2196F3" fillOpacity="0.3"/>
                  </svg>
                  <span className="cup-size">{getDisplayValue(cup.size)}{unit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="action-buttons">
            <button onClick={saveData} className="save-button">Save Data</button>
            <button onClick={resetForm} className="reset-button">Reset</button>
          </div>
        </div>
      </div>
      
      <div className="hydration-tips">
        <h3>Hydration Tips</h3>
        <ul>
          <li>Drink a glass of water right after waking up to rehydrate your body</li>
          <li>Aim to drink water throughout the day rather than all at once</li>
          <li>Keep a reusable water bottle with you as a reminder to stay hydrated</li>
          <li>Set reminders on your phone to drink water at regular intervals</li>
          <li>Foods with high water content like cucumber, watermelon, and oranges also contribute to hydration</li>
        </ul>
      </div>
    </div>
  );
};

export default WaterIntakeTracker; 