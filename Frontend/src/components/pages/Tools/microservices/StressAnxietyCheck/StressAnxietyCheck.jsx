import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './StressAnxietyCheck.css';

const StressAnxietyCheck = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('questionnaire');
    const [answers, setAnswers] = useState(Array(7).fill(null));
    const [totalScore, setTotalScore] = useState(0);
    const [anxietyLevel, setAnxietyLevel] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // GAD-7 questions
    const questions = [
        "Feeling nervous, anxious, or on edge",
        "Not being able to stop or control worrying",
        "Worrying too much about different things",
        "Trouble relaxing",
        "Being so restless that it's hard to sit still",
        "Becoming easily annoyed or irritable",
        "Feeling afraid, as if something awful might happen"
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
            fetchAnxietyHistory();
        }
    }, [activeTab, user]);

    const fetchAnxietyHistory = async () => {
        try {
            setLoading(true);
            const response = await healthService.getAnxietyHistory(user.id);
            
            if (response.success && response.records) {
                setHistory(response.records);
            } else if (response.records) {
                setHistory(response.records);
            } else if (Array.isArray(response)) {
                setHistory(response);
            } else {
                console.error('Unexpected response format:', response);
                setError('Failed to parse anxiety history. Check console for details.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching anxiety history:', err);
            setError('Failed to load anxiety history. Please try again.');
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
        
        // Determine anxiety level based on score
        if (score >= 0 && score <= 4) {
            setAnxietyLevel('Minimal Anxiety');
        } else if (score >= 5 && score <= 9) {
            setAnxietyLevel('Mild Anxiety');
        } else if (score >= 10 && score <= 14) {
            setAnxietyLevel('Moderate Anxiety');
        } else if (score >= 15) {
            setAnxietyLevel('Severe Anxiety');
        }
        
        setSubmitted(true);
    };

    const getSelfHelpTips = () => {
        // Return self-help tips based on anxiety level
        switch (anxietyLevel) {
            case 'Minimal Anxiety':
                return [
                    "Continue to practice mindfulness and self-care",
                    "Maintain healthy sleep patterns",
                    "Regular physical activity can help maintain your mental well-being",
                    "Stay connected with friends and family"
                ];
            case 'Mild Anxiety':
                return [
                    "Try deep breathing exercises when feeling stressed",
                    "Practice progressive muscle relaxation to ease tension",
                    "Consider limiting caffeine and alcohol",
                    "Establish a regular sleep schedule",
                    "Spend time in nature"
                ];
            case 'Moderate Anxiety':
                return [
                    "Consider learning meditation or mindfulness practices",
                    "Exercise regularly to reduce stress hormones",
                    "Try journaling to identify anxiety triggers",
                    "Establish healthy boundaries with work and social media",
                    "Consider speaking with a mental health professional"
                ];
            case 'Severe Anxiety':
                return [
                    "Speaking with a mental health professional is strongly recommended",
                    "Practice grounding techniques for acute anxiety",
                    "Establish a daily routine to provide structure",
                    "Learn and use relaxation techniques",
                    "Consider support groups or therapy options",
                    "Be kind to yourself - recovery takes time"
                ];
            default:
                return [];
        }
    };

    const handleSaveResults = async () => {
        if (!user) {
            setError('Please sign in to save your results');
            return;
        }

        try {
            setLoading(true);
            
            // Prepare the data
            const anxietyData = {
                score: totalScore,
                level: anxietyLevel,
                answers: answers,
                timestamp: new Date().toISOString(),
                date: format(new Date(), 'yyyy-MM-dd')
            };
            
            console.log('Saving anxiety assessment data:', anxietyData);
            
            const response = await healthService.saveAnxietyAssessment(user.id, anxietyData);
            console.log('Save anxiety assessment response:', response);
            
            setSuccess('Results saved successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving anxiety assessment:', err);
            setError(`Failed to save results: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetQuestionnaire = () => {
        setAnswers(Array(7).fill(null));
        setTotalScore(0);
        setAnxietyLevel('');
        setSubmitted(false);
        setError('');
        setSuccess('');
    };

    return (
        <div className="stress-anxiety-check">
            <div className="stress-anxiety-header">
                <h1>Stress & Anxiety Check (GAD-7)</h1>
                <p>A quick 7-question survey to assess anxiety levels</p>
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
                                <h3>Generalized Anxiety Disorder (GAD-7)</h3>
                                <p>Over the last 2 weeks, how often have you been bothered by the following problems?</p>
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

                            <div className={`anxiety-level ${anxietyLevel.toLowerCase().replace(' ', '-')}`}>
                                {anxietyLevel}
                            </div>

                            <div className="interpretation">
                                <h3>What this means:</h3>
                                <p>
                                    {totalScore < 5 ? (
                                        "Your score suggests minimal anxiety symptoms. Continue monitoring your mental health."
                                    ) : totalScore < 10 ? (
                                        "Your score suggests mild anxiety. Consider some self-help strategies."
                                    ) : totalScore < 15 ? (
                                        "Your score suggests moderate anxiety. Consider speaking with a healthcare professional."
                                    ) : (
                                        "Your score suggests severe anxiety. We recommend consulting with a healthcare provider soon."
                                    )}
                                </p>
                            </div>

                            <div className="self-help-tips">
                                <h3>Self-Help Tips</h3>
                                <ul>
                                    {getSelfHelpTips().map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
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
                                If you're experiencing significant anxiety, please consult with a healthcare professional.</p>
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
                                                <div className={`history-level ${entry.level.toLowerCase().replace(' ', '-')}`}>
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

export default StressAnxietyCheck; 