import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './DailyCalorieTracker.css';

const DailyCalorieTracker = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [dailyGoal, setDailyGoal] = useState('2000');
  const [savedData, setSavedData] = useState([]);
  const [message, setMessage] = useState('');
  
  // Validation states
  const [validMealName, setValidMealName] = useState(true);
  const [validCalories, setValidCalories] = useState(true);
  const [validDailyGoal, setValidDailyGoal] = useState(true);

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
      const savedCalorieData = localStorage.getItem(`calorieTracker_${user.id}`);
      if (savedCalorieData) {
        setSavedData(JSON.parse(savedCalorieData));
        
        // Filter meals for today
        const todayData = JSON.parse(savedCalorieData).filter(
          item => formatDate(item.date) === today
        );
        
        if (todayData.length > 0) {
          setMeals(todayData[0].meals || []);
          setDailyGoal(todayData[0].dailyGoal || '2000');
        }
      }
    } else {
      // Clear data when no user is logged in
      setSavedData([]);
      setMeals([]);
    }
  }, [user, today]);

  // Calculate total calories consumed today
  const calculateTotalCalories = () => {
    return meals.reduce((total, meal) => total + parseInt(meal.calories, 10), 0);
  };

  // Validate inputs whenever they change
  useEffect(() => {
    setValidMealName(mealName.trim() !== '');
    setValidCalories(calories !== '' && !isNaN(calories) && parseInt(calories, 10) >= 0);
    setValidDailyGoal(dailyGoal !== '' && !isNaN(dailyGoal) && parseInt(dailyGoal, 10) > 0);
  }, [mealName, calories, dailyGoal]);

  // Handle meal name input change with sanitization
  const handleMealNameChange = (e) => {
    // Allow alphanumeric, spaces, hyphens, periods, commas, parentheses, apostrophes, and ampersands
    const sanitizedValue = e.target.value.replace(/[<>]/g, '');
    setMealName(sanitizedValue);
  };

  // Handle calories input change with sanitization
  const handleCaloriesChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
    setCalories(sanitizedValue);
  };

  // Handle daily goal input change with sanitization
  const handleDailyGoalChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
    setDailyGoal(sanitizedValue);
  };

  // Add a meal to the log
  const addMeal = (e) => {
    e.preventDefault();
    
    if (!validMealName || !validCalories) {
      setMessage('Please enter valid meal details');
      return;
    }
    
    const newMeal = {
      id: Date.now(),
      name: mealName,
      calories: parseInt(calories, 10),
      type: mealType,
      time: new Date().toISOString()
    };
    
    setMeals([...meals, newMeal]);
    setMealName('');
    setCalories('');
    setMessage('Meal added!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Delete a meal from the log
  const deleteMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };
  
  // Save data to localStorage
  const saveData = () => {
    if (!user) {
      setMessage('Please log in to save your data');
      return;
    }
    
    if (!validDailyGoal) {
      setMessage('Please enter a valid daily calorie goal');
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
        meals,
        dailyGoal,
        totalCalories: calculateTotalCalories()
      };
    } else {
      // Create a new entry for today
      newSavedData = [
        ...savedData,
        {
          id: Date.now(),
          date: today,
          meals,
          dailyGoal,
          totalCalories: calculateTotalCalories()
        }
      ];
    }
    
    // Save to localStorage
    localStorage.setItem(`calorieTracker_${user.id}`, JSON.stringify(newSavedData));
    setSavedData(newSavedData);
    
    setMessage('Data saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Calculate percentage of daily goal consumed
  const calculatePercentage = () => {
    const total = calculateTotalCalories();
    const goal = parseInt(dailyGoal, 10);
    return Math.min(Math.round((total / goal) * 100), 100);
  };
  
  // Reset the form
  const resetForm = () => {
    setMeals([]);
    setDailyGoal('2000');
    setMessage('Form reset!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Group meals by type
  const getMealsByType = (type) => {
    return meals.filter(meal => meal.type === type);
  };

  return (
    <div className="daily-calorie-tracker">
      <h2>Daily Calorie Tracker</h2>
      <p className="tool-description">
        Track your meals and calories to help maintain a healthy diet. 
        Set a daily calorie goal and monitor your progress throughout the day.
      </p>
      
      <div className="tracker-container">
        <div className="calorie-goal-section">
          <h3>Daily Calorie Goal</h3>
          <div className="input-group">
            <label htmlFor="daily-goal">Target Calories:</label>
            <input 
              type="text" 
              id="daily-goal" 
              value={dailyGoal} 
              onChange={handleDailyGoalChange}
              style={getInputStyle(validDailyGoal)}
            />
          </div>
          
          <div className="progress-section">
            <h3>Today's Progress</h3>
            <div className="progress-ring-container">
              <div className="progress-ring">
                <div 
                  className="progress-fill" 
                  style={{ transform: `rotate(${Math.min(calculatePercentage() * 3.6, 360)}deg)` }}
                ></div>
                <div className="progress-center">
                  <span className="percentage">{calculatePercentage()}%</span>
                  <span className="calorie-count">{calculateTotalCalories()} / {dailyGoal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="meal-log-section">
          <h3>Add Meal</h3>
          <form onSubmit={addMeal}>
            <div className="input-group">
              <label htmlFor="meal-name">Meal Description:</label>
              <input 
                type="text" 
                id="meal-name" 
                value={mealName} 
                onChange={handleMealNameChange}
                placeholder="e.g. Chicken Salad"
                style={getInputStyle(validMealName)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="calories">Calories:</label>
              <input 
                type="text" 
                id="calories" 
                value={calories} 
                onChange={handleCaloriesChange}
                placeholder="e.g. 350"
                style={getInputStyle(validCalories)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="meal-type">Meal Type:</label>
              <select 
                id="meal-type" 
                value={mealType} 
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <button type="submit" className="submit-button">Add Meal</button>
          </form>
          
          <div className="message-container">
            {message && <p className="message">{message}</p>}
          </div>
          
          <div className="meal-list">
            <h3>Today's Meals</h3>
            
            {meals.length === 0 ? (
              <p className="no-meals">No meals logged today. Add your first meal above!</p>
            ) : (
              <div className="meal-categories">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
                  const typeMeals = getMealsByType(type);
                  if (typeMeals.length === 0) return null;
                  
                  return (
                    <div key={type} className="meal-category">
                      <h4 className="meal-type-header">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </h4>
                      <ul className="meal-items">
                        {typeMeals.map(meal => (
                          <li key={meal.id} className="meal-item">
                            <div className="meal-info">
                              <span className="meal-name">{meal.name}</span>
                              <span className="meal-calories">{meal.calories} cal</span>
                            </div>
                            <button 
                              className="delete-button"
                              onClick={() => deleteMeal(meal.id)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="total-calories">
              <span>Total Calories:</span>
              <span className="total-value">{calculateTotalCalories()}</span>
            </div>
          </div>
          
          <div className="action-buttons">
            <button onClick={saveData} className="save-button">Save Data</button>
            <button onClick={resetForm} className="reset-button">Reset</button>
          </div>
        </div>
      </div>
      
      <div className="health-tips">
        <h3>Healthy Eating Tips</h3>
        <ul>
          <li>Include a variety of fruits and vegetables in your diet</li>
          <li>Choose whole grains over refined grains</li>
          <li>Limit added sugars and processed foods</li>
          <li>Stay hydrated throughout the day</li>
          <li>Pay attention to portion sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyCalorieTracker; 