import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './DepressionCheck.css';

const DepressionCheck = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('questionnaire');
    const [answers, setAnswers] = useState(Array(9).fill(null));
    const [totalScore, setTotalScore] = useState(0);
    const [depressionLevel, setDepressionLevel] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // PHQ-9 questions
    const questions = [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Trouble falling or staying asleep, or sleeping too much",
        "Feeling tired or having little energy",
        "Poor appetite or overeating",
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
        "Trouble concentrating on things, such as reading the newspaper or watching television",
        "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
        "Thoughts that you would be better off dead or of hurting yourself in some way"
    ];

    // Answer options with scores
    const answerOptions = [
        { value: 0, label: "Not at all" },
        { value: 1, label: "Several days" },
        { value: 2, label: "More than half the days" },
        { value: 3, label: "Nearly every day" }
    ];

    useEffect(() => {
        if (activeTab === 'history' && user) {
            fetchDepressionHistory();
        }
    }, [activeTab, user]);

    const fetchDepressionHistory = async () => {
        try {
            setLoading(true);
            setError('');
            console.log(`Fetching depression history for user ${user.id}...`);
            
            const response = await healthService.getDepressionHistory(user.id);
            console.log('Depression history response:', response);
            
            if (response && response.records) {
                setHistory(response.records);
                if (response.records.length === 0) {
                    console.log('No depression history records found');
                }
            } else if (Array.isArray(response)) {
                setHistory(response);
                if (response.length === 0) {
                    console.log('No depression history records found (array format)');
                }
            } else {
                console.error('Unexpected response format:', response);
                setError('Could not load history. Please try again later.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching depression history:', err);
            setError('Failed to load depression history. Please try again.');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, answerValue) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerValue;
        setAnswers(newAnswers);
    };

    const sanitizeInput = (input) => {
        // Basic sanitization: remove HTML tags and script elements
        if (typeof input === 'string') {
            return input.replace(/<[^>]*>?/gm, '')
                       .replace(/javascript:/gi, '')
                       .trim();
        }
        return input;
    };

    const calculateScore = () => {
        // Sum up all answer values
        const score = answers.reduce((sum, answer) => sum + (answer || 0), 0);
        setTotalScore(score);
        
        // Determine depression level based on score
        if (score >= 0 && score <= 4) {
            setDepressionLevel('None-Minimal');
        } else if (score >= 5 && score <= 9) {
            setDepressionLevel('Mild');
        } else if (score >= 10 && score <= 14) {
            setDepressionLevel('Moderate');
        } else if (score >= 15 && score <= 19) {
            setDepressionLevel('Moderately Severe');
        } else if (score >= 20) {
            setDepressionLevel('Severe');
        }
        
        setSubmitted(true);
    };

    const getResourcesAndTips = () => {
        // Return resources and tips based on depression level
        const generalResources = [
            "Crisis Text Line: Text HOME to 741741",
            "National Suicide Prevention Lifeline: 1-800-273-8255",
            "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/"
        ];
        
        switch (depressionLevel) {
            case 'None-Minimal':
                return {
                    tips: [
                        "Continue monitoring your mental health regularly",
                        "Practice self-care and stress management",
                        "Maintain a healthy lifestyle with regular exercise",
                        "Keep a consistent sleep schedule"
                    ],
                    resources: []
                };
            case 'Mild':
                return {
                    tips: [
                        "Consider speaking with a healthcare provider",
                        "Increase physical activity – aim for 30 minutes daily",
                        "Practice mindfulness or meditation",
                        "Connect with friends and loved ones regularly",
                        "Establish a regular sleep schedule"
                    ],
                    resources: generalResources
                };
            case 'Moderate':
                return {
                    tips: [
                        "Consider speaking with a mental health professional",
                        "Establish daily routines to provide structure",
                        "Set small, achievable goals each day",
                        "Try journaling to express thoughts and feelings",
                        "Learn and practice relaxation techniques"
                    ],
                    resources: generalResources
                };
            case 'Moderately Severe':
                return {
                    tips: [
                        "Consult with a mental health professional soon",
                        "Consider therapy options like cognitive behavioral therapy",
                        "Maintain social connections even when you don't feel like it",
                        "Focus on basic self-care: sleep, nutrition, and movement",
                        "Avoid alcohol and recreational drugs which can worsen depression"
                    ],
                    resources: generalResources
                };
            case 'Severe':
                return {
                    tips: [
                        "Please seek professional help as soon as possible",
                        "Consider reaching out to a crisis helpline if you're in immediate distress",
                        "Don't stay alone if you're having thoughts of harming yourself",
                        "Follow up with mental health appointments consistently",
                        "Remember that severe depression is treatable with proper care"
                    ],
                    resources: generalResources
                };
            default:
                return { tips: [], resources: [] };
        }
    };

    const handleSaveResults = async () => {
        if (!user) {
            setError('Please sign in to save your results');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            // Prepare the data with current date
            const now = new Date();
            const depressionData = {
                score: totalScore,
                level: depressionLevel,
                answers: answers,
                timestamp: now.toISOString(),
                date: format(now, 'yyyy-MM-dd')
            };
            
            console.log('Saving depression assessment data:', depressionData);
            
            const response = await healthService.saveDepressionAssessment(user.id, depressionData);
            console.log('Save depression assessment response:', response);
            
            if (response && response.success) {
                setSuccess('Results saved successfully!');
                
                // Refresh history if we're in history tab
                if (activeTab === 'history') {
                    setTimeout(() => {
                        fetchDepressionHistory();
                    }, 1000); // Small delay to ensure backend has processed the data
                }
            } else {
                setError('Could not save your results. Please try again.');
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving depression assessment:', err);
            setError(`Failed to save results: ${err.message || 'Network or server error'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetQuestionnaire = () => {
        setAnswers(Array(9).fill(null));
        setTotalScore(0);
        setDepressionLevel('');
        setSubmitted(false);
        setError('');
        setSuccess('');
    };

    const getSuicideWarningMessage = () => {
        // Check if question 9 (index 8) has a score of 1 or higher
        if (answers[8] && answers[8] >= 1) {
            return (
                <div className="suicide-warning">
                    <h3>Important Notice</h3>
                    <p>Based on your response to the last question, we strongly encourage you to speak with a healthcare professional as soon as possible.</p>
                    <p>If you're having thoughts of harming yourself, please reach out to a crisis helpline immediately:</p>
                    <ul>
                        <li>National Suicide Prevention Lifeline: <a href="tel:1-800-273-8255">1-800-273-8255</a></li>
                        <li>Crisis Text Line: Text HOME to <a href="sms:741741">741741</a></li>
                    </ul>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="depression-check">
            <div className="depression-header">
                <h1>Depression Check (PHQ-9)</h1>
                <p>A 9-question assessment to check for signs of depression</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can complete the assessment but cannot save your results or view history.
                    </div>
                )}
            </div>

            <div className="tabs">
                <button 
                    className={activeTab === 'questionnaire' ? 'active' : ''} 
                    onClick={() => setActiveTab('questionnaire')}
                >
                    Assessment
                </button>
                <button 
                    className={activeTab === 'history' ? 'active' : ''} 
                    onClick={() => setActiveTab('history')}
                    disabled={!user}
                >
                    History
                </button>
            </div>

            {activeTab === 'questionnaire' && (
                <div className="questionnaire-section">
                    {!submitted ? (
                        <>
                            <div className="questionnaire-intro">
                                <h3>Patient Health Questionnaire (PHQ-9)</h3>
                                <p>Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
                            </div>

                            <div className="questions-container">
                                {questions.map((question, index) => (
                                    <div key={index} className="question-item">
                                        <div className="question-text">{question}</div>
                                        <div className="answer-options">
                                            {answerOptions.map(option => (
                                                <button 
                                                    key={option.value} 
                                                    className={`answer-option ${answers[index] === option.value ? 'selected' : ''}`}
                                                    onClick={() => handleAnswerSelect(index, option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="questionnaire-actions">
                                <button 
                                    className="submit-button"
                                    onClick={calculateScore}
                                    disabled={answers.includes(null)}
                                >
                                    Submit
                                </button>
                            </div>

                            {error && <div className="error-message">{error}</div>}
                        </>
                    ) : (
                        <div className="results-section">
                            <h2>Your Results</h2>
                            <div className="score-display">
                                <div className="score-value">{totalScore}</div>
                                <div className="score-text">Total Score</div>
                            </div>

                            <div className={`depression-level ${depressionLevel.toLowerCase().replace(/\s+/g, '-')}`}>
                                {depressionLevel} Depression
                            </div>

                            <div className="interpretation">
                                <h3>What this means:</h3>
                                <p>
                                    {totalScore < 5 ? (
                                        "Your score suggests minimal or no depression symptoms."
                                    ) : totalScore < 10 ? (
                                        "Your score suggests mild depression symptoms. Consider speaking with a healthcare provider if symptoms persist."
                                    ) : totalScore < 15 ? (
                                        "Your score suggests moderate depression symptoms. We recommend consulting with a healthcare provider."
                                    ) : totalScore < 20 ? (
                                        "Your score suggests moderately severe depression symptoms. Please consider seeking professional help."
                                    ) : (
                                        "Your score suggests severe depression symptoms. We strongly recommend consulting with a healthcare provider soon."
                                    )}
                                </p>
                            </div>

                            {getSuicideWarningMessage()}

                            <div className="resources-section">
                                <h3>Self-Help Tips</h3>
                                <ul className="tips-list">
                                    {getResourcesAndTips().tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>

                                {getResourcesAndTips().resources.length > 0 && (
                                    <>
                                        <h3>Resources</h3>
                                        <ul className="resources-list">
                                            {getResourcesAndTips().resources.map((resource, index) => (
                                                <li key={index}>{resource}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            <div className="result-actions">
                                {user && (
                                    <button 
                                        className="save-button"
                                        onClick={handleSaveResults}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Results'}
                                    </button>
                                )}
                                <button 
                                    className="reset-button"
                                    onClick={resetQuestionnaire}
                                >
                                    Start Over
                                </button>
                            </div>

                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            <div className="important-note">
                                <p><strong>Important:</strong> This tool is for educational purposes only and is not a diagnostic tool. 
                                If you're experiencing depression symptoms, please consult with a healthcare professional.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="history-section">
                    {loading ? (
                        <div className="loading">Loading your assessment history...</div>
                    ) : (
                        <>
                            <h2>Your Assessment History</h2>
                            {history.length === 0 ? (
                                <div className="no-data">No previous assessments found</div>
                            ) : (
                                <div className="history-list">
                                    {[...history]
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                        .map((entry, index) => (
                                            <div key={index} className="history-item">
                                                <div className="history-date">
                                                    {format(new Date(entry.timestamp), 'MMM dd, yyyy')}
                                                    <span className="history-time">{format(new Date(entry.timestamp), 'h:mm a')}</span>
                                                </div>
                                                <div className="history-score">
                                                    <span className="score-label">Score:</span>
                                                    <span className="score-value">{entry.score}</span>
                                                </div>
                                                <div className={`history-level ${entry.level.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {entry.level}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            <div className="history-actions">
                                <button 
                                    className="new-assessment-button"
                                    onClick={() => {
                                        resetQuestionnaire();
                                        setActiveTab('questionnaire');
                                    }}
                                >
                                    Take New Assessment
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepressionCheck; 