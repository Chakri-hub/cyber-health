import React, { useState, useEffect } from 'react';
import './PostureSelfTest.css';
import { useSelector } from 'react-redux';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const PostureSelfTest = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  // State variables
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [postureType, setPostureType] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [message, setMessage] = useState('');

  const postureTests = [
    {
      id: 'wallTest',
      title: 'Wall Test',
      instructions: 'Stand with your back against a wall, with your heels, buttocks, shoulders, and head touching the wall. Attempt to slide your hand between your lower back and the wall.',
      questions: [
        {
          id: 'wallGap',
          text: 'Can you fit more than a hand\'s width between your lower back and the wall?',
          significance: 'A gap larger than a hand\'s width may indicate an excessive lordotic curve (swayback).'
        }
      ]
    },
    {
      id: 'earShoulderTest',
      title: 'Ear-Shoulder Alignment',
      instructions: 'Stand sideways in front of a mirror or have someone take a side photo of you. Check if your ear, shoulder, hip, knee, and ankle align vertically.',
      questions: [
        {
          id: 'earForward',
          text: 'Is your ear positioned forward of your shoulder?',
          significance: 'Forward head posture may indicate upper cross syndrome or tech neck.'
        },
        {
          id: 'shouldersRounded',
          text: 'Are your shoulders rounded forward?',
          significance: 'Rounded shoulders can contribute to upper back and neck pain.'
        }
      ]
    },
    {
      id: 'shoulderLevelTest',
      title: 'Shoulder Level Test',
      instructions: 'Stand in front of a mirror with your arms relaxed at your sides. Observe if your shoulders are level with each other.',
      questions: [
        {
          id: 'shouldersUneven',
          text: 'Is one shoulder higher than the other?',
          significance: 'Uneven shoulders may indicate scoliosis or muscle imbalances.'
        }
      ]
    }
  ];

  // Posture types and their corresponding conditions
  const postureTypes = {
    neutral: {
      name: 'Neutral Posture',
      description: 'Your posture appears to be within normal range. Continue with good habits and exercises to maintain it.',
      tips: [
        'Continue with regular stretching and strengthening exercises',
        'Take regular breaks from sitting',
        'Maintain ergonomic workstation setup',
        'Be mindful of your posture throughout the day'
      ],
      exercises: [
        'Brisk walking for 20-30 minutes daily',
        'Basic yoga poses for maintenance',
        'Gentle core strengthening exercises'
      ],
      score: 0
    },
    forwardHead: {
      name: 'Forward Head Posture',
      description: 'Your head position is forward of your shoulders, which may cause neck strain and headaches.',
      tips: [
        'Adjust your computer monitor to eye level',
        'Take breaks from looking down at your phone',
        'Sleep with proper neck support',
        'Be mindful of chin tucking throughout the day'
      ],
      exercises: [
        'Chin tucks (10 reps, 3 times daily)',
        'Neck retraction exercises',
        'Upper back strengthening',
        'Chest stretches'
      ],
      score: 0
    },
    roundedShoulders: {
      name: 'Rounded Shoulders',
      description: 'Your shoulders are rolling forward, which may cause upper back pain and restricted shoulder mobility.',
      tips: [
        'Adjust chair height and desk setup',
        'Use ergonomic chair with proper back support',
        'Take regular breaks to roll shoulders back',
        'Be mindful of shoulder position during activities'
      ],
      exercises: [
        'Doorway chest stretches (hold 30 seconds, 3 times daily)',
        'Wall angels (10 reps, 2 times daily)',
        'Rows with resistance bands',
        'Shoulder blade squeezes'
      ],
      score: 0
    },
    anteriorPelvicTilt: {
      name: 'Anterior Pelvic Tilt',
      description: 'Your pelvis is tilted forward, causing an increased curve in your lower back (lordosis).',
      tips: [
        'Adjust your sitting position to maintain neutral pelvis',
        'Use proper lifting technique',
        'Take regular breaks from sitting',
        'Sleep on a medium-firm mattress'
      ],
      exercises: [
        'Glute bridges (15 reps, 2 sets daily)',
        'Hip flexor stretches (hold 30 seconds, 3 times daily)',
        'Planks for core stability',
        'Posterior pelvic tilts'
      ],
      score: 0
    },
    kyphosis: {
      name: 'Kyphotic Posture (Rounded Upper Back)',
      description: 'Your upper back is excessively rounded, which may cause back pain and restricted breathing.',
      tips: [
        'Use a chair with good upper back support',
        'Take regular breaks from sitting',
        'Sleep on your back with proper support',
        'Be mindful of staying tall through your spine'
      ],
      exercises: [
        'Thoracic spine extensions over foam roller',
        'Wall slides (10 reps, 3 times daily)',
        'Chest opening stretches',
        'Back strengthening exercises'
      ],
      score: 0
    },
    swayback: {
      name: 'Swayback Posture',
      description: 'Your pelvis is pushed forward with the upper body leaning back, creating an S-curve in your spine.',
      tips: [
        'Stand with weight evenly distributed on both feet',
        'Engage core muscles while standing',
        'Adjust workstation to promote better alignment',
        'Take regular posture check breaks'
      ],
      exercises: [
        'Core stabilization exercises',
        'Hip flexor and hip extensor strengthening',
        'Pelvic tilting exercises',
        'Lower back stretches'
      ],
      score: 0
    }
  };

  // Load saved results from localStorage when component mounts
  useEffect(() => {
    if (user) {
      // Use user-specific key for storing data
      const savedPostureData = localStorage.getItem(`postureSelfTestData_${user.id}`);
      if (savedPostureData) {
        setSavedResults(JSON.parse(savedPostureData));
      }
    } else {
      // Clear data when no user is logged in
      setSavedResults([]);
    }
  }, [user]);

  const handleAnswer = (questionId, answer) => {
    setResults({
      ...results,
      [questionId]: answer
    });
  };

  const nextStep = () => {
    if (currentStep < postureTests.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTest = () => {
    setCurrentStep(0);
    setResults({});
    setShowResults(false);
  };

  const calculatePostureScore = () => {
    // Count the number of "no" answers (good posture indicators)
    const goodPostureCount = Object.values(results).filter(result => result === false).length;
    const totalQuestions = Object.keys(results).length;
    
    // Calculate percentage
    return Math.round((goodPostureCount / totalQuestions) * 100);
  };

  const getPostureAdvice = () => {
    const score = calculatePostureScore();
    
    if (score >= 80) {
      return { 
        status: 'Excellent',
        message: 'Your posture appears to be very good. Keep up the great work!',
        color: 'success'
      };
    } else if (score >= 60) {
      return {
        status: 'Good',
        message: 'Your posture is good with minor issues. Consider some targeted exercises to address the specific concerns.',
        color: 'info'
      };
    } else if (score >= 40) {
      return {
        status: 'Fair',
        message: 'Your posture shows several issues that should be addressed. Consider consulting with a physical therapist.',
        color: 'warning'
      };
    } else {
      return {
        status: 'Needs Improvement',
        message: 'Your posture assessment indicates significant issues. We recommend consulting with a healthcare professional for a thorough evaluation.',
        color: 'danger'
      };
    }
  };

  const renderTest = () => {
    const currentTest = postureTests[currentStep];
    
    return (
      <div className="test-container">
        <h3>{currentTest.title}</h3>
        <p className="instructions">{currentTest.instructions}</p>
        
        <div className="questions">
          {currentTest.questions.map((question) => (
            <div key={question.id} className="question-item">
              <p>{question.text}</p>
              <div className="answer-buttons">
                <Button 
                  variant={results[question.id] === true ? "danger" : "outline-danger"}
                  onClick={() => handleAnswer(question.id, true)}
                  className="mr-2"
                  aria-label="Yes"
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                </Button>
                <Button 
                  variant={results[question.id] === false ? "success" : "outline-success"}
                  onClick={() => handleAnswer(question.id, false)}
                  aria-label="No"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                </Button>
              </div>
              <small className="text-muted">{question.significance}</small>
            </div>
          ))}
        </div>
        
        <div className="navigation-buttons">
          <Button 
            variant="secondary" 
            onClick={prevStep} 
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            variant="primary" 
            onClick={nextStep} 
            disabled={!currentTest.questions.every(q => results[q.id] !== undefined)}
          >
            {currentStep === postureTests.length - 1 ? 'View Results' : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const advice = getPostureAdvice();
    const score = calculatePostureScore();
    
    return (
      <div className="results-container">
        <h3>Your Posture Assessment Results</h3>
        
        <Alert variant={advice.color}>
          <Alert.Heading>{advice.status} Posture - {score}%</Alert.Heading>
          <p>{advice.message}</p>
        </Alert>
        
        <div className="result-details">
          <h4>Detailed Findings:</h4>
          {postureTests.map(test => (
            <div key={test.id} className="test-result">
              <h5>{test.title}</h5>
              <ul>
                {test.questions.map(question => (
                  <li key={question.id}>
                    <span className={results[question.id] ? 'text-danger' : 'text-success'}>
                      <FontAwesomeIcon icon={results[question.id] ? faTimesCircle : faCheckCircle} />{' '}
                      {question.text}
                    </span>
                    <p className="small">{question.significance}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="improvement-tips">
          <h4>Tips for Improvement:</h4>
          <ul>
            <li>Maintain awareness of your posture throughout the day</li>
            <li>Take regular breaks from sitting and stretch</li>
            <li>Strengthen core muscles with regular exercise</li>
            <li>Ensure your workstation is ergonomically set up</li>
            <li>Consider consulting with a physical therapist for personalized advice</li>
          </ul>
        </div>
        
        <Button variant="primary" onClick={resetTest}>Retake Assessment</Button>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="posture-self-test">
      <Card.Body>
        <Card.Title>Posture Self-Test</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          Evaluate your posture with these simple tests
        </Card.Subtitle>
        
        {!showResults ? renderTest() : renderResults()}
      </Card.Body>
    </Card>
  );
};

export default PostureSelfTest; 