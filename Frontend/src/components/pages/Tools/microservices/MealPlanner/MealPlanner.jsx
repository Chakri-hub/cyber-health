import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './MealPlanner.css';

const MealPlanner = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [dietType, setDietType] = useState('balanced');
  const [planType, setPlanType] = useState('daily');
  const [allergies, setAllergies] = useState([]);
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [mealPlan, setMealPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [message, setMessage] = useState('');
  
  // Fake meal plan data (in real application, this would come from an API)
  const mealPlanOptions = {
    balanced: {
      daily: {
        breakfast: [
          {
            name: "Greek Yogurt Parfait",
            ingredients: [
              "1 cup Greek yogurt",
              "1/4 cup granola",
              "1/2 cup mixed berries",
              "1 tbsp honey"
            ],
            calories: 320,
            protein: 20,
            carbs: 40,
            fat: 8
          }
        ],
        lunch: [
          {
            name: "Mediterranean Quinoa Salad",
            ingredients: [
              "1 cup cooked quinoa",
              "1/2 cucumber, diced",
              "1/2 cup cherry tomatoes",
              "1/4 cup feta cheese",
              "2 tbsp olive oil",
              "1 tbsp lemon juice",
              "Fresh herbs"
            ],
            calories: 420,
            protein: 12,
            carbs: 45,
            fat: 22
          }
        ],
        dinner: [
          {
            name: "Baked Salmon with Roasted Vegetables",
            ingredients: [
              "5 oz salmon fillet",
              "1 cup broccoli",
              "1 cup sweet potato",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            calories: 450,
            protein: 35,
            carbs: 30,
            fat: 18
          }
        ],
        snacks: [
          {
            name: "Apple with Almond Butter",
            ingredients: [
              "1 medium apple",
              "1 tbsp almond butter"
            ],
            calories: 180,
            protein: 4,
            carbs: 25,
            fat: 9
          }
        ]
      },
      weekly: {
        // This would be expanded to include meals for an entire week
        monday: {
          breakfast: {
            name: "Greek Yogurt Parfait",
            ingredients: [
              "1 cup Greek yogurt",
              "1/4 cup granola",
              "1/2 cup mixed berries",
              "1 tbsp honey"
            ]
          },
          lunch: {
            name: "Mediterranean Quinoa Salad",
            ingredients: [
              "1 cup cooked quinoa",
              "1/2 cucumber, diced",
              "1/2 cup cherry tomatoes",
              "1/4 cup feta cheese",
              "2 tbsp olive oil",
              "1 tbsp lemon juice"
            ]
          },
          dinner: {
            name: "Baked Salmon with Roasted Vegetables",
            ingredients: [
              "5 oz salmon fillet",
              "1 cup broccoli",
              "1 cup sweet potato",
              "1 tbsp olive oil",
              "Herbs and spices"
            ]
          }
        },
        tuesday: {
          breakfast: {
            name: "Avocado Toast with Egg",
            ingredients: [
              "2 slices whole grain bread",
              "1/2 avocado",
              "2 eggs",
              "Salt and pepper"
            ]
          },
          lunch: {
            name: "Chicken and Vegetable Soup",
            ingredients: [
              "4 oz chicken breast",
              "1 cup mixed vegetables",
              "1 cup chicken broth",
              "Herbs and spices"
            ]
          },
          dinner: {
            name: "Stir-Fried Tofu with Brown Rice",
            ingredients: [
              "4 oz firm tofu",
              "1 cup mixed vegetables",
              "1/2 cup brown rice",
              "1 tbsp soy sauce",
              "1 tsp sesame oil"
            ]
          }
        }
      }
    },
    vegetarian: {
      daily: {
        breakfast: [
          {
            name: "Overnight Oats",
            ingredients: [
              "1/2 cup rolled oats",
              "1/2 cup almond milk",
              "1 tbsp chia seeds",
              "1/2 banana",
              "1 tbsp peanut butter"
            ],
            calories: 350,
            protein: 12,
            carbs: 48,
            fat: 14
          }
        ],
        lunch: [
          {
            name: "Chickpea and Vegetable Wrap",
            ingredients: [
              "1 whole wheat wrap",
              "1/2 cup chickpeas",
              "1 cup mixed greens",
              "1/4 avocado",
              "2 tbsp hummus"
            ],
            calories: 380,
            protein: 15,
            carbs: 50,
            fat: 13
          }
        ],
        dinner: [
          {
            name: "Vegetable Stir-Fry with Tofu",
            ingredients: [
              "4 oz tofu",
              "2 cups mixed vegetables",
              "1/2 cup brown rice",
              "1 tbsp soy sauce",
              "1 tsp sesame oil"
            ],
            calories: 400,
            protein: 20,
            carbs: 45,
            fat: 15
          }
        ],
        snacks: [
          {
            name: "Trail Mix",
            ingredients: [
              "1/4 cup mixed nuts",
              "2 tbsp dried fruit",
              "1 tbsp dark chocolate chips"
            ],
            calories: 200,
            protein: 6,
            carbs: 18,
            fat: 14
          }
        ]
      },
      weekly: {
        // Abbreviated for brevity
      }
    },
    keto: {
      daily: {
        breakfast: [
          {
            name: "Avocado and Bacon Omelette",
            ingredients: [
              "3 eggs",
              "1/2 avocado",
              "2 slices bacon",
              "1 oz cheese",
              "Fresh herbs"
            ],
            calories: 550,
            protein: 30,
            carbs: 8,
            fat: 45
          }
        ],
        lunch: [
          {
            name: "Spinach and Feta Salad with Grilled Chicken",
            ingredients: [
              "4 oz grilled chicken",
              "2 cups spinach",
              "1 oz feta cheese",
              "10 olives",
              "2 tbsp olive oil",
              "1 tbsp lemon juice"
            ],
            calories: 450,
            protein: 35,
            carbs: 6,
            fat: 30
          }
        ],
        dinner: [
          {
            name: "Salmon with Asparagus",
            ingredients: [
              "6 oz salmon fillet",
              "1 cup asparagus",
              "2 tbsp butter",
              "Lemon and herbs"
            ],
            calories: 500,
            protein: 40,
            carbs: 5,
            fat: 35
          }
        ],
        snacks: [
          {
            name: "Cheese and Nuts",
            ingredients: [
              "1 oz cheese",
              "1/4 cup mixed nuts"
            ],
            calories: 280,
            protein: 12,
            carbs: 4,
            fat: 24
          }
        ]
      },
      weekly: {
        // Abbreviated for brevity
      }
    }
  };
  
  // List of common allergies
  const allergyOptions = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'soy', label: 'Soy' },
    { value: 'wheat', label: 'Wheat/Gluten' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' }
  ];
  
  // Load saved plans from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedMealPlans = localStorage.getItem(`mealPlans_${user.id}`);
      if (savedMealPlans) {
        setSavedPlans(JSON.parse(savedMealPlans));
      }
    } else {
      // Clear data when no user is logged in
      setSavedPlans([]);
    }
  }, [user]);

  // Handle allergy checkbox change
  const handleAllergyChange = (value) => {
    if (allergies.includes(value)) {
      setAllergies(allergies.filter(item => item !== value));
    } else {
      setAllergies([...allergies, value]);
    }
  };
  
  // Handle excluding ingredients
  const handleExcludeChange = (e) => {
    // Sanitize input to restrict special characters
    const sanitizedValue = e.target.value.replace(/[^\w\s\-.,()&]/g, '');
    setExcludeIngredients(sanitizedValue);
  };
  
  // Generate meal plan
  const generateMealPlan = () => {
    // In a real application, this would make an API call with user preferences
    // Here we'll just use our mock data and filter based on allergies/exclusions
    
    let plan = JSON.parse(JSON.stringify(mealPlanOptions[dietType][planType]));
    
    // Filter out meals with allergens or excluded ingredients
    if (allergies.length > 0 || excludeIngredients.trim() !== '') {
      // Process excluded ingredients
      const excluded = excludeIngredients
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(item => item !== '');
      
      // This is a simplified filtering logic for the mock data
      // In a real app, this would be handled by the backend API
      
      if (planType === 'daily') {
        Object.keys(plan).forEach(mealTime => {
          plan[mealTime] = plan[mealTime].filter(meal => {
            // Check each ingredient against allergies and exclusions
            const ingredients = meal.ingredients.join(' ').toLowerCase();
            
            // Filter out meals with allergens
            for (const allergy of allergies) {
              if (ingredients.includes(allergy.toLowerCase())) {
                return false;
              }
            }
            
            // Filter out meals with excluded ingredients
            for (const exclude of excluded) {
              if (ingredients.includes(exclude)) {
                return false;
              }
            }
            
            return true;
          });
          
          // If all meals were filtered out, add a placeholder
          if (plan[mealTime].length === 0) {
            plan[mealTime] = [{
              name: "Custom meal needed (allergies/exclusions applied)",
              ingredients: ["Please customize based on your dietary needs"],
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            }];
          }
        });
      } else {
        // Weekly plan filtering would be more complex and handled similarly
      }
    }
    
    setMealPlan(plan);
    setMessage('Meal plan generated!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Save meal plan to local storage
  const saveMealPlan = () => {
    if (!user) {
      setMessage('Please log in to save your meal plan');
      return;
    }
    
    if (!mealPlan) {
      setMessage('Please generate a meal plan first');
      return;
    }
    
    const newPlan = {
      id: Date.now(),
      date: new Date().toISOString(),
      dietType,
      planType,
      allergies,
      excludeIngredients,
      mealPlan
    };
    
    // Add to saved plans
    const updatedPlans = [newPlan, ...savedPlans];
    setSavedPlans(updatedPlans);
    
    // Save to localStorage
    localStorage.setItem(`mealPlans_${user.id}`, JSON.stringify(updatedPlans));
    
    setMessage('Meal plan saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate total nutrition facts for the daily plan
  const calculateTotalNutrition = () => {
    if (!mealPlan || planType !== 'daily') return null;
    
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    Object.keys(mealPlan).forEach(mealTime => {
      mealPlan[mealTime].forEach(meal => {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fat || 0;
      });
    });
    
    return totals;
  };
  
  // Generate a shopping list from the current meal plan
  const generateShoppingList = () => {
    if (!mealPlan) return [];
    
    const ingredientList = new Map();
    
    // For daily plan
    if (planType === 'daily') {
      Object.keys(mealPlan).forEach(mealTime => {
        mealPlan[mealTime].forEach(meal => {
          meal.ingredients.forEach(ingredient => {
            // Extract quantity and item
            const match = ingredient.match(/^([\d\/\.\s]+)?\s*(.+)$/);
            if (match) {
              const quantity = match[1] || '';
              const item = match[2].trim().toLowerCase();
              
              if (ingredientList.has(item)) {
                // If item already exists, we could try to combine quantities,
                // but for simplicity, we'll just list both
                ingredientList.set(item, `${ingredientList.get(item)}, ${quantity}`.trim());
              } else {
                ingredientList.set(item, quantity);
              }
            }
          });
        });
      });
    } 
    // For weekly plan - would need to iterate through days
    
    // Convert map to array for rendering
    return Array.from(ingredientList.entries()).map(([item, quantity]) => {
      return {
        item: item.charAt(0).toUpperCase() + item.slice(1), // Capitalize first letter
        quantity
      };
    }).sort((a, b) => a.item.localeCompare(b.item));
  };

  return (
    <div className="meal-planner">
      <h2>Meal Planner</h2>
      <p className="tool-description">
        Create personalized meal plans based on your dietary preferences.
        Generate daily or weekly plans with customized options.
      </p>
      
      <div className="planner-container">
        <div className="preferences-section">
          <h3>Meal Preferences</h3>
          
          <div className="input-group">
            <label htmlFor="diet-type">Diet Type:</label>
            <select 
              id="diet-type" 
              value={dietType} 
              onChange={(e) => setDietType(e.target.value)}
            >
              <option value="balanced">Balanced</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="keto">Keto</option>
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="plan-type">Plan Type:</label>
            <select 
              id="plan-type" 
              value={planType} 
              onChange={(e) => setPlanType(e.target.value)}
            >
              <option value="daily">Daily Plan</option>
              <option value="weekly">Weekly Plan</option>
            </select>
          </div>
          
          <div className="input-group">
            <label>Allergies/Intolerances:</label>
            <div className="checkbox-group">
              {allergyOptions.map(option => (
                <div key={option.value} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id={`allergy-${option.value}`}
                    checked={allergies.includes(option.value)}
                    onChange={() => handleAllergyChange(option.value)}
                  />
                  <label htmlFor={`allergy-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="exclude-ingredients">Exclude Ingredients:</label>
            <input 
              type="text" 
              id="exclude-ingredients" 
              value={excludeIngredients} 
              onChange={handleExcludeChange}
              placeholder="e.g. mushrooms, olives (comma separated)"
            />
          </div>
          
          <button 
            onClick={generateMealPlan} 
            className="generate-button"
          >
            Generate Meal Plan
          </button>
          
          <div className="message-container">
            {message && <p className="message">{message}</p>}
          </div>
          
          {mealPlan && (
            <button onClick={saveMealPlan} className="save-button">
              Save Meal Plan
            </button>
          )}
        </div>
        
        <div className="meal-plan-section">
          {mealPlan ? (
            planType === 'daily' ? (
              <div className="daily-plan">
                <h3>Your Daily Meal Plan</h3>
                
                <div className="nutrition-summary">
                  {calculateTotalNutrition() && (
                    <>
                      <h4>Nutrition Summary</h4>
                      <div className="nutrition-grid">
                        <div className="nutrition-item">
                          <span className="nutrition-label">Calories</span>
                          <span className="nutrition-value">{calculateTotalNutrition().calories}</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Protein</span>
                          <span className="nutrition-value">{calculateTotalNutrition().protein}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Carbs</span>
                          <span className="nutrition-value">{calculateTotalNutrition().carbs}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Fat</span>
                          <span className="nutrition-value">{calculateTotalNutrition().fat}g</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="meal-sections">
                  <div className="meal-time">
                    <h4>Breakfast</h4>
                    {mealPlan.breakfast.map((meal, index) => (
                      <div key={index} className="meal-card">
                        <h5 className="meal-name">{meal.name}</h5>
                        <div className="meal-nutrition">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                        <div className="ingredients">
                          <h6>Ingredients:</h6>
                          <ul>
                            {meal.ingredients.map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="meal-time">
                    <h4>Lunch</h4>
                    {mealPlan.lunch.map((meal, index) => (
                      <div key={index} className="meal-card">
                        <h5 className="meal-name">{meal.name}</h5>
                        <div className="meal-nutrition">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                        <div className="ingredients">
                          <h6>Ingredients:</h6>
                          <ul>
                            {meal.ingredients.map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="meal-time">
                    <h4>Dinner</h4>
                    {mealPlan.dinner.map((meal, index) => (
                      <div key={index} className="meal-card">
                        <h5 className="meal-name">{meal.name}</h5>
                        <div className="meal-nutrition">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                        <div className="ingredients">
                          <h6>Ingredients:</h6>
                          <ul>
                            {meal.ingredients.map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {mealPlan.snacks && (
                    <div className="meal-time">
                      <h4>Snacks</h4>
                      {mealPlan.snacks.map((meal, index) => (
                        <div key={index} className="meal-card">
                          <h5 className="meal-name">{meal.name}</h5>
                          <div className="meal-nutrition">
                            <span>{meal.calories} cal</span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                          <div className="ingredients">
                            <h6>Ingredients:</h6>
                            <ul>
                              {meal.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="shopping-list">
                  <h4>Shopping List</h4>
                  <ul className="ingredients-list">
                    {generateShoppingList().map((item, index) => (
                      <li key={index} className="shopping-item">
                        <span className="item-name">{item.item}</span>
                        {item.quantity && <span className="item-quantity">{item.quantity}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="weekly-plan">
                <h3>Your Weekly Meal Plan</h3>
                <p>Weekly plan display would go here</p>
                {/* For brevity, weekly plan rendering is omitted */}
              </div>
            )
          ) : (
            <div className="no-plan">
              <h3>No Meal Plan Generated</h3>
              <p>Set your preferences and click "Generate Meal Plan" to create a personalized meal plan.</p>
              <div className="tip-container">
                <h4>Meal Planning Tips</h4>
                <ul>
                  <li>Consider your dietary goals when selecting a diet type</li>
                  <li>Include a variety of fruits and vegetables for balanced nutrition</li>
                  <li>Prep ingredients in advance to make cooking easier</li>
                  <li>Batch cooking can save time during busy weekdays</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {savedPlans.length > 0 && (
        <div className="saved-plans-section">
          <h3>Saved Meal Plans</h3>
          <div className="saved-plans-list">
            {savedPlans.slice(0, 3).map(plan => (
              <div key={plan.id} className="saved-plan-card">
                <div className="plan-header">
                  <h4>{formatDate(plan.date)}</h4>
                  <span className={`diet-type ${plan.dietType}`}>{plan.dietType}</span>
                </div>
                <div className="plan-details">
                  <span>{plan.planType === 'daily' ? 'Daily Plan' : 'Weekly Plan'}</span>
                  {plan.allergies.length > 0 && (
                    <div className="allergy-tags">
                      {plan.allergies.map(allergy => (
                        <span key={allergy} className="allergy-tag">{allergy}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner; 