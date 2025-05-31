import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './MacronutrientCalculator.css';

const MacronutrientCalculator = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' (kg) or 'imperial' (lbs)
  const [goal, setGoal] = useState('maintain'); // 'lose', 'maintain', or 'gain'
  const [activityLevel, setActivityLevel] = useState('moderate'); // 'sedentary', 'light', 'moderate', 'active', 'very_active'
  const [gender, setGender] = useState('male'); // 'male' or 'female'
  const [macros, setMacros] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [message, setMessage] = useState('');
  const [loggedFood, setLoggedFood] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  
  // Validation states
  const [validWeight, setValidWeight] = useState(true);
  const [validProtein, setValidProtein] = useState(true);
  const [validCarbs, setValidCarbs] = useState(true);
  const [validFats, setValidFats] = useState(true);
  
  // Helper function to style inputs based on validation
  const getInputStyle = (isValid) => {
    return {
      border: isValid ? '1px solid #ced4da' : '1px solid #dc3545',
      backgroundColor: isValid ? '#fff' : '#fff8f8'
    };
  };
  
  // Load saved data from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedMacroData = localStorage.getItem(`macronutrient_${user.id}`);
      if (savedMacroData) {
        setSavedData(JSON.parse(savedMacroData));
        
        // Get the most recent data
        const recentData = JSON.parse(savedMacroData)[0];
        if (recentData) {
          setWeight(recentData.weight || '');
          setUnit(recentData.unit || 'metric');
          setGoal(recentData.goal || 'maintain');
          setActivityLevel(recentData.activityLevel || 'moderate');
          setGender(recentData.gender || 'male');
          
          if (recentData.macros) {
            setMacros(recentData.macros);
          }
          
          if (recentData.loggedFood) {
            setLoggedFood(recentData.loggedFood);
          }
        }
      }
    } else {
      // Clear data when no user is logged in
      setSavedData([]);
      setLoggedFood([]);
    }
  }, [user]);

  // Validate inputs whenever they change
  useEffect(() => {
    setValidWeight(weight === '' || (!isNaN(weight) && parseFloat(weight) > 0));
    setValidProtein(protein === '' || (!isNaN(protein) && parseInt(protein, 10) >= 0));
    setValidCarbs(carbs === '' || (!isNaN(carbs) && parseInt(carbs, 10) >= 0));
    setValidFats(fats === '' || (!isNaN(fats) && parseInt(fats, 10) >= 0));
  }, [weight, protein, carbs, fats]);

  // Handle weight input change with sanitization
  const handleWeightChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setWeight(sanitizedValue);
  };
  
  // Handle protein input change with sanitization
  const handleProteinChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setProtein(sanitizedValue);
  };
  
  // Handle carbs input change with sanitization
  const handleCarbsChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setCarbs(sanitizedValue);
  };
  
  // Handle fats input change with sanitization
  const handleFatsChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    setFats(sanitizedValue);
  };

  // Handle food name input change with sanitization
  const handleFoodNameChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^\w\s\-.,()&]/g, '');
    setFoodName(sanitizedValue);
  };

  // Calculate macronutrients based on inputs
  const calculateMacros = () => {
    if (!validWeight || weight === '') {
      setMessage('Please enter a valid weight');
      return;
    }
    
    // Convert weight to kg if needed
    let weightInKg = parseFloat(weight);
    if (unit === 'imperial') {
      weightInKg = weightInKg * 0.453592; // Convert lbs to kg
    }
    
    // Calculate basal metabolic rate (BMR) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * 170 - 5 * 30 + 5; // Assuming average height (170cm) and age (30)
    } else {
      bmr = 10 * weightInKg + 6.25 * 160 - 5 * 30 - 161; // Assuming average height (160cm) and age (30)
    }
    
    // Apply activity multiplier to get Total Daily Energy Expenditure (TDEE)
    let tdee;
    switch (activityLevel) {
      case 'sedentary':
        tdee = bmr * 1.2;
        break;
      case 'light':
        tdee = bmr * 1.375;
        break;
      case 'moderate':
        tdee = bmr * 1.55;
        break;
      case 'active':
        tdee = bmr * 1.725;
        break;
      case 'very_active':
        tdee = bmr * 1.9;
        break;
      default:
        tdee = bmr * 1.55; // Default to moderate
    }
    
    // Adjust calories based on goal
    let calorieTarget;
    switch (goal) {
      case 'lose':
        calorieTarget = tdee - 500; // 500 calorie deficit for fat loss
        break;
      case 'gain':
        calorieTarget = tdee + 500; // 500 calorie surplus for muscle gain
        break;
      default:
        calorieTarget = tdee; // Maintain weight
    }
    
    // Calculate macronutrient ratios based on goal
    let proteinRatio, carbRatio, fatRatio;
    
    switch (goal) {
      case 'lose':
        proteinRatio = 0.40; // 40% protein
        fatRatio = 0.35;     // 35% fat
        carbRatio = 0.25;    // 25% carbs
        break;
      case 'gain':
        proteinRatio = 0.30; // 30% protein
        carbRatio = 0.50;    // 50% carbs
        fatRatio = 0.20;     // 20% fat
        break;
      default:
        proteinRatio = 0.30; // 30% protein
        carbRatio = 0.40;    // 40% carbs
        fatRatio = 0.30;     // 30% fat
    }
    
    // Calculate macros in grams
    // Protein: 4 calories per gram
    // Carbs: 4 calories per gram
    // Fat: 9 calories per gram
    const proteinCals = calorieTarget * proteinRatio;
    const carbCals = calorieTarget * carbRatio;
    const fatCals = calorieTarget * fatRatio;
    
    const proteinGrams = Math.round(proteinCals / 4);
    const carbGrams = Math.round(carbCals / 4);
    const fatGrams = Math.round(fatCals / 9);
    
    const macroResult = {
      calories: Math.round(calorieTarget),
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
      ratios: {
        protein: proteinRatio * 100,
        carbs: carbRatio * 100,
        fat: fatRatio * 100
      }
    };
    
    setMacros(macroResult);
    setMessage('');
  };
  
  // Save data to localStorage
  const saveData = () => {
    if (!user) {
      setMessage('Please log in to save your data');
      return;
    }
    
    if (macros === null) {
      setMessage('Please calculate macros first');
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight,
      unit,
      goal,
      activityLevel,
      gender,
      macros,
      loggedFood
    };
    
    // Add to the beginning of saved data array
    const newSavedData = [newEntry, ...savedData.slice(0, 9)]; // Keep only 10 most recent entries
    
    // Save to localStorage
    localStorage.setItem(`macronutrient_${user.id}`, JSON.stringify(newSavedData));
    setSavedData(newSavedData);
    
    setMessage('Data saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Add food to log
  const addFood = (e) => {
    e.preventDefault();
    
    // Check if food name is empty
    if (foodName.trim() === '') {
      setMessage('Please enter a food name');
      return;
    }
    
    // Check if macros are valid
    if (!validProtein || !validCarbs || !validFats || 
        protein === '' || carbs === '' || fats === '') {
      setMessage('Please enter valid macronutrient values');
      return;
    }
    
    const proteinValue = parseInt(protein, 10) || 0;
    const carbsValue = parseInt(carbs, 10) || 0;
    const fatsValue = parseInt(fats, 10) || 0;
    
    const newFood = {
      id: Date.now(),
      name: foodName,
      protein: proteinValue,
      carbs: carbsValue,
      fats: fatsValue,
      calories: (proteinValue * 4) + (carbsValue * 4) + (fatsValue * 9),
      time: new Date().toISOString()
    };
    
    setLoggedFood([...loggedFood, newFood]);
    setFoodName('');
    setProtein('');
    setCarbs('');
    setFats('');
    setMessage('Food added successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Delete food from log
  const deleteFood = (id) => {
    setLoggedFood(loggedFood.filter(food => food.id !== id));
  };
  
  // Reset the form
  const resetForm = () => {
    setWeight('');
    setGoal('maintain');
    setActivityLevel('moderate');
    setGender('male');
    setMacros(null);
    setLoggedFood([]);
    setMessage('Form reset!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Calculate total consumed macros
  const calculateConsumed = () => {
    if (loggedFood.length === 0) {
      return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    }
    
    return loggedFood.reduce(
      (totals, food) => {
        return {
          protein: totals.protein + food.protein,
          carbs: totals.carbs + food.carbs,
          fat: totals.fat + food.fats,
          calories: totals.calories + food.calories
        };
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  };
  
  // Format percentage for display
  const formatPercent = (value) => {
    return Math.round(value) + '%';
  };

  return (
    <div className="macronutrient-calculator">
      <h2>Macronutrient Split Calculator</h2>
      <p className="tool-description">
        Calculate your recommended macronutrient intake based on your body weight and fitness goals.
        Use this tool to create balanced meal plans that support your health objectives.
      </p>
      
      <div className="calculator-container">
        <div className="inputs-section">
          <h3>Your Information</h3>
          <div className="input-group">
            <label htmlFor="weight">Weight:</label>
            <div className="weight-input">
              <input 
                type="text" 
                id="weight" 
                value={weight} 
                onChange={handleWeightChange}
                style={getInputStyle(validWeight)}
              />
              <select 
                id="unit" 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="metric">kg</option>
                <option value="imperial">lbs</option>
              </select>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="gender">Gender:</label>
            <select 
              id="gender" 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="goal">Fitness Goal:</label>
            <select 
              id="goal" 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="lose">Weight Loss</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Muscle Gain</option>
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="activity">Activity Level:</label>
            <select 
              id="activity" 
              value={activityLevel} 
              onChange={(e) => setActivityLevel(e.target.value)}
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (intense exercise daily)</option>
            </select>
          </div>
          
          <button 
            onClick={calculateMacros} 
            className="calculate-button"
          >
            Calculate Macros
          </button>
          
          <div className="message-container">
            {message && <p className="message" style={{
              backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
              color: message.includes('successfully') ? '#155724' : '#721c24',
              padding: '10px',
              borderRadius: '4px',
              marginTop: '10px'
            }}>{message}</p>}
          </div>
        </div>
        
        <div className="results-section">
          {macros && (
            <>
              <h3>Your Macronutrient Targets</h3>
              <div className="macro-results">
                <div className="macro-total">
                  <span className="macro-label">Daily Calories:</span>
                  <span className="macro-value">{macros.calories}</span>
                </div>
                
                <div className="macro-pie-chart">
                  <div className="pie-slice protein" style={{ transform: `rotate(0deg) skew(${90 - macros.ratios.protein * 3.6}deg)` }}></div>
                  <div className="pie-slice carbs" style={{ transform: `rotate(${macros.ratios.protein * 3.6}deg) skew(${90 - macros.ratios.carbs * 3.6}deg)` }}></div>
                  <div className="pie-slice fats" style={{ transform: `rotate(${(macros.ratios.protein + macros.ratios.carbs) * 3.6}deg) skew(${90 - macros.ratios.fat * 3.6}deg)` }}></div>
                  <div className="pie-center">
                    {formatPercent(macros.ratios.protein)} P<br />
                    {formatPercent(macros.ratios.carbs)} C<br />
                    {formatPercent(macros.ratios.fat)} F
                  </div>
                </div>
                
                <div className="macro-details">
                  <div className="macro-item protein">
                    <div className="macro-color-indicator"></div>
                    <div className="macro-info">
                      <span className="macro-name">Protein</span>
                      <span className="macro-value">{macros.protein}g</span>
                    </div>
                  </div>
                  
                  <div className="macro-item carbs">
                    <div className="macro-color-indicator"></div>
                    <div className="macro-info">
                      <span className="macro-name">Carbs</span>
                      <span className="macro-value">{macros.carbs}g</span>
                    </div>
                  </div>
                  
                  <div className="macro-item fats">
                    <div className="macro-color-indicator"></div>
                    <div className="macro-info">
                      <span className="macro-name">Fats</span>
                      <span className="macro-value">{macros.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button onClick={saveData} className="save-button">Save Data</button>
                <button onClick={resetForm} className="reset-button">Reset</button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {macros && (
        <div className="food-log-section">
          <h3>Macro Tracker</h3>
          <div className="food-log-container">
            <div className="add-food-form">
              <h4>Log Food</h4>
              <form onSubmit={addFood}>
                <div className="input-group">
                  <label htmlFor="food-name">Food Name:</label>
                  <input 
                    type="text" 
                    id="food-name" 
                    value={foodName} 
                    onChange={handleFoodNameChange}
                    placeholder="e.g. Chicken Breast"
                    style={{border: foodName.trim() === '' && protein !== '' ? '1px solid #dc3545' : '1px solid #ced4da'}}
                    required
                  />
                </div>
                
                <div className="macro-inputs">
                  <div className="input-group">
                    <label htmlFor="protein-input">Protein (g):</label>
                    <input 
                      type="text" 
                      id="protein-input" 
                      value={protein} 
                      onChange={handleProteinChange}
                      style={getInputStyle(validProtein)}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="carbs-input">Carbs (g):</label>
                    <input 
                      type="text" 
                      id="carbs-input" 
                      value={carbs} 
                      onChange={handleCarbsChange}
                      style={getInputStyle(validCarbs)}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="fats-input">Fats (g):</label>
                    <input 
                      type="text" 
                      id="fats-input" 
                      value={fats} 
                      onChange={handleFatsChange}
                      style={getInputStyle(validFats)}
                      required
                    />
                  </div>
                </div>
                
                <button type="submit" className="add-food-button">Add Food</button>
              </form>
            </div>
            
            <div className="logged-food-list">
              <h4>Today's Food Log</h4>
              
              {loggedFood.length === 0 ? (
                <p className="no-food">No foods logged today. Add your first food above!</p>
              ) : (
                <>
                  <ul className="food-items">
                    {loggedFood.map(food => (
                      <li key={food.id} className="food-item">
                        <div className="food-name">{food.name}</div>
                        <div className="food-macros">
                          <span className="food-macro protein-value">P: {food.protein}g</span>
                          <span className="food-macro carbs-value">C: {food.carbs}g</span>
                          <span className="food-macro fats-value">F: {food.fats}g</span>
                          <span className="food-calories">{food.calories} cal</span>
                        </div>
                        <button 
                          className="delete-button"
                          onClick={() => deleteFood(food.id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="progress-summary">
                    <h4>Daily Progress</h4>
                    
                    {macros && (
                      <div className="macro-progress">
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Protein</span>
                            <span>{calculateConsumed().protein}g / {macros.protein}g</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill protein"
                              style={{ width: `${Math.min((calculateConsumed().protein / macros.protein) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Carbs</span>
                            <span>{calculateConsumed().carbs}g / {macros.carbs}g</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill carbs"
                              style={{ width: `${Math.min((calculateConsumed().carbs / macros.carbs) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Fats</span>
                            <span>{calculateConsumed().fat}g / {macros.fat}g</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill fats"
                              style={{ width: `${Math.min((calculateConsumed().fat / macros.fat) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Calories</span>
                            <span>{calculateConsumed().calories} / {macros.calories}</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill calories"
                              style={{ width: `${Math.min((calculateConsumed().calories / macros.calories) * 100, 100)}%` }}
                            >
                              {calculateConsumed().calories > 0 && 
                                <button 
                                  className="progress-clear-btn"
                                  onClick={() => setLoggedFood([])}
                                  title="Clear all logged food"
                                >
                                  ✕
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MacronutrientCalculator; 