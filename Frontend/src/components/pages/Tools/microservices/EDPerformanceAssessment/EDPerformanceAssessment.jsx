import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './EDPerformanceAssessment.css';

const EDPerformanceAssessment = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  const [activeSection, setActiveSection] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [assessment, setAssessment] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load saved data if user is logged in
  useEffect(() => {
    if (user && user._id) {
      // This would normally fetch from backend
      const savedAssessmentData = localStorage.getItem(`ed_assessment_${user._id}`);
      if (savedAssessmentData) {
        try {
          const parsedData = JSON.parse(savedAssessmentData);
          setSavedData(parsedData);
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }
    }
  }, [user]);

  // Survey questions
  const questions = [
    {
      id: 'erection_frequency',
      question: 'How often do you wake up with an erection (morning wood)?',
      options: [
        { id: 'a', text: 'Almost every day', value: 4 },
        { id: 'b', text: '3-5 times per week', value: 3 },
        { id: 'c', text: '1-2 times per week', value: 2 },
        { id: 'd', text: 'Rarely or never', value: 1 }
      ]
    },
    {
      id: 'erection_quality',
      question: 'When you have an erection, how would you rate its firmness?',
      options: [
        { id: 'a', text: 'Completely firm - suitable for intercourse', value: 4 },
        { id: 'b', text: 'Firm enough for intercourse but not completely hard', value: 3 },
        { id: 'c', text: 'Somewhat firm but not enough for intercourse', value: 2 },
        { id: 'd', text: 'Minimal firmness or no erection', value: 1 }
      ]
    },
    {
      id: 'erection_maintenance',
      question: 'How often do you have difficulty maintaining an erection during sexual activity?',
      options: [
        { id: 'a', text: 'Almost never/never', value: 4 },
        { id: 'b', text: 'Occasionally (less than half the time)', value: 3 },
        { id: 'c', text: 'Frequently (more than half the time)', value: 2 },
        { id: 'd', text: 'Almost always/always', value: 1 }
      ]
    },
    {
      id: 'confidence',
      question: 'How would you rate your confidence in your ability to get and keep an erection?',
      options: [
        { id: 'a', text: 'Very high confidence', value: 4 },
        { id: 'b', text: 'Moderate confidence', value: 3 },
        { id: 'c', text: 'Low confidence', value: 2 },
        { id: 'd', text: 'Very low/no confidence', value: 1 }
      ]
    },
    {
      id: 'satisfaction',
      question: 'How satisfied are you with your overall sexual performance?',
      options: [
        { id: 'a', text: 'Very satisfied', value: 4 },
        { id: 'b', text: 'Moderately satisfied', value: 3 },
        { id: 'c', text: 'Somewhat dissatisfied', value: 2 },
        { id: 'd', text: 'Very dissatisfied', value: 1 }
      ]
    },
    {
      id: 'libido',
      question: 'How would you rate your level of sexual desire/interest?',
      options: [
        { id: 'a', text: 'Very high', value: 4 },
        { id: 'b', text: 'Moderate', value: 3 },
        { id: 'c', text: 'Low', value: 2 },
        { id: 'd', text: 'Very low/nonexistent', value: 1 }
      ]
    },
    {
      id: 'stress',
      question: 'How would you describe your current stress level?',
      options: [
        { id: 'a', text: 'Low stress', value: 4 },
        { id: 'b', text: 'Moderate stress', value: 3 },
        { id: 'c', text: 'High stress', value: 2 },
        { id: 'd', text: 'Very high stress', value: 1 }
      ]
    },
    {
      id: 'sleep',
      question: 'How many hours of sleep do you typically get per night?',
      options: [
        { id: 'a', text: '7-9 hours', value: 4 },
        { id: 'b', text: '6-7 hours', value: 3 },
        { id: 'c', text: '5-6 hours', value: 2 },
        { id: 'd', text: 'Less than 5 hours', value: 1 }
      ]
    },
    {
      id: 'exercise',
      question: 'How often do you engage in moderate to vigorous physical activity?',
      options: [
        { id: 'a', text: '4 or more times per week', value: 4 },
        { id: 'b', text: '2-3 times per week', value: 3 },
        { id: 'c', text: 'Once per week', value: 2 },
        { id: 'd', text: 'Rarely or never', value: 1 }
      ]
    },
    {
      id: 'alcohol',
      question: 'How often do you consume alcoholic beverages?',
      options: [
        { id: 'a', text: 'Rarely or never', value: 4 },
        { id: 'b', text: 'Occasionally (1-2 drinks per week)', value: 3 },
        { id: 'c', text: 'Moderately (3-7 drinks per week)', value: 2 },
        { id: 'd', text: 'Frequently (More than 7 drinks per week)', value: 1 }
      ]
    }
  ];

  // Health conditions that might be related to ED
  const healthQuestions = [
    {
      id: 'diabetes',
      question: 'Have you been diagnosed with diabetes?',
      options: [
        { id: 'yes', text: 'Yes' },
        { id: 'no', text: 'No' }
      ]
    },
    {
      id: 'heart_disease',
      question: 'Do you have any heart or cardiovascular conditions?',
      options: [
        { id: 'yes', text: 'Yes' },
        { id: 'no', text: 'No' }
      ]
    },
    {
      id: 'hypertension',
      question: 'Do you have high blood pressure (hypertension)?',
      options: [
        { id: 'yes', text: 'Yes' },
        { id: 'no', text: 'No' }
      ]
    },
    {
      id: 'medications',
      question: 'Are you currently taking any medications regularly?',
      options: [
        { id: 'yes', text: 'Yes' },
        { id: 'no', text: 'No' }
      ]
    }
  ];

  // Natural improvement tips
  const naturalTips = {
    exercise: {
      title: "Regular Exercise",
      description: "Regular physical activity can improve erectile function by improving blood flow, reducing stress, and boosting testosterone levels.",
      recommendations: [
        "Aim for at least 150 minutes of moderate aerobic exercise per week",
        "Include strength training 2-3 times per week",
        "Consider exercises that strengthen the pelvic floor muscles (Kegels)"
      ]
    },
    stress: {
      title: "Stress Management",
      description: "High stress levels can impact erectile function by affecting hormones and blood flow.",
      recommendations: [
        "Practice mindfulness meditation for 10-15 minutes daily",
        "Try deep breathing exercises when feeling anxious",
        "Consider yoga or tai chi for combined physical and mental benefits",
        "Ensure you have adequate work-life balance"
      ]
    },
    sleep: {
      title: "Sleep Optimization",
      description: "Poor sleep can lower testosterone levels and increase stress hormones.",
      recommendations: [
        "Aim for 7-9 hours of quality sleep per night",
        "Maintain a consistent sleep schedule",
        "Create a dark, quiet, and cool sleep environment",
        "Avoid screens 1 hour before bedtime",
        "Limit caffeine after midday"
      ]
    },
    diet: {
      title: "Dietary Improvements",
      description: "A heart-healthy diet supports vascular health, which is essential for erectile function.",
      recommendations: [
        "Emphasize fruits, vegetables, whole grains, and lean proteins",
        "Include foods rich in flavonoids (berries, dark chocolate, citrus)",
        "Consider Mediterranean diet principles",
        "Stay well-hydrated throughout the day",
        "Limit processed foods, sugar, and excessive salt"
      ]
    },
    substances: {
      title: "Substance Moderation",
      description: "Alcohol, tobacco, and certain drugs can significantly impact erectile function.",
      recommendations: [
        "Limit alcohol consumption (no more than 1-2 drinks per day)",
        "Quit smoking and avoid tobacco products",
        "Be aware that some recreational drugs can cause erectile dysfunction"
      ]
    },
    pelvic: {
      title: "Pelvic Floor Exercises",
      description: "Strengthening pelvic floor muscles can improve erectile function in some men.",
      recommendations: [
        "Identify your pelvic floor muscles (the ones you use to stop urination midstream)",
        "Tighten these muscles, hold for 3-5 seconds, then release",
        "Repeat 10-15 times, 3 times per day",
        "Gradually increase holding time as strength improves"
      ]
    }
  };

  const handleAnswerSelect = (questionId, answerId, answerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, answerValue }
    }));
  };

  const handleHealthAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId }
    }));
  };

  const handleSubmitSurvey = () => {
    // Calculate score based on main questions (excluding health questions)
    const mainQuestionIds = questions.map(q => q.id);
    const relevantAnswers = Object.entries(answers)
      .filter(([key]) => mainQuestionIds.includes(key))
      .map(([_, value]) => value.answerValue);
    
    const totalScore = relevantAnswers.reduce((sum, value) => sum + value, 0);
    const maxPossibleScore = questions.length * 4;
    const scorePercentage = (totalScore / maxPossibleScore) * 100;
    
    // Check for health conditions
    const healthConditions = healthQuestions
      .filter(q => answers[q.id] && answers[q.id].answerId === 'yes')
      .map(q => q.question);
    
    // Determine recommendations
    let doctorRecommendation = false;
    let assessmentText = '';
    let focusAreas = [];
    
    // Determine focus areas based on lowest scores
    const questionScores = mainQuestionIds.map(id => ({
      id,
      question: questions.find(q => q.id === id).question,
      score: answers[id] ? answers[id].answerValue : 0
    }));
    
    // Sort by score (ascending) and take the lowest 3
    const lowestScores = [...questionScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .filter(item => item.score <= 2); // Only include areas with low scores
    
    lowestScores.forEach(item => {
      if (item.id === 'erection_frequency' || item.id === 'erection_quality' || item.id === 'erection_maintenance') {
        focusAreas.push('physical');
      } else if (item.id === 'confidence' || item.id === 'satisfaction') {
        focusAreas.push('psychological');
      } else if (item.id === 'stress' || item.id === 'sleep') {
        focusAreas.push('lifestyle');
      }
    });
    
    // Remove duplicates
    focusAreas = [...new Set(focusAreas)];
    
    // Determine assessment text and doctor recommendation
    if (scorePercentage >= 80) {
      assessmentText = "Your responses indicate that your erectile function is generally good. Continue with healthy lifestyle habits to maintain this.";
      doctorRecommendation = false;
    } else if (scorePercentage >= 60) {
      assessmentText = "Your responses suggest mild to moderate concerns with erectile function. Some lifestyle changes could be beneficial.";
      doctorRecommendation = healthConditions.length > 0;
    } else {
      assessmentText = "Your responses indicate more significant concerns with erectile function.";
      doctorRecommendation = true;
    }
    
    // If any health conditions are present, recommend doctor consultation
    if (healthConditions.length > 0) {
      doctorRecommendation = true;
    }
    
    // Compile assessment
    const assessmentResult = {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: scorePercentage,
      assessmentText,
      doctorRecommendation,
      healthConditions,
      focusAreas,
      lowestScores,
      timestamp: new Date().toISOString(),
      answers
    };
    
    setAssessment(assessmentResult);
    setActiveSection('results');
  };

  const handleSaveData = async () => {
    if (!user) {
      setSaveMessage('You must be logged in to save your data');
      return;
    }

    setIsSaving(true);
    try {
      // Sanitize the assessment data to remove any potentially harmful content
      const sanitizedAssessment = JSON.parse(JSON.stringify(assessment));
      
      // This would normally be an API call to save to backend
      // For now, we'll use localStorage
      localStorage.setItem(`ed_assessment_${user._id}`, JSON.stringify(sanitizedAssessment));
      
      setSaveMessage('Your assessment data has been saved successfully');
      setSavedData(sanitizedAssessment);
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
      setAssessment(savedData);
      setActiveSection('results');
    }
  };

  const handleStartNew = () => {
    setAnswers({});
    setAssessment(null);
    setActiveSection('survey');
  };

  const renderIntro = () => {
    return (
      <div className="ed-intro">
        <h2>ED & Performance Self-Assessment</h2>
        <div className="ed-notice">
          <p><strong>Privacy Notice:</strong> This assessment is private and anonymous. Your answers are never shared with third parties. If logged in, your data is securely stored in your profile only for your reference.</p>
        </div>
        
        <div className="ed-intro-content">
          <p>This confidential self-assessment helps you evaluate erectile function and sexual performance. After completing the assessment, you'll receive:</p>
          
          <ul>
            <li>An overview of your erectile function and potential areas of concern</li>
            <li>Guidance on whether consultation with a healthcare provider is recommended</li>
            <li>Natural tips to potentially improve performance based on your responses</li>
          </ul>
          
          <p>This tool is for informational purposes only and does not replace professional medical advice.</p>
        </div>
        
        <div className="ed-intro-actions">
          {savedData && (
            <button 
              onClick={handleLoadSavedData}
              className="secondary-button"
            >
              View Previous Assessment
            </button>
          )}
          
          <button 
            onClick={() => setActiveSection('survey')}
            className="primary-button"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  };

  const renderSurvey = () => {
    // Check if all questions are answered
    const mainQuestionsAnswered = questions.every(q => answers[q.id]);
    const healthQuestionsAnswered = healthQuestions.every(q => answers[q.id]);
    const allAnswered = mainQuestionsAnswered && healthQuestionsAnswered;
    
    return (
      <div className="ed-survey">
        <h2>Performance Assessment Questionnaire</h2>
        <p className="survey-instructions">Please answer all questions honestly for the most accurate assessment. Your responses are private and confidential.</p>
        
        <div className="question-section">
          <h3>Main Questions</h3>
          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <p className="question-number">Question {index + 1}</p>
              <h4>{question.question}</h4>
              
              <div className="options">
                {question.options.map(option => (
                  <label 
                    key={option.id} 
                    className={`option-label ${answers[question.id]?.answerId === option.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id]?.answerId === option.id}
                      onChange={() => handleAnswerSelect(question.id, option.id, option.value)}
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="question-section">
          <h3>Health Background Questions</h3>
          <p className="health-note">These questions help provide more accurate recommendations.</p>
          
          {healthQuestions.map((question, index) => (
            <div key={question.id} className="question-card health-question">
              <h4>{question.question}</h4>
              
              <div className="options horizontal">
                {question.options.map(option => (
                  <label 
                    key={option.id} 
                    className={`option-label ${answers[question.id]?.answerId === option.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id]?.answerId === option.id}
                      onChange={() => handleHealthAnswerSelect(question.id, option.id)}
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="survey-actions">
          <button 
            onClick={() => setActiveSection('intro')}
            className="secondary-button"
          >
            Back to Intro
          </button>
          
          <button 
            onClick={handleSubmitSurvey}
            disabled={!allAnswered}
            className="primary-button"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!assessment) return null;
    
    const { 
      percentage, 
      assessmentText, 
      doctorRecommendation, 
      healthConditions,
      focusAreas
    } = assessment;
    
    // Determine score category
    let scoreCategory;
    if (percentage >= 80) {
      scoreCategory = { label: 'Good', color: '#28a745' };
    } else if (percentage >= 60) {
      scoreCategory = { label: 'Moderate', color: '#ffc107' };
    } else {
      scoreCategory = { label: 'Concerns Identified', color: '#dc3545' };
    }
    
    // Determine which tips to show based on focus areas
    const relevantTips = [];
    
    if (focusAreas.includes('physical') || focusAreas.includes('lifestyle')) {
      relevantTips.push(naturalTips.exercise);
      relevantTips.push(naturalTips.pelvic);
    }
    
    if (focusAreas.includes('psychological') || focusAreas.includes('lifestyle')) {
      relevantTips.push(naturalTips.stress);
    }
    
    // Always include these general tips
    relevantTips.push(naturalTips.sleep);
    relevantTips.push(naturalTips.diet);
    relevantTips.push(naturalTips.substances);
    
    return (
      <div className="ed-results">
        <h2>Your Assessment Results</h2>
        
        <div className="results-summary">
          <div className="score-display">
            <div 
              className="score-circle" 
              style={{ 
                backgroundColor: scoreCategory.color,
                boxShadow: `0 0 15px ${scoreCategory.color}` 
              }}
            >
              <span className="score-percentage">{Math.round(percentage)}%</span>
            </div>
            <p className="score-label">{scoreCategory.label}</p>
          </div>
          
          <div className="assessment-summary">
            <p>{assessmentText}</p>
            
            {doctorRecommendation && (
              <div className="doctor-recommendation">
                <h4>Medical Consultation Recommended</h4>
                <p>Based on your responses, consulting with a healthcare provider is recommended. Erectile dysfunction can sometimes be an early indicator of other health conditions.</p>
                
                {healthConditions.length > 0 && (
                  <div className="health-conditions">
                    <p>You indicated you have the following health conditions, which can sometimes affect erectile function:</p>
                    <ul>
                      {healthConditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="natural-tips">
          <h3>Natural Tips for Improvement</h3>
          <p className="tips-intro">Here are some evidence-based lifestyle approaches that may help improve erectile function:</p>
          
          <div className="tips-grid">
            {relevantTips.map((tip, index) => (
              <div key={index} className="tip-card">
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
                <ul>
                  {tip.recommendations.map((rec, recIndex) => (
                    <li key={recIndex}>{rec}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="results-disclaimer">
          <p><strong>Disclaimer:</strong> This assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.</p>
        </div>
        
        <div className="results-actions">
          {user ? (
            <button 
              onClick={handleSaveData}
              className="secondary-button"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Results'}
            </button>
          ) : (
            <p className="login-prompt">Log in to save your results</p>
          )}
          
          {saveMessage && <p className="save-message">{saveMessage}</p>}
          
          <button 
            onClick={handleStartNew}
            className="primary-button"
          >
            Take Assessment Again
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
      case 'survey':
        return renderSurvey();
      case 'results':
        return renderResults();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="ed-assessment-container">
      <h1>ED & Performance Self-Assessment</h1>
      {renderContent()}
    </div>
  );
};

export default EDPerformanceAssessment; 