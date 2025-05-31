import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './VaginalHealthGuide.css';

const VaginalHealthGuide = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  const [activeSection, setActiveSection] = useState('intro');
  const [checkedSymptoms, setCheckedSymptoms] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState(null);

  // Load saved data if user is logged in
  useEffect(() => {
    if (user && user._id) {
      // This would normally fetch from backend
      const savedUserData = localStorage.getItem(`vaginal_health_${user._id}`);
      if (savedUserData) {
        try {
          const parsedData = JSON.parse(savedUserData);
          setSavedData(parsedData);
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }
    }
  }, [user]);

  // Common symptoms and conditions
  const normalDischarges = [
    {
      type: "Clear and Stretchy",
      description: "Similar to raw egg whites. Usually occurs during ovulation to help sperm reach the egg.",
      advice: "This is a sign of fertility and is perfectly normal."
    },
    {
      type: "White and Creamy",
      description: "May appear before and after your period. Typically has little to no odor.",
      advice: "This is normal and varies throughout your cycle."
    },
    {
      type: "Brown or Blood-Tinged",
      description: "May appear at the beginning or end of your period, or after intercourse.",
      advice: "Usually normal, but if persistent or heavy outside your period, consult a doctor."
    },
    {
      type: "Clear and Watery",
      description: "Can occur at different times of the month, often after exercise.",
      advice: "This is a normal type of discharge."
    },
    {
      type: "Yellow or Green",
      description: "When slight and without odor, can sometimes be normal.",
      advice: "If accompanied by strong odor, itching, or pain, consult a healthcare provider."
    }
  ];

  const commonConditions = [
    {
      name: "Bacterial Vaginosis (BV)",
      symptoms: [
        "Thin, grayish-white discharge",
        "Fishy odor, especially after intercourse",
        "Burning during urination",
        "Itching around the vaginal opening"
      ],
      advice: "BV is an overgrowth of bacteria normally found in the vagina. It can be treated with antibiotics prescribed by a healthcare provider."
    },
    {
      name: "Yeast Infection",
      symptoms: [
        "Thick, white, cottage cheese-like discharge",
        "Intense itching and irritation",
        "Redness and swelling of the vulva",
        "Burning during urination or intercourse",
        "Little to no odor"
      ],
      advice: "Yeast infections are caused by an overgrowth of the fungus Candida. Over-the-counter treatments are available, but see a doctor if it's your first yeast infection or symptoms don't improve."
    },
    {
      name: "Trichomoniasis",
      symptoms: [
        "Frothy, yellow-green discharge with a strong odor",
        "Genital itching and redness",
        "Burning during urination",
        "Discomfort during intercourse"
      ],
      advice: "Trichomoniasis is a common sexually transmitted infection (STI) that requires prescription medication. Both you and your partner(s) need treatment."
    },
    {
      name: "Chlamydia/Gonorrhea",
      symptoms: [
        "Increased discharge that may be yellow or cloudy",
        "Bleeding between periods",
        "Pelvic pain",
        "Burning during urination",
        "Often has no symptoms"
      ],
      advice: "These are STIs that require antibiotic treatment. Visit a healthcare provider for testing and treatment. All sexual partners should be tested."
    }
  ];

  const symptomChecklist = [
    {
      id: "abnormal_discharge",
      text: "Unusual vaginal discharge (color, consistency, amount, or odor)"
    },
    {
      id: "itching",
      text: "Itching or irritation around the vagina or vulva"
    },
    {
      id: "odor",
      text: "Unusual or unpleasant vaginal odor"
    },
    {
      id: "pain_urination",
      text: "Pain or burning during urination"
    },
    {
      id: "pain_intercourse",
      text: "Pain during or after sexual intercourse"
    },
    {
      id: "bleeding",
      text: "Unexpected vaginal bleeding or spotting between periods"
    },
    {
      id: "pelvic_pain",
      text: "Pelvic pain or pressure"
    },
    {
      id: "redness",
      text: "Redness, swelling, or rash in the vaginal area"
    },
    {
      id: "recurrent",
      text: "Recurrent issues (symptoms that keep coming back)"
    }
  ];

  const pHTips = [
    {
      title: "Maintain Proper Hygiene",
      tips: [
        "Wash the external genital area with warm water only or a mild, unscented soap",
        "Avoid douching, which disrupts the natural pH balance",
        "Change out of wet clothing (like swimsuits or sweaty workout clothes) promptly",
        "Wear breathable cotton underwear"
      ]
    },
    {
      title: "Sexual Health Practices",
      tips: [
        "Use condoms to prevent exposure to semen, which is alkaline and can alter vaginal pH",
        "Urinate before and after sexual activity to help flush bacteria",
        "Clean sex toys thoroughly according to manufacturer instructions",
        "Wash hands before intimate contact"
      ]
    },
    {
      title: "Diet and Lifestyle",
      tips: [
        "Stay hydrated to support overall vaginal health",
        "Consider probiotic-rich foods like yogurt, kefir, and fermented vegetables",
        "Limit sugar intake, as excess sugar can feed yeast",
        "Manage stress, which can affect immune function"
      ]
    }
  ];

  const handleSymptomCheck = (symptomId) => {
    setCheckedSymptoms(prev => ({
      ...prev,
      [symptomId]: !prev[symptomId]
    }));
  };

  const getCheckedSymptomsCount = () => {
    return Object.values(checkedSymptoms).filter(value => value).length;
  };

  const handleSaveData = async () => {
    if (!user) {
      setSaveMessage('You must be logged in to save your data');
      return;
    }

    setIsSaving(true);
    try {
      // Create data object to save
      const dataToSave = {
        checkedSymptoms,
        timestamp: new Date().toISOString()
      };
      
      // This would normally be an API call to save to backend
      // For now, we'll use localStorage
      localStorage.setItem(`vaginal_health_${user._id}`, JSON.stringify(dataToSave));
      
      setSaveMessage('Your data has been saved successfully');
      setSavedData(dataToSave);
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveMessage('There was an error saving your data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedData = () => {
    if (savedData) {
      setCheckedSymptoms(savedData.checkedSymptoms || {});
      setActiveSection('checklist');
    }
  };

  const renderIntro = () => {
    return (
      <div className="vh-intro">
        <h2>Vaginal Health Guide</h2>
        <div className="vh-notice">
          <p><strong>Privacy Notice:</strong> Any information entered is private and used only to provide personalized guidance. If logged in, your data is securely stored for future reference.</p>
        </div>
        
        <div className="vh-intro-content">
          <p>This guide provides evidence-based information about vaginal health, normal discharge variations, common conditions, and when to seek medical care.</p>
          
          <ul>
            <li>Learn about normal variations in vaginal discharge throughout your cycle</li>
            <li>Understand common vaginal conditions and their symptoms</li>
            <li>Complete a symptoms checklist to determine if you should consult a healthcare provider</li>
            <li>Get tips for maintaining optimal vaginal pH and health</li>
          </ul>
          
          <p><strong>Remember:</strong> This tool is for educational purposes only and does not replace professional medical advice or diagnosis.</p>
        </div>
        
        <div className="vh-intro-actions">
          {savedData && (
            <button 
              onClick={handleLoadSavedData}
              className="secondary-button"
            >
              View Saved Information
            </button>
          )}
          
          <button 
            onClick={() => setActiveSection('normal')}
            className="primary-button"
          >
            Start Guide
          </button>
        </div>
      </div>
    );
  };

  const renderNormalVariations = () => {
    return (
      <div className="vh-normal">
        <h2>Normal Vaginal Discharge Variations</h2>
        <p className="section-description">
          Vaginal discharge naturally changes in appearance and amount throughout your menstrual cycle due to hormonal fluctuations. Here are common normal variations:
        </p>
        
        <div className="discharge-grid">
          {normalDischarges.map((item, index) => (
            <div key={index} className="discharge-card">
              <h3>{item.type}</h3>
              <p className="discharge-description">{item.description}</p>
              <p className="discharge-advice">{item.advice}</p>
            </div>
          ))}
        </div>
        
        <div className="normal-facts">
          <h3>Important Facts About Normal Discharge</h3>
          <ul>
            <li>Discharge helps clean and moisturize the vagina</li>
            <li>The amount typically increases during ovulation and pregnancy</li>
            <li>Consistency and color naturally change throughout your cycle</li>
            <li>Normal discharge should not cause significant discomfort or irritation</li>
          </ul>
        </div>
        
        <div className="section-actions">
          <button 
            onClick={() => setActiveSection('intro')}
            className="secondary-button"
          >
            Back
          </button>
          
          <button 
            onClick={() => setActiveSection('conditions')}
            className="primary-button"
          >
            Next: Common Conditions
          </button>
        </div>
      </div>
    );
  };

  const renderCommonConditions = () => {
    return (
      <div className="vh-conditions">
        <h2>Common Vaginal Conditions</h2>
        <p className="section-description">
          Sometimes changes in vaginal discharge can indicate a condition that requires treatment. Here are common vaginal conditions and their typical symptoms:
        </p>
        
        <div className="conditions-grid">
          {commonConditions.map((condition, index) => (
            <div key={index} className="condition-card">
              <h3>{condition.name}</h3>
              <div className="symptoms">
                <h4>Common Symptoms:</h4>
                <ul>
                  {condition.symptoms.map((symptom, i) => (
                    <li key={i}>{symptom}</li>
                  ))}
                </ul>
              </div>
              <p className="condition-advice">{condition.advice}</p>
            </div>
          ))}
        </div>
        
        <div className="section-actions">
          <button 
            onClick={() => setActiveSection('normal')}
            className="secondary-button"
          >
            Back
          </button>
          
          <button 
            onClick={() => setActiveSection('checklist')}
            className="primary-button"
          >
            Next: Symptom Checklist
          </button>
        </div>
      </div>
    );
  };

  const renderSymptomChecklist = () => {
    const checkedCount = getCheckedSymptomsCount();
    let recommendationText = "";
    let recommendationClass = "";
    
    if (checkedCount >= 3) {
      recommendationText = "Based on your selections, we recommend consulting a healthcare provider for evaluation.";
      recommendationClass = "high-concern";
    } else if (checkedCount >= 1) {
      recommendationText = "Consider consulting a healthcare provider if these symptoms persist or worsen.";
      recommendationClass = "medium-concern";
    } else {
      recommendationText = "No symptoms selected. If you're still concerned, monitor for changes and consult a healthcare provider as needed.";
      recommendationClass = "low-concern";
    }
    
    return (
      <div className="vh-checklist">
        <h2>Vaginal Health Symptom Checklist</h2>
        <p className="section-description">
          Check any symptoms you're currently experiencing. This can help determine if you should consult a healthcare provider.
        </p>
        
        <div className="checklist-container">
          {symptomChecklist.map((symptom) => (
            <label 
              key={symptom.id} 
              className={`symptom-item ${checkedSymptoms[symptom.id] ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={checkedSymptoms[symptom.id] || false}
                onChange={() => handleSymptomCheck(symptom.id)}
              />
              <span className="symptom-text">{symptom.text}</span>
            </label>
          ))}
        </div>
        
        {Object.keys(checkedSymptoms).length > 0 && (
          <div className={`recommendation ${recommendationClass}`}>
            <h3>Recommendation</h3>
            <p>{recommendationText}</p>
          </div>
        )}
        
        <div className="section-actions">
          <button 
            onClick={() => setActiveSection('conditions')}
            className="secondary-button"
          >
            Back
          </button>
          
          <button 
            onClick={() => setActiveSection('phbalance')}
            className="primary-button"
          >
            Next: pH Balance Tips
          </button>
          
          {user && (
            <button 
              onClick={handleSaveData}
              className="save-button"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Checklist'}
            </button>
          )}
          
          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </div>
      </div>
    );
  };

  const renderPHBalance = () => {
    return (
      <div className="vh-phbalance">
        <h2>Maintaining Healthy Vaginal pH</h2>
        <p className="section-description">
          The vagina naturally maintains a slightly acidic pH (typically between 3.8 and 4.5), which helps protect against infections. Here are tips to support your vaginal pH balance:
        </p>
        
        <div className="ph-tips-grid">
          {pHTips.map((section, index) => (
            <div key={index} className="ph-card">
              <h3>{section.title}</h3>
              <ul>
                {section.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="when-to-see-doctor">
          <h3>When to See a Healthcare Provider</h3>
          <p>Make an appointment with a gynecologist or healthcare provider if you experience:</p>
          <ul>
            <li>Persistent or recurrent unusual discharge, odor, itching, or irritation</li>
            <li>Pain during urination or intercourse</li>
            <li>Unexplained vaginal bleeding</li>
            <li>Sores, bumps, or rashes in the genital area</li>
            <li>Pelvic pain</li>
            <li>Any symptoms that concern you</li>
          </ul>
          <p>Regular gynecological check-ups are recommended even when you don't have symptoms.</p>
        </div>
        
        <div className="section-actions">
          <button 
            onClick={() => setActiveSection('checklist')}
            className="secondary-button"
          >
            Back
          </button>
          
          <button 
            onClick={() => setActiveSection('intro')}
            className="primary-button"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return renderIntro();
      case 'normal':
        return renderNormalVariations();
      case 'conditions':
        return renderCommonConditions();
      case 'checklist':
        return renderSymptomChecklist();
      case 'phbalance':
        return renderPHBalance();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="vh-container">
      <h1>Vaginal Health Guide</h1>
      {renderContent()}
    </div>
  );
};

export default VaginalHealthGuide; 