import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './FoodAllergyAwareness.css';

const FoodAllergyAwareness = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [savedAllergens, setSavedAllergens] = useState([]);
  const [message, setMessage] = useState('');
  const [showMealPlanAlerts, setShowMealPlanAlerts] = useState(false);
  const [activeTab, setActiveTab] = useState('allergens');

  // Available allergens with information
  const allergenOptions = [
    {
      id: 'dairy',
      name: 'Dairy',
      icon: '🥛',
      description: 'Includes milk, cheese, yogurt, butter, cream, and other milk-based products.',
      avoid: [
        'Milk (cow, goat, sheep)', 'Cheese', 'Yogurt', 'Butter', 'Ice cream', 
        'Cream', 'Custard', 'Some margarines', 'Ghee', 'Whey', 'Casein', 'Lactose'
      ],
      alternativesTitle: 'Dairy Alternatives',
      alternatives: [
        'Plant-based milk (oat, almond, soy, coconut)', 'Dairy-free cheese', 
        'Coconut or cashew yogurt', 'Plant-based butter', 'Dairy-free ice cream'
      ],
      hiddenLabels: ['Casein', 'Lactalbumin', 'Lactoglobulin', 'Lactose', 'Recaldent', 'Whey']
    },
    {
      id: 'gluten',
      name: 'Gluten',
      icon: '🌾',
      description: 'A protein found in wheat, barley, rye, and related grains like spelt and semolina.',
      avoid: [
        'Wheat', 'Barley', 'Rye', 'Triticale', 'Spelt', 'Semolina', 'Couscous', 
        'Regular pasta', 'Most breads', 'Many cereals', 'Beer', 'Some soy sauces'
      ],
      alternativesTitle: 'Gluten-Free Options',
      alternatives: [
        'Rice', 'Quinoa', 'Corn', 'Potatoes', 'Buckwheat', 'Amaranth', 'Millet', 
        'Gluten-free pasta', 'Gluten-free bread', 'Gluten-free flours'
      ],
      hiddenLabels: ['Maltodextrin', 'Modified food starch', 'Hydrolyzed plant protein', 'Textured vegetable protein']
    },
    {
      id: 'nuts',
      name: 'Tree Nuts',
      icon: '🌰',
      description: 'Includes walnuts, almonds, cashews, pistachios, hazelnuts, pecans, and related products.',
      avoid: [
        'Walnuts', 'Almonds', 'Cashews', 'Pistachios', 'Hazelnuts', 
        'Pecans', 'Brazil nuts', 'Macadamias', 'Pine nuts', 'Nut oils',
        'Nut butters', 'Marzipan', 'Praline'
      ],
      alternativesTitle: 'Nut Alternatives',
      alternatives: [
        'Seeds (sunflower, pumpkin, sesame)', 'Seed butters', 
        'Roasted chickpeas', 'Coconut (not a true nut)', 'Soy nuts'
      ],
      hiddenLabels: ['Natural flavoring (may contain)', 'Nougat', 'Gianduja', 'Mortadella']
    },
    {
      id: 'peanuts',
      name: 'Peanuts',
      icon: '🥜',
      description: 'A legume often processed with tree nuts, causing severe allergic reactions in some people.',
      avoid: [
        'Peanuts', 'Peanut butter', 'Peanut oil', 'Many Asian dishes',
        'Some baked goods', 'Some candies', 'Some energy bars'
      ],
      alternativesTitle: 'Peanut Alternatives',
      alternatives: [
        'Sunflower seed butter', 'Almond butter (if tree nuts allowed)', 
        'Soy butter', 'Chickpea butter', 'Pea butter'
      ],
      hiddenLabels: ['Arachis oil', 'Beer nuts', 'Ground nuts', 'Mandelonas', 'Mixed nuts']
    },
    {
      id: 'shellfish',
      name: 'Shellfish',
      icon: '🦐',
      description: 'Includes crustaceans like shrimp, crab, and lobster, which often cause severe allergic reactions.',
      avoid: [
        'Shrimp', 'Crab', 'Lobster', 'Crawfish/Crayfish', 'Prawns',
        'Some fish sauces', 'Some Asian dishes', 'Seafood flavoring'
      ],
      alternativesTitle: 'Shellfish Alternatives',
      alternatives: [
        'Fish (if not allergic)', 'Plant-based seafood alternatives', 
        'Jackfruit (for texture)', 'Hearts of palm', 'Tofu'
      ],
      hiddenLabels: ['Glucosamine', 'Crab extract', 'Surimi', 'Bouillabaisse', 'Cioppino']
    },
    {
      id: 'eggs',
      name: 'Eggs',
      icon: '🥚',
      description: 'Both egg whites and yolks can cause allergic reactions, affecting ability to eat baked goods and more.',
      avoid: [
        'Eggs', 'Many baked goods', 'Mayonnaise', 'Some dressings',
        'Meringue', 'Some pasta', 'Some breaded foods', 'Custards'
      ],
      alternativesTitle: 'Egg Alternatives',
      alternatives: [
        'Applesauce (for baking)', 'Banana (for baking)', 'Commercial egg replacers', 
        'Flaxseed + water', 'Chia seed + water', 'Silken tofu (in some recipes)'
      ],
      hiddenLabels: ['Albumin', 'Globulin', 'Lecithin', 'Lysozyme', 'Vitellin', 'Simplesse']
    },
    {
      id: 'soy',
      name: 'Soy',
      icon: '🫘',
      description: 'A legume found in tofu, soy sauce, many processed foods, vegetarian alternatives, and more.',
      avoid: [
        'Soybeans', 'Edamame', 'Tofu', 'Tempeh', 'Soy milk',
        'Soy sauce', 'Many vegetarian meat alternatives',
        'Many processed foods', 'Some oils'
      ],
      alternativesTitle: 'Soy Alternatives',
      alternatives: [
        'Coconut aminos (for soy sauce)', 'Hemp milk', 'Pea protein products', 
        'Beans and legumes', 'Seitan (if gluten allowed)'
      ],
      hiddenLabels: ['Textured vegetable protein', 'Hydrolyzed vegetable protein', 'Lecithin', 'Miso', 'Glycine max']
    },
    {
      id: 'fish',
      name: 'Fish',
      icon: '🐟',
      description: 'All types of finned fish, including salmon, tuna, cod, tilapia, and their byproducts.',
      avoid: [
        'All fish', 'Fish oil supplements', 'Worcester sauce', 
        'Caesar dressings', 'Some Asian sauces', 'Some vitamins'
      ],
      alternativesTitle: 'Fish Alternatives',
      alternatives: [
        'Plant-based fish alternatives', 'Algae-based omega-3 supplements', 
        'Tofu (for protein)', 'Jackfruit or hearts of palm (for texture)'
      ],
      hiddenLabels: ['Surimi', 'Fish stock', 'Fishmeal', 'Caviar', 'Anchovy', 'Caesar dressing']
    }
  ];

  // Common foods that contain multiple allergens
  const crossContaminationInfo = [
    {
      category: "Baked Goods",
      examples: "Cookies, cakes, pastries, bread",
      commonAllergens: ["gluten", "dairy", "eggs", "nuts", "soy"]
    },
    {
      category: "Processed Foods",
      examples: "Sauces, soups, frozen meals, snack foods",
      commonAllergens: ["gluten", "dairy", "soy", "nuts", "eggs"]
    },
    {
      category: "Desserts",
      examples: "Ice cream, pudding, custard, chocolates",
      commonAllergens: ["dairy", "eggs", "nuts", "soy", "gluten"]
    },
    {
      category: "Breakfast Foods",
      examples: "Cereals, granola, waffles, pancake mixes",
      commonAllergens: ["gluten", "dairy", "nuts", "soy"]
    },
    {
      category: "Condiments & Sauces",
      examples: "Mayonnaise, salad dressings, marinades",
      commonAllergens: ["eggs", "soy", "fish", "dairy", "gluten"]
    }
  ];

  // Tips for managing allergies
  const allergyManagementTips = [
    {
      title: "Always Read Labels",
      content: "Ingredients can change in products over time. Make it a habit to read food labels every time, even for foods you've bought before."
    },
    {
      title: "Ask About Ingredients",
      content: "When dining out, always inform your server about your allergies and ask about ingredients and preparation methods."
    },
    {
      title: "Be Cautious with Bulk Bins",
      content: "Avoid bulk bin foods as they can easily be cross-contaminated with allergens from scoops being shared between bins."
    },
    {
      title: "Check for Advisory Statements",
      content: "Look for warnings like 'May contain traces of...' or 'Processed in a facility that also processes...' if you have severe allergies."
    },
    {
      title: "Create an Emergency Plan",
      content: "If you have severe allergies, create and share an emergency plan with friends and family. Consider wearing a medical alert bracelet."
    },
    {
      title: "Cook from Scratch",
      content: "The best way to control ingredients is to prepare meals from scratch whenever possible."
    }
  ];

  // Load saved allergens from localStorage when component mounts
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`foodAllergies_${user.id}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSelectedAllergens(parsedData.allergens || []);
        setShowMealPlanAlerts(parsedData.showAlerts || false);
        setSavedAllergens(parsedData.allergens || []);
      }
    }
  }, [user]);

  // Handle allergen selection
  const toggleAllergen = (allergenId) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };

  // Handle alerts toggle
  const toggleAlerts = () => {
    setShowMealPlanAlerts(prev => !prev);
  };

  // Save allergen preferences
  const savePreferences = () => {
    if (!user) {
      setMessage('Please log in to save your preferences');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const dataToSave = {
      allergens: selectedAllergens,
      showAlerts: showMealPlanAlerts,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`foodAllergies_${user.id}`, JSON.stringify(dataToSave));
    setSavedAllergens(selectedAllergens);
    
    setMessage('Preferences saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Reset to last saved preferences
  const resetToSaved = () => {
    setSelectedAllergens(savedAllergens);
    setMessage('Reverted to last saved preferences');
    setTimeout(() => setMessage(''), 3000);
  };

  // Check if an allergen is active
  const isAllergenActive = (allergenId) => selectedAllergens.includes(allergenId);

  // Filter cross-contamination info based on selected allergens
  const relevantCrossContamination = crossContaminationInfo.filter(item => 
    item.commonAllergens.some(allergen => selectedAllergens.includes(allergen))
  );

  return (
    <div className="food-allergy-awareness">
      <h2>Food Allergy Awareness Tool</h2>
      <p className="tool-description">
        Manage food allergies by selecting allergens to avoid, learning about hidden ingredients,
        and getting tips for safer meal planning and grocery shopping.
      </p>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'allergens' ? 'tab-active' : ''}
          onClick={() => setActiveTab('allergens')}
        >
          Select Allergens
        </button>
        <button 
          className={activeTab === 'avoidance' ? 'tab-active' : ''}
          onClick={() => setActiveTab('avoidance')}
          disabled={selectedAllergens.length === 0}
        >
          Foods to Avoid
        </button>
        <button 
          className={activeTab === 'alternatives' ? 'tab-active' : ''}
          onClick={() => setActiveTab('alternatives')}
          disabled={selectedAllergens.length === 0}
        >
          Alternatives
        </button>
        <button 
          className={activeTab === 'labels' ? 'tab-active' : ''}
          onClick={() => setActiveTab('labels')}
        >
          Label Reading
        </button>
        <button 
          className={activeTab === 'tips' ? 'tab-active' : ''}
          onClick={() => setActiveTab('tips')}
        >
          Management Tips
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'allergens' && (
          <div className="allergens-selection">
            <h3>Select Your Allergens</h3>
            <p>Choose all the food allergens that apply to you or your family:</p>
            
            <div className="allergen-grid">
              {allergenOptions.map(allergen => (
                <div 
                  key={allergen.id} 
                  className={`allergen-card ${isAllergenActive(allergen.id) ? 'active' : ''}`}
                  onClick={() => toggleAllergen(allergen.id)}
                >
                  <span className="allergen-icon">{allergen.icon}</span>
                  <h4>{allergen.name}</h4>
                  <p>{allergen.description}</p>
                </div>
              ))}
            </div>
            
            <div className="alerts-option">
              <label className="alert-checkbox">
                <input 
                  type="checkbox" 
                  checked={showMealPlanAlerts} 
                  onChange={toggleAlerts}
                />
                <span>Show alerts when meal planning with allergens</span>
              </label>
            </div>
            
            <div className="action-buttons">
              <button onClick={savePreferences} className="save-button">Save Preferences</button>
              {savedAllergens.length > 0 && (
                <button onClick={resetToSaved} className="reset-button">Reset to Saved</button>
              )}
            </div>
            
            {message && <p className="message">{message}</p>}
          </div>
        )}
        
        {activeTab === 'avoidance' && selectedAllergens.length > 0 && (
          <div className="foods-to-avoid">
            <h3>Foods to Avoid</h3>
            <p>Based on your selected allergens, avoid these foods and ingredients:</p>
            
            {selectedAllergens.map(allergenId => {
              const allergen = allergenOptions.find(a => a.id === allergenId);
              return (
                <div key={allergen.id} className="allergen-section">
                  <h4>{allergen.icon} {allergen.name}</h4>
                  <ul className="avoid-list">
                    {allergen.avoid.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {relevantCrossContamination.length > 0 && (
              <div className="cross-contamination">
                <h4>⚠️ High-Risk Food Categories</h4>
                <p>These food categories commonly contain or have cross-contamination with your allergens:</p>
                
                <div className="risk-list">
                  {relevantCrossContamination.map((item, idx) => (
                    <div key={idx} className="risk-item">
                      <h5>{item.category}</h5>
                      <p><strong>Examples:</strong> {item.examples}</p>
                      <p><strong>May contain:</strong> {item.commonAllergens.map(a => {
                        const allergen = allergenOptions.find(opt => opt.id === a);
                        return allergen && selectedAllergens.includes(a) ? 
                          <span key={a} className="contained-allergen">{allergen.name}</span> : null;
                      })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'alternatives' && selectedAllergens.length > 0 && (
          <div className="alternatives">
            <h3>Safe Alternatives</h3>
            <p>Here are alternative foods and ingredients for your allergies:</p>
            
            {selectedAllergens.map(allergenId => {
              const allergen = allergenOptions.find(a => a.id === allergenId);
              return (
                <div key={allergen.id} className="alternative-section">
                  <h4>{allergen.icon} {allergen.alternativesTitle}</h4>
                  <ul className="alternative-list">
                    {allergen.alternatives.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'labels' && (
          <div className="label-reading">
            <h3>How to Read Food Labels</h3>
            <p>Identifying allergens on food packaging can be challenging. Here's what to look for:</p>
            
            <div className="label-tips">
              <div className="label-tip">
                <h4>📋 Check the Ingredients List</h4>
                <p>By law, major allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans) must be clearly listed in the ingredients.</p>
              </div>
              
              <div className="label-tip">
                <h4>⚠️ Look for "Contains" Statements</h4>
                <p>Many products include a "Contains" statement below the ingredients list that summarizes major allergens present.</p>
              </div>
              
              <div className="label-tip">
                <h4>⚠️ Check for Advisory Statements</h4>
                <p>"May contain," "Processed in a facility that also processes," or "Made on equipment shared with" warnings indicate possible cross-contamination.</p>
              </div>
              
              <div className="label-tip">
                <h4>🔍 Watch for Hidden Allergens</h4>
                <p>Some ingredients may contain allergens without explicitly stating them. Learn to identify these terms:</p>
              </div>
            </div>
            
            <h4>Hidden Allergen Terms on Labels</h4>
            <div className="hidden-allergens">
              {selectedAllergens.length > 0 ? (
                selectedAllergens.map(allergenId => {
                  const allergen = allergenOptions.find(a => a.id === allergenId);
                  return (
                    <div key={allergen.id} className="hidden-allergen-section">
                      <h5>{allergen.icon} {allergen.name} may be hidden as:</h5>
                      <ul className="hidden-terms-list">
                        {allergen.hiddenLabels.map((term, idx) => (
                          <li key={idx}>{term}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ) : (
                allergenOptions.map(allergen => (
                  <div key={allergen.id} className="hidden-allergen-section">
                    <h5>{allergen.icon} {allergen.name} may be hidden as:</h5>
                    <ul className="hidden-terms-list">
                      {allergen.hiddenLabels.map((term, idx) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'tips' && (
          <div className="management-tips">
            <h3>Allergy Management Tips</h3>
            <p>Practical advice for living with food allergies:</p>
            
            <div className="tips-grid">
              {allergyManagementTips.map((tip, idx) => (
                <div key={idx} className="tip-card">
                  <h4>{tip.title}</h4>
                  <p>{tip.content}</p>
                </div>
              ))}
            </div>
            
            <div className="emergency-plan">
              <h4>🚨 Emergency Preparedness</h4>
              <p>For severe allergies, always:</p>
              <ul>
                <li>Carry prescribed emergency medication (like an epinephrine auto-injector)</li>
                <li>Wear medical ID jewelry that identifies your allergy</li>
                <li>Make sure friends, family, and coworkers know about your allergy and emergency plan</li>
                <li>Know the symptoms of anaphylaxis and when to seek emergency help</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodAllergyAwareness; 