import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './ConsentAwarenessTool.css';
import html2pdf from 'html2pdf.js';

const ConsentAwarenessTool = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  
  const [activeSection, setActiveSection] = useState('intro');
  const [currentModule, setCurrentModule] = useState(0);
  const [moduleProgress, setModuleProgress] = useState([0, 0, 0, 0]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [scenarioAnswers, setScenarioAnswers] = useState({});
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);
  const certificateRef = useRef(null);

  // Course modules data
  const modules = [
    {
      id: 0,
      title: "Understanding Consent",
      content: [
        {
          type: "text",
          content: "Consent is a clear, enthusiastic, and voluntary agreement to engage in an activity with another person. It's about communication, respect, and ensuring everyone involved feels comfortable and safe."
        },
        {
          type: "text",
          content: "Key principles of consent:"
        },
        {
          type: "list",
          items: [
            "Freely given (without pressure, manipulation, or under the influence of substances)",
            "Reversible (can be withdrawn at any time)",
            "Informed (all parties understand what's involved)",
            "Enthusiastic (genuine desire, not just reluctant agreement)",
            "Specific (agreeing to one thing doesn't mean agreeing to others)"
          ]
        },
        {
          type: "text",
          content: "Remember: consent is an ongoing process, not a one-time question and answer."
        }
      ]
    },
    {
      id: 1,
      title: "Verbal Consent",
      content: [
        {
          type: "text",
          content: "Verbal consent involves using clear, direct language to express boundaries and desires. It removes ambiguity and ensures both parties are on the same page."
        },
        {
          type: "text",
          content: "Examples of asking for consent:"
        },
        {
          type: "list",
          items: [
            "\"Would you like to...?\"",
            "\"Can I...?\"",
            "\"I'd like to... How does that sound to you?\"",
            "\"Are you comfortable with...?\"",
            "\"Do you want to keep going or take a break?\""
          ]
        },
        {
          type: "text",
          content: "Examples of giving consent:"
        },
        {
          type: "list",
          items: [
            "\"Yes, I'd like that\"",
            "\"That sounds good to me\"",
            "\"I'm comfortable with that\""
          ]
        },
        {
          type: "text",
          content: "Examples of refusing consent:"
        },
        {
          type: "list",
          items: [
            "\"No, thank you\"",
            "\"I'm not comfortable with that\"",
            "\"I'd rather not\"",
            "\"Maybe another time\"",
            "\"I need some time to think about it\""
          ]
        },
        {
          type: "text",
          content: "Remember: 'No' is a complete sentence. It doesn't require explanation or justification."
        }
      ]
    },
    {
      id: 2,
      title: "Non-verbal Consent",
      content: [
        {
          type: "text",
          content: "While verbal consent is clearest, non-verbal cues also play an important role in communication. However, non-verbal cues alone can be ambiguous and should be combined with verbal confirmation when possible."
        },
        {
          type: "text",
          content: "Possible signs of comfort/consent (still require verbal confirmation):"
        },
        {
          type: "list",
          items: [
            "Actively participating and reciprocating",
            "Relaxed body language",
            "Maintaining eye contact",
            "Nodding and smiling",
            "Moving closer"
          ]
        },
        {
          type: "text",
          content: "Possible signs of discomfort/non-consent (always stop and check in):"
        },
        {
          type: "list",
          items: [
            "Tensing up or freezing",
            "Pulling away",
            "Looking away or closing eyes",
            "Crossed arms or turning away",
            "Crying or trembling",
            "Silence or unresponsiveness"
          ]
        },
        {
          type: "text",
          content: "Important: If you're unsure about someone's non-verbal cues, always ask verbally. Never assume consent based solely on body language."
        }
      ]
    },
    {
      id: 3,
      title: "Setting Boundaries",
      content: [
        {
          type: "text",
          content: "Boundaries are personal limits that define what you're comfortable with. Everyone has different boundaries, and they may change over time or in different situations."
        },
        {
          type: "text",
          content: "Tips for setting boundaries:"
        },
        {
          type: "list",
          items: [
            "Be clear and direct about your limits",
            "Use \"I\" statements (\"I feel... when...\")",
            "You don't need to apologize for your boundaries",
            "Set boundaries before an intimate encounter when possible",
            "Remember that boundaries can change and be reassessed"
          ]
        },
        {
          type: "text",
          content: "Tips for respecting others' boundaries:"
        },
        {
          type: "list",
          items: [
            "Listen actively when someone expresses their limits",
            "Don't take it personally if someone's boundaries don't align with your desires",
            "Never try to convince someone to change their boundaries",
            "Check in regularly, especially in new situations",
            "If someone seems uncomfortable, stop and ask"
          ]
        },
        {
          type: "text",
          content: "Remember: Healthy relationships involve mutual respect for each other's boundaries."
        }
      ]
    }
  ];

  // Scenario-based questions
  const scenarios = [
    {
      id: 1,
      title: "Scenario 1: Initial Consent",
      scenario: "Alex and Jordan are on their third date. They're watching a movie at Alex's apartment and start kissing. Alex wants to take things further but isn't sure if Jordan feels the same way.",
      question: "What's the best way for Alex to proceed?",
      options: [
        {
          id: "a",
          text: "Keep going until Jordan stops them if they're uncomfortable"
        },
        {
          id: "b",
          text: "Assume Jordan is okay with it since they agreed to come over to the apartment"
        },
        {
          id: "c",
          text: "Pause and ask, \"Is this okay?\" or \"Would you like to go further?\""
        },
        {
          id: "d",
          text: "Stop everything immediately to avoid any potential for misunderstanding"
        }
      ],
      correctAnswer: "c",
      explanation: "The best approach is for Alex to pause and verbally check in with Jordan. This creates an opportunity for clear communication about boundaries and desires without making assumptions or unnecessarily ending a mutually enjoyable experience."
    },
    {
      id: 2,
      title: "Scenario 2: Changing Mind",
      scenario: "Sam and Riley are intimate partners. They've started becoming physically intimate, and both initially consented. Midway through, Riley becomes uncomfortable and tenses up but doesn't say anything.",
      question: "What should Sam do upon noticing Riley's change in body language?",
      options: [
        {
          id: "a",
          text: "Ignore it and continue, since Riley gave consent at the beginning"
        },
        {
          id: "b",
          text: "Pause and check in: \"You seem tense. Are you still comfortable with this?\""
        },
        {
          id: "c",
          text: "Immediately stop without saying anything"
        },
        {
          id: "d",
          text: "Try to help Riley relax by continuing but being more gentle"
        }
      ],
      correctAnswer: "b",
      explanation: "When someone's body language changes to indicate possible discomfort, the best response is to pause and check in verbally. This acknowledges the non-verbal cue while opening a channel for clear communication. Remember that consent can be withdrawn at any time, and initial consent doesn't extend to the entire encounter."
    },
    {
      id: 3,
      title: "Scenario 3: Alcohol and Consent",
      scenario: "Taylor and Morgan meet at a party. They're both attracted to each other and have been drinking alcohol. Taylor suggests they go somewhere private together.",
      question: "What's true about this situation?",
      options: [
        {
          id: "a",
          text: "Since both people have been drinking equally, consent issues don't apply"
        },
        {
          id: "b",
          text: "If Morgan agrees while intoxicated, that's still valid consent"
        },
        {
          id: "c",
          text: "The alcohol consumption means neither person can truly give informed consent"
        },
        {
          id: "d", 
          text: "Only Taylor needs to be concerned about Morgan's level of intoxication, not the other way around"
        }
      ],
      correctAnswer: "c",
      explanation: "Alcohol impairs judgment and the ability to give informed consent. When someone is intoxicated, they may agree to things they wouldn't when sober. The ethical approach is to wait until both parties are sober before engaging in intimate activities. This protects both people and ensures any consent given is meaningful."
    },
    {
      id: 4,
      title: "Scenario 4: Pressure and Coercion",
      scenario: "Quinn and Reese have been dating for a month. Quinn wants to try a new intimate activity, but when they suggest it, Reese says they're not comfortable with it. Quinn really wants to try it.",
      question: "What's an appropriate way for Quinn to respond?",
      options: [
        {
          id: "a",
          text: "\"If you really loved me, you'd try it just once.\""
        },
        {
          id: "b",
          text: "\"That's okay. I respect your boundary. Is there something else you'd enjoy?\""
        },
        {
          id: "c",
          text: "Keep bringing it up on different occasions until Reese agrees to try it"
        },
        {
          id: "d",
          text: "\"My ex never had a problem with this. Why are you so uptight?\""
        }
      ],
      correctAnswer: "b",
      explanation: "Respecting someone's boundary without pressure is essential for consent. Options A, C, and D all involve forms of manipulation or coercion, which invalidate consent. True consent must be freely given without pressure, guilt trips, or repeated requests that wear someone down."
    },
    {
      id: 5,
      title: "Scenario 5: Ongoing Communication",
      scenario: "Jamie and Casey are in a long-term relationship. They've been intimate many times before and have established comfort with certain activities.",
      question: "Which statement best reflects healthy consent practice in their situation?",
      options: [
        {
          id: "a",
          text: "Since they've done these activities before, explicit consent isn't needed each time"
        },
        {
          id: "b",
          text: "Their relationship status means blanket consent for any activity at any time"
        },
        {
          id: "c",
          text: "They should still check in with each other and confirm consent, even for familiar activities"
        },
        {
          id: "d",
          text: "Only new or unusual activities require explicit consent conversations"
        }
      ],
      correctAnswer: "c",
      explanation: "Even in established relationships, ongoing consent matters. People's feelings, desires, and comfort levels can change from day to day. Checking in doesn't have to be formal—it can be as simple as \"Does this feel good?\" or \"Are you in the mood for...?\" This practice builds trust and ensures both partners remain comfortable."
    }
  ];

  const markModuleComplete = (moduleIndex) => {
    const newProgress = [...moduleProgress];
    newProgress[moduleIndex] = 1;
    setModuleProgress(newProgress);
  };

  const isCourseFullyCompleted = () => {
    // Check if all modules are completed and all scenarios are answered correctly
    const allModulesCompleted = moduleProgress.every(module => module === 1);
    const allScenariosAnswered = scenarios.every(scenario => 
      scenarioAnswers[scenario.id] && scenarioAnswers[scenario.id] === scenario.correctAnswer
    );
    
    return allModulesCompleted && allScenariosAnswered;
  };

  const handleNextModule = () => {
    // Mark current module as completed
    markModuleComplete(currentModule);
    
    // Move to next module if available
    if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
    } else {
      // If all modules are completed, go to scenarios
      setActiveSection('scenarios');
    }
  };

  const handlePreviousModule = () => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
    } else {
      setActiveSection('intro');
    }
  };

  const handleScenarioAnswer = (scenarioId, answerId) => {
    setScenarioAnswers({
      ...scenarioAnswers,
      [scenarioId]: answerId
    });
  };

  const handleSubmitScenarios = () => {
    setShowScenarioFeedback(true);
    
    // If all answers are correct and all modules completed, allow certificate
    if (isCourseFullyCompleted()) {
      // Check if user is authenticated
      if (user) {
        setActiveSection('certificate-form');
      } else {
        setActiveSection('login-required');
      }
    }
  };

  const handleCertificateSubmit = (e) => {
    e.preventDefault();
    setUserName(inputName);
    setShowCertificate(true);
    setActiveSection('certificate');
  };

  const downloadCertificate = () => {
    // Use html2pdf to generate and download a PDF
    const element = certificateRef.current;
    const opt = {
      margin: 0.5,
      filename: `Consent_Awareness_Certificate_${userName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const renderModuleContent = (content) => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'text':
          return <p key={index} className="module-text">{item.content}</p>;
        case 'list':
          return (
            <ul key={index} className="module-list">
              {item.items.map((listItem, listIndex) => (
                <li key={listIndex}>{listItem}</li>
              ))}
            </ul>
          );
        default:
          return null;
      }
    });
  };

  const renderIntro = () => {
    return (
      <div className="consent-intro">
        <h2>Consent Awareness Course</h2>
        <p>Welcome to the Consent Awareness Course. This interactive learning experience will help you understand the importance of consent in all relationships and interactions.</p>
        
        <div className="course-overview">
          <h3>In this course, you'll learn about:</h3>
          <ul>
            {modules.map(module => (
              <li key={module.id}>{module.title}</li>
            ))}
          </ul>
          <p>After completing the modules, you'll apply your knowledge through realistic scenarios and earn a certificate of completion.</p>
        </div>
        
        <div className="importance-section">
          <h3>Why Consent Matters</h3>
          <p>Consent is fundamental to healthy relationships and interactions. Understanding consent helps:</p>
          <ul>
            <li>Create mutual respect and trust</li>
            <li>Ensure everyone feels safe and comfortable</li>
            <li>Improve communication skills</li>
            <li>Prevent harm and misunderstandings</li>
          </ul>
        </div>
        
        <button 
          className="primary-button"
          onClick={() => setActiveSection('modules')}
        >
          Start Learning
        </button>
      </div>
    );
  };

  const renderModules = () => {
    const module = modules[currentModule];
    
    return (
      <div className="module-content">
        <div className="module-progress">
          {modules.map((mod, index) => (
            <div 
              key={mod.id} 
              className={`progress-dot ${currentModule === index ? 'active' : ''} ${moduleProgress[index] === 1 ? 'completed' : ''}`}
              onClick={() => setCurrentModule(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        <h2>{module.title}</h2>
        
        <div className="module-body">
          {renderModuleContent(module.content)}
        </div>
        
        <div className="module-navigation">
          <button 
            onClick={handlePreviousModule}
            className="secondary-button"
          >
            {currentModule === 0 ? 'Back to Intro' : 'Previous Module'}
          </button>
          
          <button 
            onClick={handleNextModule}
            className="primary-button"
          >
            {currentModule < modules.length - 1 ? 'Next Module' : 'Go to Scenarios'}
          </button>
        </div>
      </div>
    );
  };

  const renderScenarios = () => {
    return (
      <div className="scenarios-section">
        <h2>Scenario-Based Learning</h2>
        <p>Apply what you've learned by analyzing these realistic scenarios. Choose the response that best demonstrates proper consent practices.</p>
        
        {scenarios.map(scenario => {
          const userAnswer = scenarioAnswers[scenario.id];
          const isCorrect = showScenarioFeedback && userAnswer === scenario.correctAnswer;
          const isIncorrect = showScenarioFeedback && userAnswer && userAnswer !== scenario.correctAnswer;
          
          return (
            <div key={scenario.id} className="scenario-card">
              <h3>{scenario.title}</h3>
              <p className="scenario-text">{scenario.scenario}</p>
              <p className="scenario-question"><strong>{scenario.question}</strong></p>
              
              <div className="scenario-options">
                {scenario.options.map(option => (
                  <label 
                    key={option.id} 
                    className={`option-label ${showScenarioFeedback && option.id === scenario.correctAnswer ? 'correct' : ''} ${isIncorrect && userAnswer === option.id ? 'incorrect' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`scenario-${scenario.id}`}
                      value={option.id}
                      checked={userAnswer === option.id}
                      onChange={() => handleScenarioAnswer(scenario.id, option.id)}
                      disabled={showScenarioFeedback}
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
              
              {showScenarioFeedback && (
                <div className="feedback">
                  <p className={isCorrect ? 'correct-feedback' : 'incorrect-feedback'}>
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="explanation">{scenario.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="scenarios-navigation">
          <button 
            onClick={() => {
              setCurrentModule(modules.length - 1);
              setActiveSection('modules');
              setShowScenarioFeedback(false);
            }}
            className="secondary-button"
          >
            Back to Modules
          </button>
          
          {!showScenarioFeedback ? (
            <button 
              onClick={handleSubmitScenarios}
              className="primary-button"
              disabled={Object.keys(scenarioAnswers).length < scenarios.length}
            >
              Submit Answers
            </button>
          ) : (
            isCourseFullyCompleted() && (
              <button 
                onClick={() => setActiveSection('certificate-form')}
                className="primary-button"
              >
                Get Your Certificate
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  const renderCertificateForm = () => {
    return (
      <div className="certificate-form">
        <h2>Course Completed!</h2>
        <p>Congratulations on completing the Consent Awareness Course. You've demonstrated a solid understanding of consent principles and how to apply them in real-world situations.</p>
        
        <form onSubmit={handleCertificateSubmit}>
          <div className="form-group">
            <label htmlFor="name">ENTER YOUR NAME AS IT SHOULD APPEAR ON THE CERTIFICATE:</label>
            <input
              type="text"
              id="name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              required
              placeholder="Your Full Name"
            />
          </div>
          
          <button 
            type="submit"
            className="primary-button"
            disabled={!inputName.trim()}
          >
            Generate Certificate
          </button>
        </form>
      </div>
    );
  };

  const renderCertificate = () => {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    
    return (
      <div className="certificate-container">
        <div className="certificate" ref={certificateRef}>
          <div className="certificate-content">
            <div className="certificate-header">
              <h2>CERTIFICATE OF COMPLETION</h2>
            </div>
            
            <div className="certificate-body">
              <div className="certificate-seal"></div>
              <p className="certificate-text">This certifies that</p>
              <p className="certificate-name">{userName}</p>
              <p className="certificate-text">has successfully completed the</p>
              <p className="certificate-course">Consent Awareness Course</p>
              <p className="certificate-description">
                Demonstrating a thorough understanding of consent principles,
                communication strategies, and boundary-setting in interpersonal relationships.
              </p>
              
              <div className="certificate-footer">
                <div className="certificate-signature">
                  <div className="signature-line"></div>
                  <p>Course Instructor</p>
                </div>
                <div className="certificate-date">
                  <p>Date: {formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="certificate-actions">
          <button 
            onClick={downloadCertificate}
            className="primary-button"
          >
            Download Certificate
          </button>
          
          <button 
            onClick={() => setActiveSection('intro')}
            className="secondary-button"
          >
            Back to Start
          </button>
        </div>
      </div>
    );
  };

  const renderLoginRequired = () => {
    return (
      <div className="login-required">
        <div className="login-required-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>You've successfully completed the Consent Awareness Course!</p>
        <p>To receive your certificate, you need to be logged in to your account.</p>
        <p>This helps us keep track of your achievements and prevents certificate misuse.</p>
        <div className="login-required-actions">
          <a href="/login" className="login-button">Log In</a>
          <a href="/register" className="register-button">Create Account</a>
          <button 
            onClick={() => setActiveSection('scenarios')}
            className="secondary-button"
          >
            Back to Scenarios
          </button>
        </div>
      </div>
    );
  };

  // Render different sections based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return renderIntro();
      case 'modules':
        return renderModules();
      case 'scenarios':
        return renderScenarios();
      case 'login-required':
        return renderLoginRequired();
      case 'certificate-form':
        return renderCertificateForm();
      case 'certificate':
        return renderCertificate();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="consent-awareness-container">
      <h1>Consent Awareness Tool</h1>
      {renderContent()}
    </div>
  );
};

export default ConsentAwarenessTool; 