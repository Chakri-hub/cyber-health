import React, { useState } from 'react';
import './SafeSexEducationQuiz.css';

const SafeSexEducationQuiz = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [expandedMethod, setExpandedMethod] = useState(null);

  // Protection methods data
  const protectionMethods = [
    {
      id: 'condoms',
      name: 'Condoms',
      description: 'External condoms are sheaths, usually made of latex, that cover the penis during sexual activity.',
      effectiveness: '98% when used correctly every time.',
      usage: [
        'Check the expiration date and package integrity',
        'Open carefully without using teeth or sharp objects',
        'Place on the erect penis before any genital contact',
        'Leave space at the tip and roll down completely',
        'Hold the base when withdrawing to prevent slippage',
        'Use a new condom for each sex act'
      ],
      protectsAgainst: ['HIV', 'Most STIs', 'Pregnancy'],
      notes: 'Oil-based lubricants can damage latex condoms. Use water-based or silicone-based lubricants instead.'
    },
    {
      id: 'internal-condoms',
      name: 'Internal Condoms',
      description: 'Pouches inserted into the vagina or anus to create a barrier during sexual activity.',
      effectiveness: '95% when used correctly every time.',
      usage: [
        'Check the expiration date and package integrity',
        'Insert the closed end into the vagina or anus',
        'The open ring should remain outside the body',
        'Guide the penis into the pouch, not between the pouch and body',
        'Remove by twisting the outer ring and pulling gently',
        'Use a new internal condom for each sex act'
      ],
      protectsAgainst: ['HIV', 'Most STIs', 'Pregnancy'],
      notes: 'Can be inserted up to 8 hours before sex. Compatible with all types of lubricants.'
    },
    {
      id: 'dental-dams',
      name: 'Dental Dams',
      description: 'Thin, square sheets of latex or polyurethane used as a barrier during oral sex on the vagina or anus.',
      effectiveness: 'Good protection against STIs when used properly.',
      usage: [
        'Place the dam over the vagina or anus before oral contact',
        'Ensure it covers the entire area being contacted',
        'Hold in place during use',
        'Use only one side; do not flip over',
        'Use a new dam for each sex act',
        'Can make a dam from a condom in a pinch by cutting off the tip and cutting along one side'
      ],
      protectsAgainst: ['HIV', 'Most STIs'],
      notes: 'Often flavored to enhance the experience. Less commonly available than condoms.'
    },
    {
      id: 'prep',
      name: 'PrEP (Pre-Exposure Prophylaxis)',
      description: 'A daily medication taken by HIV-negative people to prevent getting HIV from sex or injection drug use.',
      effectiveness: '99% effective when taken as prescribed.',
      usage: [
        'Must be prescribed by a healthcare provider',
        'Requires regular HIV testing (every 3 months)',
        'Take as prescribed (daily for most formulations)',
        'Reach maximum protection after about 7-21 days of consistent use',
        'Continued use is necessary for ongoing protection'
      ],
      protectsAgainst: ['HIV only'],
      notes: 'Does not protect against other STIs or pregnancy. Most effective when combined with other prevention methods.'
    },
    {
      id: 'bc-methods',
      name: 'Birth Control Methods',
      description: 'Various methods to prevent pregnancy, including hormonal options, barrier methods, and long-acting reversible contraceptives.',
      effectiveness: 'Varies by method: 76-99%.',
      usage: [
        'Consult with a healthcare provider to find the best method',
        'Follow prescribed usage instructions carefully',
        'Many require consistent use (daily pill, changing patch/ring)',
        'Some provide long-term protection (IUD, implant)'
      ],
      protectsAgainst: ['Pregnancy only'],
      notes: 'Most birth control methods do not protect against STIs. Consider using condoms along with birth control for STI protection.'
    }
  ];

  // Myths and facts data
  const mythsAndFacts = [
    {
      myth: "You can't get an STI from oral sex.",
      fact: "Many STIs, including herpes, gonorrhea, syphilis, and HPV, can be transmitted through oral sex. Using barriers like condoms or dental dams during oral sex reduces this risk."
    },
    {
      myth: "You can tell if someone has an STI by how they look.",
      fact: "Many STIs have no visible symptoms. People can have and transmit STIs without knowing they're infected. Regular testing is the only way to know for sure."
    },
    {
      myth: "Birth control pills protect against STIs.",
      fact: "Birth control pills only prevent pregnancy, not STIs. Condoms and other barriers are needed for STI prevention."
    },
    {
      myth: "Pulling out (withdrawal) is an effective method of birth control.",
      fact: "The withdrawal method is only about 78% effective in preventing pregnancy with typical use. Pre-ejaculate fluid can contain sperm and can cause pregnancy."
    },
    {
      myth: "STI testing is part of a regular check-up/physical.",
      fact: "Most routine physical exams do not include STI testing unless specifically requested. You need to ask your healthcare provider to be tested."
    },
    {
      myth: "Two condoms are better than one.",
      fact: "Using two condoms actually increases friction between them, making them more likely to break or slip off. Use one condom correctly."
    }
  ];

  // Quiz questions
  const quizQuestions = [
    {
      id: 'q1',
      question: 'Which of the following methods protects against both pregnancy and STIs?',
      options: [
        { id: 'a', text: 'Birth control pills' },
        { id: 'b', text: 'External condoms' },
        { id: 'c', text: 'PrEP' },
        { id: 'd', text: 'IUDs' }
      ],
      correctAnswer: 'b',
      explanation: 'External condoms create a barrier that prevents both pregnancy and the exchange of bodily fluids that can transmit STIs. Birth control pills, PrEP, and IUDs do not protect against STIs.'
    },
    {
      id: 'q2',
      question: 'When should a condom be put on?',
      options: [
        { id: 'a', text: 'Right before ejaculation' },
        { id: 'b', text: 'Before any genital contact' },
        { id: 'c', text: 'After some initial penetration' },
        { id: 'd', text: 'Only when having sex with a new partner' }
      ],
      correctAnswer: 'b',
      explanation: 'Condoms should be put on before any genital contact to prevent exposure to STIs and pre-ejaculate fluid that could cause pregnancy.'
    },
    {
      id: 'q3',
      question: 'Which lubricants are safe to use with latex condoms?',
      options: [
        { id: 'a', text: 'Oil-based lubricants like Vaseline' },
        { id: 'b', text: 'Cooking oils like olive oil' },
        { id: 'c', text: 'Water-based lubricants' },
        { id: 'd', text: 'Lotions and body creams' }
      ],
      correctAnswer: 'c',
      explanation: 'Water-based lubricants are safe to use with latex condoms. Oil-based products (including Vaseline, cooking oils, lotions, and body creams) can damage latex condoms and make them break.'
    },
    {
      id: 'q4',
      question: 'What does PrEP (Pre-Exposure Prophylaxis) protect against?',
      options: [
        { id: 'a', text: 'All STIs' },
        { id: 'b', text: 'HIV only' },
        { id: 'c', text: 'Pregnancy and HIV' },
        { id: 'd', text: 'Pregnancy only' }
      ],
      correctAnswer: 'b',
      explanation: 'PrEP only protects against HIV infection. It does not protect against other STIs or pregnancy.'
    },
    {
      id: 'q5',
      question: 'True or False: You can tell if someone has an STI by looking at them.',
      options: [
        { id: 'a', text: 'True' },
        { id: 'b', text: 'False' }
      ],
      correctAnswer: 'b',
      explanation: 'False. Many STIs have no visible symptoms. Someone can have and transmit an STI without knowing they are infected. Regular testing is the only way to know for sure.'
    }
  ];

  const handleStartQuiz = () => {
    setActiveSection('quiz');
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectAnswer = (questionId, answerId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    if (!quizSubmitted) return null;
    
    const correctAnswers = quizQuestions.filter(q => 
      quizAnswers[q.id] === q.correctAnswer
    ).length;
    
    return {
      correct: correctAnswers,
      total: quizQuestions.length,
      percentage: Math.round((correctAnswers / quizQuestions.length) * 100)
    };
  };

  const score = calculateScore();

  const toggleMethod = (methodId) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
    }
  };

  // Render different sections based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="safe-sex-intro">
            <h2>Safe Sex Education</h2>
            <p>Welcome to the Safe Sex Education Tool. Here, you'll learn about different protection methods, how to use them correctly, and test your knowledge with a quiz.</p>
            
            <div className="action-buttons">
              <button onClick={() => setActiveSection('methods')}>Learn About Protection Methods</button>
              <button onClick={() => setActiveSection('myths')}>Common Myths & Facts</button>
              <button onClick={handleStartQuiz}>Take the Quiz</button>
            </div>
            
            <div className="importance-section">
              <h3>Why Safe Sex Matters</h3>
              <p>Practicing safe sex is important for your health and the health of your partners. It helps prevent:</p>
              <ul>
                <li>Sexually transmitted infections (STIs) including HIV</li>
                <li>Unplanned pregnancies</li>
                <li>Complications from untreated STIs</li>
              </ul>
              <p>Remember that communication with partners about boundaries, testing status, and protection preferences is a key part of sexual health.</p>
            </div>
          </div>
        );
        
      case 'methods':
        return (
          <div className="protection-methods">
            <h2>Protection Methods</h2>
            <p>Understanding different protection methods helps you make informed choices about your sexual health.</p>
            
            <div className="methods-list">
              {protectionMethods.map(method => (
                <div key={method.id} className="method-card">
                  <div 
                    className="method-header" 
                    onClick={() => toggleMethod(method.id)}
                  >
                    <h3>{method.name}</h3>
                    <span className="expand-icon">
                      {expandedMethod === method.id ? '−' : '+'}
                    </span>
                  </div>
                  
                  {expandedMethod === method.id && (
                    <div className="method-details">
                      <p><strong>Description:</strong> {method.description}</p>
                      <p><strong>Effectiveness:</strong> {method.effectiveness}</p>
                      
                      <div className="usage-guide">
                        <h4>How to Use:</h4>
                        <ol>
                          {method.usage.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="protection-info">
                        <h4>Protects Against:</h4>
                        <ul>
                          {method.protectsAgainst.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="method-notes"><strong>Note:</strong> {method.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              className="back-button" 
              onClick={() => setActiveSection('intro')}
            >
              Back to Main Menu
            </button>
          </div>
        );
        
      case 'myths':
        return (
          <div className="myths-facts">
            <h2>Common Myths & Facts</h2>
            <p>There are many misconceptions about sexual health. Let's clear up some common myths:</p>
            
            <div className="myths-list">
              {mythsAndFacts.map((item, index) => (
                <div key={index} className="myth-fact-card">
                  <div className="myth">
                    <h3>Myth:</h3>
                    <p>{item.myth}</p>
                  </div>
                  <div className="fact">
                    <h3>Fact:</h3>
                    <p>{item.fact}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="back-button" 
              onClick={() => setActiveSection('intro')}
            >
              Back to Main Menu
            </button>
          </div>
        );
        
      case 'quiz':
        return (
          <div className="safe-sex-quiz">
            <h2>Test Your Knowledge</h2>
            
            {!quizSubmitted ? (
              <>
                <p>Answer the following questions to test your understanding of safe sex practices:</p>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(); }}>
                  {quizQuestions.map(question => (
                    <div key={question.id} className="question-card">
                      <h3>{question.question}</h3>
                      <div className="options">
                        {question.options.map(option => (
                          <label key={option.id} className="option-label">
                            <input
                              type="radio"
                              name={question.id}
                              value={option.id}
                              checked={quizAnswers[question.id] === option.id}
                              onChange={() => handleSelectAnswer(question.id, option.id)}
                              required
                            />
                            <span>{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    className="submit-quiz"
                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                  >
                    Submit Answers
                  </button>
                </form>
              </>
            ) : (
              <div className="quiz-results">
                <h3>Your Results</h3>
                <div className="score-display">
                  <p className="score">
                    You got <span className="score-number">{score.correct}</span> out of <span className="score-number">{score.total}</span> correct! 
                    ({score.percentage}%)
                  </p>
                  
                  {score.percentage >= 80 ? (
                    <p className="score-message success">Great job! You have a good understanding of safe sex practices.</p>
                  ) : score.percentage >= 60 ? (
                    <p className="score-message medium">Good effort, but there's still more to learn about safe sex practices.</p>
                  ) : (
                    <p className="score-message low">You might want to review the information about safe sex practices again.</p>
                  )}
                </div>
                
                <div className="question-review">
                  <h3>Review Your Answers</h3>
                  
                  {quizQuestions.map(question => {
                    const userAnswer = quizAnswers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <h4>{question.question}</h4>
                        
                        <div className="review-answers">
                          <p>
                            <strong>Your answer: </strong> 
                            {question.options.find(opt => opt.id === userAnswer)?.text || 'No answer'}
                            <span className={`answer-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          </p>
                          
                          {!isCorrect && (
                            <p className="correct-answer">
                              <strong>Correct answer: </strong>
                              {question.options.find(opt => opt.id === question.correctAnswer)?.text}
                            </p>
                          )}
                          
                          <p className="answer-explanation">{question.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="post-quiz-actions">
                  <button onClick={handleStartQuiz}>Take the Quiz Again</button>
                  <button onClick={() => setActiveSection('intro')}>Back to Main Menu</button>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return <div>Unknown section</div>;
    }
  };

  return (
    <div className="safe-sex-education-container">
      <h1>Safe Sex Education & Quiz</h1>
      {renderContent()}
    </div>
  );
};

export default SafeSexEducationQuiz; 