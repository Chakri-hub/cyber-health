import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './MentalFatigueChecker.css';

const MentalFatigueChecker = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [answers, setAnswers] = useState({
        energyLevel: 3,
        focusLevel: 3,
        motivationLevel: 3,
        stressLevel: 3,
        mentalClarity: 3,
        decisionMaking: 3,
        emotionalState: 3,
        physicalSigns: []
    });
    const [fatigueScore, setFatigueScore] = useState(null);
    const [fatigueLevel, setFatigueLevel] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Physical signs options
    const physicalSignsOptions = [
        { id: 1, label: 'Headache' },
        { id: 2, label: 'Eye Strain' },
        { id: 3, label: 'Neck/Shoulder Tension' },
        { id: 4, label: 'Mental Fog' },
        { id: 5, label: 'Irritability' },
        { id: 6, label: 'Difficulty Concentrating' },
        { id: 7, label: 'General Fatigue' },
        { id: 8, label: 'Restlessness' }
    ];

    const handleSliderChange = (factor, value) => {
        setAnswers({
            ...answers,
            [factor]: parseInt(value)
        });
    };

    const handlePhysicalSignToggle = (signId) => {
        const { physicalSigns } = answers;
        
        if (physicalSigns.includes(signId)) {
            setAnswers({
                ...answers,
                physicalSigns: physicalSigns.filter(id => id !== signId)
            });
        } else {
            setAnswers({
                ...answers,
                physicalSigns: [...physicalSigns, signId]
            });
        }
    };

    const calculateFatigueScore = () => {
        // Calculate based on energy, focus, and motivation (0-100 scale)
        let score = 0;
        
        // Convert 1-5 to 0-20 scale for each factor
        // Energy level is inverse - lower energy means higher fatigue
        score += (6 - answers.energyLevel) * 20; 
        
        // Focus level is inverse - lower focus means higher fatigue
        score += (6 - answers.focusLevel) * 20;
        
        // Motivation level is inverse - lower motivation means higher fatigue
        score += (6 - answers.motivationLevel) * 20;
        
        // Stress adds to fatigue
        score += answers.stressLevel * 5;
        
        // Mental clarity is inverse - lower clarity means higher fatigue
        score += (6 - answers.mentalClarity) * 5;
        
        // Decision making is inverse - lower decision making means higher fatigue
        score += (6 - answers.decisionMaking) * 5;
        
        // Emotional state is inverse - lower emotional state means higher fatigue
        score += (6 - answers.emotionalState) * 5;
        
        // Physical signs add to fatigue
        score += answers.physicalSigns.length * 5;
        
        // Normalize to 0-100 scale
        score = Math.round(score * 100 / 140);
        score = Math.max(0, Math.min(100, score));
        
        return score;
    };

    const determineFatigueLevel = (score) => {
        if (score < 30) {
            return 'Low';
        } else if (score < 60) {
            return 'Moderate';
        } else if (score < 80) {
            return 'High';
        } else {
            return 'Severe';
        }
    };

    const generateRecommendations = (score, level) => {
        const recs = [];
        
        // General recommendations based on level
        if (level === 'Low') {
            recs.push("Your mental load is currently low. Keep up your good habits!");
            recs.push("Continue with regular breaks and self-care practices.");
        } else if (level === 'Moderate') {
            recs.push("Your mental load is moderate. Consider taking more frequent breaks.");
            recs.push("Try to prioritize tasks and delegate when possible.");
        } else if (level === 'High') {
            recs.push("Your mental load is high. It's important to address this soon.");
            recs.push("Consider scaling back commitments if possible.");
            recs.push("Make sure you're getting adequate sleep.");
        } else {
            recs.push("Your mental load is severe. Please consider speaking with a healthcare professional.");
            recs.push("Take immediate steps to reduce your cognitive load.");
            recs.push("Prioritize sleep, nutrition, and stress management.");
        }
        
        // Specific recommendations based on factors
        if (answers.energyLevel < 3) {
            recs.push("Your energy is low. Consider a short nap (20 min) or light exercise to boost energy.");
            recs.push("Check your hydration - even mild dehydration can cause fatigue.");
        }
        
        if (answers.focusLevel < 3) {
            recs.push("Your focus is suffering. Try the Pomodoro technique: 25 minutes of work followed by a 5-minute break.");
            recs.push("Consider reducing distractions like notifications or noise.");
        }
        
        if (answers.motivationLevel < 3) {
            recs.push("Low motivation can be addressed by breaking tasks into smaller, more manageable steps.");
            recs.push("Remind yourself of your purpose and the value of what you're doing.");
        }
        
        if (answers.stressLevel > 3) {
            recs.push("Practice deep breathing exercises to manage stress: 4 seconds in, hold for 4, out for 6.");
            recs.push("Consider a short mindfulness session or meditation break.");
        }
        
        // Physical signs recommendations
        if (answers.physicalSigns.includes(1) || answers.physicalSigns.includes(2)) { // Headache or Eye Strain
            recs.push("Take a screen break using the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.");
            recs.push("Check your lighting and screen position to reduce eye strain.");
        }
        
        if (answers.physicalSigns.includes(3)) { // Neck/Shoulder Tension
            recs.push("Try gentle stretching exercises for your neck and shoulders.");
            recs.push("Check your posture and workstation ergonomics.");
        }
        
        if (answers.physicalSigns.includes(7)) { // General Fatigue
            recs.push("Prioritize getting 7-9 hours of quality sleep tonight.");
            recs.push("Consider a brief physical activity break to boost energy.");
        }
        
        return recs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setError('');
        setSuccess('');
        
        try {
            setLoading(true);
            
            // Calculate fatigue score - this should always happen
            const score = calculateFatigueScore();
            setFatigueScore(score);
            
            // Determine fatigue level - this should always happen
            const level = determineFatigueLevel(score);
            setFatigueLevel(level);
            
            // Generate recommendations - this should always happen
            const recs = generateRecommendations(score, level);
            setRecommendations(recs);
            
            // Always set submitted to true to show results
            setSubmitted(true);
            
            // Now handle saving data only if user is logged in
            if (user) {
                try {
                    // Prepare the data
                    const now = new Date();
                    const fatigueData = {
                        energyLevel: answers.energyLevel,
                        focusLevel: answers.focusLevel,
                        motivationLevel: answers.motivationLevel,
                        stressLevel: answers.stressLevel,
                        mentalClarity: answers.mentalClarity,
                        decisionMaking: answers.decisionMaking,
                        emotionalState: answers.emotionalState,
                        fatigueScore: score,
                        level: level,
                        answers: [
                            answers.energyLevel,
                            answers.focusLevel,
                            answers.motivationLevel,
                            answers.stressLevel,
                            answers.mentalClarity,
                            answers.decisionMaking,
                            answers.emotionalState
                        ],
                        physicalSigns: answers.physicalSigns.map(id => {
                            const sign = physicalSignsOptions.find(s => s.id === id);
                            return sign ? sign.label : '';
                        }),
                        date: format(now, 'yyyy-MM-dd'),
                        timestamp: now.toISOString()
                    };
                    
                    console.log('Saving mental fatigue data:', fatigueData);
                    
                    // Save data to server
                    const response = await healthService.saveMentalFatigue(user.id, fatigueData);
                    console.log('Save mental fatigue response:', response);
                    
                    setSuccess('Assessment results saved successfully!');
                } catch (saveError) {
                    console.error('Error saving data:', saveError);
                    setError('Your results are displayed but could not be saved to your account.');
                }
            } else {
                // Let user know results are displayed but not saved
                setSuccess('Assessment complete! Results are shown below but not saved to any account.');
            }
        } catch (err) {
            console.error('Error in assessment:', err);
            setError(`Something went wrong with the assessment. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const resetAssessment = () => {
        setAnswers({
            energyLevel: 3,
            focusLevel: 3,
            motivationLevel: 3,
            stressLevel: 3,
            mentalClarity: 3,
            decisionMaking: 3,
            emotionalState: 3,
            physicalSigns: []
        });
        setFatigueScore(null);
        setFatigueLevel('');
        setRecommendations([]);
        setSubmitted(false);
        setError('');
        setSuccess('');
    };

    return (
        <div className="mental-fatigue-checker">
            <div className="fatigue-header">
                <h1>Mental Fatigue Checker</h1>
                <p>Assess your current mental load and get personalized recommendations</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can complete the assessment and see results, but your data won't be saved to your account.
                    </div>
                )}
            </div>

            <div className="assessment-section">
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="assessment-intro">
                            <p>Rate each factor on a scale of 1-5 to assess your current mental state:</p>
                            {!user && (
                                <div className="guest-message">
                                    You can take this assessment without logging in! Results will be shown immediately.
                                </div>
                            )}
                        </div>

                        <div className="factor-group">
                            <div className="factor-item">
                                <label htmlFor="energyLevel">Energy Level</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Low</span>
                                    <input 
                                        type="range" 
                                        id="energyLevel" 
                                        min="1" 
                                        max="5" 
                                        value={answers.energyLevel} 
                                        onChange={(e) => handleSliderChange('energyLevel', e.target.value)}
                                    />
                                    <span className="slider-label-max">High</span>
                                </div>
                                <div className="slider-value">{answers.energyLevel}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="focusLevel">Ability to Focus</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Poor</span>
                                    <input 
                                        type="range" 
                                        id="focusLevel" 
                                        min="1" 
                                        max="5" 
                                        value={answers.focusLevel} 
                                        onChange={(e) => handleSliderChange('focusLevel', e.target.value)}
                                    />
                                    <span className="slider-label-max">Sharp</span>
                                </div>
                                <div className="slider-value">{answers.focusLevel}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="motivationLevel">Motivation Level</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Low</span>
                                    <input 
                                        type="range" 
                                        id="motivationLevel" 
                                        min="1" 
                                        max="5" 
                                        value={answers.motivationLevel} 
                                        onChange={(e) => handleSliderChange('motivationLevel', e.target.value)}
                                    />
                                    <span className="slider-label-max">High</span>
                                </div>
                                <div className="slider-value">{answers.motivationLevel}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="stressLevel">Current Stress Level</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Low</span>
                                    <input 
                                        type="range" 
                                        id="stressLevel" 
                                        min="1" 
                                        max="5" 
                                        value={answers.stressLevel} 
                                        onChange={(e) => handleSliderChange('stressLevel', e.target.value)}
                                    />
                                    <span className="slider-label-max">High</span>
                                </div>
                                <div className="slider-value">{answers.stressLevel}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="mentalClarity">Mental Clarity</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Foggy</span>
                                    <input 
                                        type="range" 
                                        id="mentalClarity" 
                                        min="1" 
                                        max="5" 
                                        value={answers.mentalClarity} 
                                        onChange={(e) => handleSliderChange('mentalClarity', e.target.value)}
                                    />
                                    <span className="slider-label-max">Clear</span>
                                </div>
                                <div className="slider-value">{answers.mentalClarity}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="decisionMaking">Decision Making Ability</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Difficult</span>
                                    <input 
                                        type="range" 
                                        id="decisionMaking" 
                                        min="1" 
                                        max="5" 
                                        value={answers.decisionMaking} 
                                        onChange={(e) => handleSliderChange('decisionMaking', e.target.value)}
                                    />
                                    <span className="slider-label-max">Easy</span>
                                </div>
                                <div className="slider-value">{answers.decisionMaking}</div>
                            </div>

                            <div className="factor-item">
                                <label htmlFor="emotionalState">Emotional State</label>
                                <div className="slider-container">
                                    <span className="slider-label-min">Negative</span>
                                    <input 
                                        type="range" 
                                        id="emotionalState" 
                                        min="1" 
                                        max="5" 
                                        value={answers.emotionalState} 
                                        onChange={(e) => handleSliderChange('emotionalState', e.target.value)}
                                    />
                                    <span className="slider-label-max">Positive</span>
                                </div>
                                <div className="slider-value">{answers.emotionalState}</div>
                            </div>
                        </div>

                        <div className="physical-signs-section">
                            <h3>Are you experiencing any of these physical signs? (Select all that apply)</h3>
                            <div className="signs-options">
                                {physicalSignsOptions.map((sign) => (
                                    <div 
                                        key={sign.id} 
                                        className={`sign-option ${answers.physicalSigns.includes(sign.id) ? 'selected' : ''}`}
                                        onClick={() => handlePhysicalSignToggle(sign.id)}
                                    >
                                        {sign.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="assessment-actions">
                            <button 
                                type="submit" 
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Calculate Mental Fatigue Score'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="results-section">
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <h2>Your Mental Load Assessment</h2>
                        <div className="score-display">
                            <div className={`fatigue-score ${
                                fatigueLevel === 'Low' ? 'low' : 
                                fatigueLevel === 'Moderate' ? 'moderate' : 
                                fatigueLevel === 'High' ? 'high' : 'severe'
                            }`}>
                                {fatigueScore}
                            </div>
                            <div className="fatigue-level">{fatigueLevel} Mental Fatigue</div>
                        </div>

                        <div className="recommendations">
                            <h3>Recommendations</h3>
                            <ul className="recommendations-list">
                                {recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="immediate-actions">
                            <h3>Take Action Now</h3>
                            <div className="immediate-actions-grid">
                                <div className="action-item">
                                    <div className="action-icon">💧</div>
                                    <div className="action-title">Hydrate</div>
                                    <div className="action-description">Drink a glass of water right now</div>
                                </div>
                                <div className="action-item">
                                    <div className="action-icon">🧘</div>
                                    <div className="action-title">Breathe</div>
                                    <div className="action-description">Take 5 deep breaths, in for 4, out for 6</div>
                                </div>
                                <div className="action-item">
                                    <div className="action-icon">🚶</div>
                                    <div className="action-title">Move</div>
                                    <div className="action-description">Stand up and stretch for 2 minutes</div>
                                </div>
                                <div className="action-item">
                                    <div className="action-icon">👁️</div>
                                    <div className="action-title">Rest Eyes</div>
                                    <div className="action-description">Look away from screens for 20 seconds</div>
                                </div>
                            </div>
                        </div>

                        <div className="results-actions">
                            <button 
                                className="secondary-button"
                                onClick={resetAssessment}
                            >
                                Take Assessment Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentalFatigueChecker; 