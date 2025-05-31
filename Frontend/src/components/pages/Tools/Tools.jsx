import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Tools.css';

// Import microservices
import { HeartRateGuide, BloodPressureTracker, SpO2Tracker, RespiratoryRateLogger, BodyTemperatureTracker, WeightLogger, BodyFatEstimator, WaistToHipRatio, CalorieBurnEstimator, PostureSelfTest, DailyMoodTracker, StressAnxietyCheck, DepressionCheck, SleepQualityChecker, MentalFatigueChecker, DailyCalorieTracker, MacronutrientCalculator, WaterIntakeTracker, MealPlanner, IntermittentFastingTimer, FoodAllergyAwareness, MenstrualCycleTracker, FertilityTracker, PMSSymptomLogger, PregnancyGuide, PCOSSymptomChecker, SafeSexEducationQuiz, ConsentAwarenessTool, EDPerformanceAssessment, VaginalHealthGuide } from './microservices';

function Tools() {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const navigate = useNavigate();
  
  // State to track which microservice is active
  const [activeMicroservice, setActiveMicroservice] = useState(null);
  
  // Example categories for health tools
  const categories = [
    {
      id: 1,
      name: "🩺 Vital Signs Monitoring Tools",
      description: "These tools help users check or log their most essential health metrics at home or with simple devices."
    },
    {
      id: 2,
      name: "🏃‍♂️ Body Metrics & Fitness Tools",
      description: "These tools focus on physical body measurements, fitness tracking, and health goals to improve general wellness."
    },
    {
      id: 3,
      name: "🧠 Mental Health & Wellness Tools",
      description: "These tools support users in monitoring mood, managing stress, and improving overall emotional health through check-ins and guided activities."
    },
    {
      id: 4,
      name: "🍎 Nutrition & Diet Tools",
      description: "These services help users track what they eat, understand their nutritional needs, and create healthier food routines."
    },
    {
      id: 5,
      name: "👩‍⚕️ Women's Health Tools",
      description: "This category supports women through different phases of health — menstruation, fertility, pregnancy, and menopause — with personalized trackers and guides."
    },
    {
      id: 6,
      name: "❤️ Sexual Health & Intimacy Tools",
      description: "Promotes safe, informed, and respectful sexual well-being — including protection, consent awareness, and intimacy-related tracking and education."
    }
  ];

  // Example microservices (will be implemented later)
  const microservices = [
    {
      id: 1,
      name: "🔹 Heart Rate Guide & Logger",
      description: "Instructions to check pulse, log BPM, and track your heart rate history",
      category: 1,
      icon: "❤️",
      isAvailable: true,
      component: HeartRateGuide
    },
    {
      id: 3,
      name: "🔹 Blood Pressure Tracker",
      description: "Enter systolic/diastolic values, view status, and get tips to reduce high BP",
      category: 1,
      icon: "🩸",
      isAvailable: true,
      component: BloodPressureTracker
    },
    {
      id: 4,
      name: "🔹 SpO2 Oxygen Tracker",
      description: "Monitor and record your blood oxygen levels using a pulse oximeter",
      category: 1,
      icon: "💨",
      isAvailable: true,
      component: SpO2Tracker
    },
    {
      id: 8,
      name: "🔹 Respiratory Rate Logger",
      description: "Count breaths per minute and track your respiratory health",
      category: 1,
      icon: "🫁",
      isAvailable: true,
      component: RespiratoryRateLogger
    },
    {
      id: 9,
      name: "🔹 Body Temperature Tracker",
      description: "Record temperature in °C or °F and check if it's normal, low, or fever",
      category: 1,
      icon: "🌡️",
      isAvailable: true,
      component: BodyTemperatureTracker
    },
    {
      id: 10,
      name: "🔹 Weight Logger with BMI Calculation",
      description: "Enter weight, height, and see your BMI + category (underweight/normal/overweight/obese) with history graph",
      category: 1,
      icon: "⚖️",
      isAvailable: true,
      component: WeightLogger
    },
    {
      id: 11,
      name: "🔹 Body Fat Percentage Estimator",
      description: "Estimate body fat % using Navy formula or visual slider, and see your fitness level",
      category: 2,
      icon: "📏",
      isAvailable: true,
      component: BodyFatEstimator
    },
    {
      id: 12,
      name: "🔹 Waist-to-Hip Ratio Checker",
      description: "Calculate your waist-to-hip ratio and assess cardiovascular health risk (low, moderate, high)",
      category: 2,
      icon: "📊",
      isAvailable: true,
      component: WaistToHipRatio
    },
    {
      id: 13,
      name: "🔹 Calorie Burn Estimator",
      description: "Choose activities like running, walking, or cycling and calculate calories burned based on time or distance",
      category: 2,
      icon: "🔥",
      isAvailable: true,
      component: CalorieBurnEstimator
    },
    {
      id: 14,
      name: "🔹 Posture Self-Test",
      description: "Guide and survey to assess your posture type with personalized recommendations",
      category: 2,
      icon: "🧍",
      isAvailable: true,
      component: PostureSelfTest
    },
    {
      id: 15,
      name: "🔹 Daily Mood Tracker",
      description: "Track your mood with emoji-style inputs, add tags, and view mood trends over time",
      category: 3,
      icon: "😊",
      isAvailable: true,
      component: DailyMoodTracker
    },
    {
      id: 16,
      name: "🔹 Stress & Anxiety Check (GAD-7)",
      description: "A quick 7-question survey that measures anxiety levels and provides self-help tips",
      category: 3,
      icon: "😰",
      isAvailable: true,
      component: StressAnxietyCheck
    },
    {
      id: 17,
      name: "🔹 Depression Check (PHQ-9)",
      description: "A 9-question depression screening tool that measures depressive symptoms and offers resources",
      category: 3,
      icon: "😔",
      isAvailable: true,
      component: DepressionCheck
    },
    {
      id: 18,
      name: "🔹 Sleep Quality Checker",
      description: "Track your sleep quality and get personalized tips for better rest",
      category: 3,
      icon: "😴",
      isAvailable: true,
      component: SleepQualityChecker
    },
    {
      id: 19,
      name: "🔹 Mental Fatigue Checker",
      description: "Assess your current mental load and get personalized recommendations",
      category: 3,
      icon: "🧠",
      isAvailable: true,
      component: MentalFatigueChecker
    },
    {
      id: 7,
      name: "Sleep Tracker",
      description: "Monitor your sleep patterns and quality",
      category: 1,
      icon: "😴",
      isAvailable: false,
      component: null
    },
    {
      id: 20,
      name: "🔹 Daily Calorie Tracker",
      description: "Input meals and estimated calorie count, track daily goals, and visualize your progress.",
      category: 4,
      icon: "🍽️",
      isAvailable: true,
      component: DailyCalorieTracker
    },
    {
      id: 21,
      name: "🔹 Macronutrient Split Calculator",
      description: "Calculate recommended protein, carbs, and fats based on your body weight and fitness goals.",
      category: 4,
      icon: "📊",
      isAvailable: true,
      component: MacronutrientCalculator
    },
    {
      id: 22,
      name: "🔹 Water Intake Tracker",
      description: "Set daily hydration goals, log your water consumption, and visualize your progress.",
      category: 4,
      icon: "💧",
      isAvailable: true,
      component: WaterIntakeTracker
    },
    {
      id: 23,
      name: "🔹 Meal Planner",
      description: "Select dietary preferences to generate personalized meal plans and shopping lists.",
      category: 4,
      icon: "📝",
      isAvailable: true,
      component: MealPlanner
    },
    {
      id: 24,
      name: "🔹 Intermittent Fasting Timer",
      description: "Track your fasting periods, set custom schedules, and monitor your fasting progress.",
      category: 4,
      icon: "⏱️",
      isAvailable: true,
      component: IntermittentFastingTimer
    },
    {
      id: 25,
      name: "🔹 Food Allergy Awareness Tool",
      description: "Manage food allergies by selecting allergens to avoid, learning about hidden ingredients, and getting safety tips.",
      category: 4,
      icon: "🍽️",
      isAvailable: true,
      component: FoodAllergyAwareness
    },
    // Women's Health Tools - Category 5
    {
      id: 26,
      name: "🔹 Menstrual Cycle Tracker",
      description: "Log period start and end dates, flow intensity, symptoms, and predict your next cycle.",
      category: 5,
      icon: "📅",
      isAvailable: true,
      component: MenstrualCycleTracker
    },
    {
      id: 27,
      name: "🔹 Ovulation & Fertility Tracker",
      description: "Track your fertile window, basal body temperature, and days with high conception probability.",
      category: 5,
      icon: "🥚",
      isAvailable: true,
      component: FertilityTracker
    },
    {
      id: 28,
      name: "🔹 PMS Symptom Logger",
      description: "Track PMS symptoms like mood swings, cravings, and bloating with severity ratings and management tips.",
      category: 5,
      icon: "📊",
      isAvailable: true,
      component: PMSSymptomLogger
    },
    {
      id: 29,
      name: "🔹 Pregnancy Week-by-Week Guide",
      description: "Get fetal development updates, nutrition tips, and checkup reminders based on due date.",
      category: 5,
      icon: "👶",
      isAvailable: true,
      component: PregnancyGuide
    },
    {
      id: 30,
      name: "🔹 PCOS Symptom Checker",
      description: "Complete a questionnaire about PCOS symptoms and receive risk assessment and educational resources.",
      category: 5,
      icon: "👩‍⚕️",
      isAvailable: true,
      component: PCOSSymptomChecker
    },
    // Sexual Health & Intimacy Tools - Category 6
    {
      id: 31,
      name: "🔹 Safe Sex Education & Quiz",
      description: "Interactive guide on protection methods: condoms, dental dams, PrEP, etc. with quiz to test understanding and debunk myths.",
      category: 6,
      icon: "🛡️",
      isAvailable: true,
      component: SafeSexEducationQuiz
    },
    {
      id: 32,
      name: "🔹 Consent Awareness Tool",
      description: "Micro-course on verbal/non-verbal consent and boundaries with scenario-based Q&A and a completion certificate.",
      category: 6,
      icon: "✓",
      isAvailable: true,
      component: ConsentAwarenessTool
    },
    {
      id: 33,
      name: "🔹 ED & Performance Self-Assessment",
      description: "Anonymous survey on erection quality, frequency, and confidence with personalized advice and natural improvement tips.",
      category: 6,
      icon: "📋",
      isAvailable: true,
      component: EDPerformanceAssessment
    },
    {
      id: 34,
      name: "🔹 Vaginal Health Guide",
      description: "Information on normal discharge, infections, pH balance with symptoms checklist and guidance on when to see a gynecologist.",
      category: 6,
      icon: "🩺",
      isAvailable: true,
      component: VaginalHealthGuide
    }
  ];

  // Handle opening a microservice
  const handleOpenMicroservice = (serviceId) => {
    const service = microservices.find(ms => ms.id === serviceId);
    if (service && service.component) {
      setActiveMicroservice(service);
    } else {
      // If component not implemented yet
      alert('This tool is coming soon!');
    }
  };

  // Handle closing a microservice
  const handleCloseMicroservice = () => {
    setActiveMicroservice(null);
  };
  
  // Function to handle auth redirect with specific tab
  const handleAuthRedirect = (tab) => {
    // Navigate to home and show auth modal
    navigate('/', { state: { showAuth: true, authTab: tab } });
  };

  return (
    <div className="tools-container" id="tools-section">
      {activeMicroservice ? (
        <div className="microservice-wrapper">
          <button className="back-button" onClick={handleCloseMicroservice}>
            &larr; Back to Tools
          </button>
          {React.createElement(activeMicroservice.component)}
        </div>
      ) : (
        <>
          <h1>Health Tools</h1>
          <p   style={{ color: 'white' }}className="tools-intro">
            Discover a collection of useful tools and utilities to help you monitor and improve
            your health. These tools are designed to be user-friendly and effective
            for tracking various health metrics.
          </p>
          
          {categories.map(category => {
            // Filter microservices for this category
            const categoryMicroservices = microservices.filter(
              ms => ms.category === category.id && ms.isAvailable
            );
            
            // Only render category if it has available microservices
            if (categoryMicroservices.length === 0) return null;
            
            // Limit to 2 services per category for unauthenticated users
            const displayedMicroservices = user 
              ? categoryMicroservices 
              : categoryMicroservices.slice(0, 2);
            
            // Get count of hidden services
            const hiddenCount = categoryMicroservices.length - displayedMicroservices.length;
            
            return (
              <div key={category.id} className="tools-category">
                <h2 className="category-title">{category.name}</h2>
                <p className="category-description">{category.description}</p>
                
                <div className="tools-grid">
                  {displayedMicroservices.map(service => (
                    <div key={service.id} className="tool-card">
                      <div className="tool-icon">{service.icon}</div>
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                      <button 
                        className="tool-button"
                        onClick={() => handleOpenMicroservice(service.id)}
                      >
                        Open
                      </button>
                    </div>
                  ))}
                  
                  {/* Show 'locked' card if there are hidden services */}
                  {!user && hiddenCount > 0 && (
                    <div className="tool-card locked-card">
                      <div className="tool-icon">🔒</div>
                      <h3>{hiddenCount} More Tools Available</h3>
                      <p>Create a free account to access all health tools and save your progress.</p>
                      <button 
                        className="tool-button"
                        onClick={() => handleAuthRedirect('register')}
                      >
                        Register to Access
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {!user && (
            <div className="login-prompt-container" onClick={() => handleAuthRedirect('login')}>
              <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
                <div className="lock-icon">🔒</div>
                <h3>Access All Health Tools</h3>
                <p>
                  Sign in or register to unlock all health monitoring tools and save your personal health data securely.
                </p>
                <div className="login-buttons">
                  <button 
                    className="login-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuthRedirect('login');
                    }}
                  >
                    Login to Continue
                  </button>
                  <button 
                    className="register-link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuthRedirect('register');
                    }}
                  >
                    Create an Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Tools;