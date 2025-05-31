import React, { useState } from 'react';
import './PCOSSymptomChecker.css';

const PCOSSymptomChecker = () => {
  const [answers, setAnswers] = useState({
    irregularPeriods: null,
    excessiveHair: null,
    acne: null,
    weightGain: null,
    hairLoss: null,
    darkPatches: null,
    fatigue: null,
    moodChanges: null,
    difficultConceiving: null,
    pelvicPain: null
  });

  const [result, setResult] = useState(null);
  
  const symptoms = [
    { id: 'irregularPeriods', question: 'Do you have irregular periods or missed periods?', info: 'PCOS often causes irregular or missed periods due to hormonal imbalances.' },
    { id: 'excessiveHair', question: 'Do you have excessive hair growth on face, chest, or back?', info: 'Hirsutism (excessive hair growth) is caused by elevated androgen levels.' },
    { id: 'acne', question: 'Do you experience persistent acne, especially along the jawline or chin?', info: 'Hormonal acne is common in PCOS due to elevated androgen levels.' },
    { id: 'weightGain', question: 'Have you experienced unexplained weight gain or difficulty losing weight?', info: 'PCOS can affect metabolism and make weight management more difficult.' },
    { id: 'hairLoss', question: 'Do you have thinning hair or hair loss from the scalp?', info: 'Male-pattern baldness in women can be a sign of hormonal imbalance.' },
    { id: 'darkPatches', question: 'Do you have dark patches of skin on neck, armpits, or groin?', info: 'This condition (acanthosis nigricans) can be associated with insulin resistance.' },
    { id: 'fatigue', question: 'Do you experience persistent fatigue?', info: 'Hormonal imbalances and sleep disturbances in PCOS can cause fatigue.' },
    { id: 'moodChanges', question: 'Do you have mood changes, anxiety, or depression?', info: 'Hormonal fluctuations can affect mood and mental health.' },
    { id: 'difficultConceiving', question: 'Have you had difficulty conceiving for over 12 months?', info: 'PCOS is a leading cause of infertility due to irregular ovulation.' },
    { id: 'pelvicPain', question: 'Do you experience pelvic pain, not related to your period?', info: 'Pelvic pain can occur due to ovarian cysts.' }
  ];

  const handleAnswer = (id, value) => {
    setAnswers({
      ...answers,
      [id]: value
    });
  };

  const calculateResult = () => {
    // Count the number of 'yes' answers
    const yesCount = Object.values(answers).filter(answer => answer === true).length;
    
    let riskLevel = '';
    let recommendation = '';
    
    if (yesCount >= 6) {
      riskLevel = 'High';
      recommendation = 'Based on your symptoms, you have several indicators that are consistent with PCOS. It is strongly recommended that you consult with a healthcare provider for proper evaluation and diagnosis.';
    } else if (yesCount >= 3) {
      riskLevel = 'Moderate';
      recommendation = 'You have some symptoms that could be associated with PCOS. Consider discussing these symptoms with your healthcare provider during your next visit.';
    } else {
      riskLevel = 'Low';
      recommendation = 'You have few or no symptoms commonly associated with PCOS. However, if you are concerned about specific symptoms, consult with your healthcare provider.';
    }
    
    setResult({
      riskLevel,
      recommendation,
      symptoms: yesCount
    });
  };

  const resetQuestionnaire = () => {
    setAnswers({
      irregularPeriods: null,
      excessiveHair: null,
      acne: null,
      weightGain: null,
      hairLoss: null,
      darkPatches: null,
      fatigue: null,
      moodChanges: null,
      difficultConceiving: null,
      pelvicPain: null
    });
    setResult(null);
  };

  const allQuestionsAnswered = Object.values(answers).every(answer => answer !== null);

  return (
    <div className="pcos-checker-container">
      <div className="pcos-checker-header">
        <h2>PCOS Symptom Checker</h2>
        <p className="disclaimer">
          This tool is for educational purposes only and is not a substitute for professional medical advice, 
          diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
        </p>
      </div>

      {!result ? (
        <div className="pcos-questionnaire">
          <div className="instruction">
            <p>Answer the following questions about symptoms you have experienced in the last 6 months:</p>
          </div>
          
          <div className="symptoms-list">
            {symptoms.map((symptom) => (
              <div key={symptom.id} className="symptom-item">
                <div className="question-container">
                  <p className="question">{symptom.question}</p>
                  <div className="info-tooltip">ⓘ
                    <span className="tooltip-text">{symptom.info}</span>
                  </div>
                </div>
                
                <div className="answer-buttons">
                  <button 
                    className={answers[symptom.id] === true ? "active" : ""}
                    onClick={() => handleAnswer(symptom.id, true)}
                  >
                    Yes
                  </button>
                  <button 
                    className={answers[symptom.id] === false ? "active" : ""}
                    onClick={() => handleAnswer(symptom.id, false)}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="questionnaire-actions">
            <button 
              className="submit-button"
              disabled={!allQuestionsAnswered}
              onClick={calculateResult}
            >
              See Results
            </button>
          </div>
        </div>
      ) : (
        <div className="results-container">
          <h3>Your PCOS Risk Assessment</h3>
          
          <div className={`risk-level ${result.riskLevel.toLowerCase()}`}>
            <h4>Risk Level: {result.riskLevel}</h4>
            <p>{result.recommendation}</p>
          </div>
          
          <div className="results-summary">
            <p>You reported {result.symptoms} out of 10 common PCOS symptoms.</p>
          </div>
          
          <div className="pcos-resources">
            <h4>PCOS Resources</h4>
            <ul>
              <li>Learn more about PCOS from the <a href="https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome" target="_blank" rel="noopener noreferrer">Office on Women's Health</a></li>
              <li>Visit the <a href="https://www.pcosaa.org/" target="_blank" rel="noopener noreferrer">PCOS Awareness Association</a> for support and resources</li>
              <li>Read about <a href="https://www.cdc.gov/diabetes/basics/pcos.html" target="_blank" rel="noopener noreferrer">PCOS and Diabetes</a> from the CDC</li>
            </ul>
          </div>
          
          <button className="reset-button" onClick={resetQuestionnaire}>
            Take the Questionnaire Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PCOSSymptomChecker; 