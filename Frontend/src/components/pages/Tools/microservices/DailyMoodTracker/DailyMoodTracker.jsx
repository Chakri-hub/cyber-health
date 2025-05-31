import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../../../services/healthService';
import { format } from 'date-fns';
import './DailyMoodTracker.css';

const DailyMoodTracker = () => {
    const auth = useSelector((state) => state.auth);
    const { user } = auth;
    const [activeTab, setActiveTab] = useState('track');
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [history, setHistory] = useState([]);

    // Define mood options
    const moodOptions = [
        { value: 1, emoji: '😢', label: 'Very Sad' },
        { value: 2, emoji: '😔', label: 'Sad' },
        { value: 3, emoji: '😐', label: 'Neutral' },
        { value: 4, emoji: '🙂', label: 'Happy' },
        { value: 5, emoji: '😄', label: 'Very Happy' }
    ];

    // Define tag options
    const tagOptions = [
        { id: 1, label: 'Anxious' },
        { id: 2, label: 'Tired' },
        { id: 3, label: 'Energetic' },
        { id: 4, label: 'Calm' },
        { id: 5, label: 'Stressed' },
        { id: 6, label: 'Grateful' },
        { id: 7, label: 'Hopeful' },
        { id: 8, label: 'Frustrated' }
    ];

    useEffect(() => {
        if (activeTab === 'history' && user) {
            fetchMoodHistory();
        }
    }, [activeTab, user]);

    const fetchMoodHistory = async () => {
        try {
            setLoading(true);
            const response = await healthService.getMoodHistory(user.id);
            
            if (response.success && response.records) {
                setHistory(response.records);
            } else if (response.records) {
                setHistory(response.records);
            } else if (Array.isArray(response)) {
                setHistory(response);
            } else {
                console.error('Unexpected response format:', response);
                setError('Failed to parse mood history. Check console for details.');
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching mood history:', err);
            setError('Failed to load mood history. Please try again.');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
    };

    const handleTagToggle = (tagId) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(id => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const sanitizeInput = (input) => {
        // Basic sanitization: remove HTML tags and script elements
        return input.replace(/<[^>]*>?/gm, '')
                   .replace(/javascript:/gi, '')
                   .trim();
    };

    const handleNotesChange = (e) => {
        const value = e.target.value;
        
        // Restrict special characters and numbers, allow only letters, spaces, and basic punctuation
        const sanitizedValue = value.replace(/[^a-zA-Z\s.,!?;:()'-]/g, '');
        
        setNotes(sanitizedValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setError('');
        setSuccess('');
        
        if (!selectedMood) {
            setError('Please select your mood');
            return;
        }

        if (!user) {
            setError('Please sign in to save your mood data');
            return;
        }

        try {
            setLoading(true);
            
            // Ensure we're using the current date/time (not future dates)
            const now = new Date();
            const currentDate = format(now, 'yyyy-MM-dd');
            const currentTime = format(now, 'HH:mm');
            
            // Prepare the mood data
            const moodData = {
                mood: selectedMood.value,
                moodLabel: selectedMood.label,
                tags: selectedTags.map(tagId => {
                    const tag = tagOptions.find(t => t.id === tagId);
                    return tag ? tag.label : '';
                }),
                notes: sanitizeInput(notes),
                date: currentDate,
                time: currentTime,
                // Use a locally formatted timestamp to avoid timezone issues
                timestamp: now.toISOString()
            };
            
            console.log('Saving mood data:', moodData);
            
            try {
                // Add retry logic for network issues
                let retries = 2;
                let response;
                
                while (retries >= 0) {
                    try {
                        response = await healthService.saveMood(user.id, moodData);
                        break; // Success, exit the retry loop
                    } catch (err) {
                        if (retries === 0) throw err; // Last attempt failed
                        console.log(`Retry attempt ${2-retries+1} for saving mood...`);
                        retries--;
                        // Wait a bit before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                console.log('Save mood response:', response);
                
                setSuccess('Mood recorded successfully!');
                
                // Reset form
                setSelectedMood(null);
                setSelectedTags([]);
                setNotes('');
                
                // Refresh history with a small delay
                setTimeout(() => {
                    fetchMoodHistory();
                }, 500);
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } catch (saveError) {
                console.error('Error saving mood:', saveError);
                setError(`Failed to save mood data: ${saveError.message || 'Network or server error'}`);
            }
        } catch (err) {
            console.error('Error preparing mood data:', err);
            setError(`Failed to prepare mood data: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to render the mood history chart
    const renderMoodChart = () => {
        if (history.length === 0) {
            return <div className="no-data">No mood data available</div>;
        }

        // Sort history by date
        const sortedHistory = [...history].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        return (
            <div className="mood-chart">
                <h3>Your Mood Trend</h3>
                <div className="chart-container">
                    {sortedHistory.map((entry, index) => {
                        const mood = moodOptions.find(m => m.value === entry.mood) || moodOptions[2]; // Default to neutral
                        
                        return (
                            <div key={index} className="chart-point">
                                <div className="mood-emoji" style={{ height: `${entry.mood * 20}%` }}>
                                    {mood.emoji}
                                </div>
                                <div className="chart-date">
                                    {format(new Date(entry.timestamp), 'MM/dd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="daily-mood-tracker">
            <div className="mood-tracker-header">
                <h1>Daily Mood Tracker</h1>
                <p>Track your mood and emotional well-being</p>
                {!user && (
                    <div className="warning-message">
                        You are not logged in. You can see the tracker interface but cannot save readings or view history.
                    </div>
                )}
            </div>

            <div className="tabs">
                <button 
                    className={activeTab === 'track' ? 'active' : ''} 
                    onClick={() => setActiveTab('track')}
                >
                    Track Mood
                </button>
                <button 
                    className={`${activeTab === 'history' ? 'active' : ''} ${!user ? 'disabled-tab' : ''}`}
                    onClick={() => user ? setActiveTab('history') : setError('Please log in to view your mood history')}
                >
                    View History
                </button>
            </div>

            {activeTab === 'track' && (
                <div className="track-section">
                    <form onSubmit={handleSubmit}>
                        <div className="mood-selector">
                            <h3>How are you feeling today?</h3>
                            <div className="mood-options">
                                {moodOptions.map((mood) => (
                                    <div 
                                        key={mood.value} 
                                        className={`mood-option ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                                        onClick={() => handleMoodSelect(mood)}
                                    >
                                        <div className="mood-emoji">{mood.emoji}</div>
                                        <div className="mood-label">{mood.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="tag-selector">
                            <h3>Any specific feelings? (Optional)</h3>
                            <div className="tag-options">
                                {tagOptions.map((tag) => (
                                    <div 
                                        key={tag.id} 
                                        className={`tag-option ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                                        onClick={() => handleTagToggle(tag.id)}
                                    >
                                        {tag.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="notes-section">
                            <h3>Journal (Optional)</h3>
                            <textarea 
                                value={notes} 
                                onChange={handleNotesChange}
                                placeholder="Write about your day, thoughts, or feelings... (letters and punctuation only)"
                                maxLength={500}
                            />
                            <div className="char-count">{notes.length}/500</div>
                        </div>

                        <div className="current-datetime-info">
                            <p>Your mood will be recorded with the current date and time.</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading || !selectedMood}
                        >
                            {loading ? 'Saving...' : 'Save Mood'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="history-section">
                    {!user ? (
                        <div className="auth-required">
                            <h3>Authentication Required</h3>
                            <p>Please log in to view your mood history.</p>
                        </div>
                    ) : loading ? (
                        <div className="loading">Loading your mood history...</div>
                    ) : (
                        <>
                            {renderMoodChart()}
                            
                            <div className="mood-history">
                                <h3>Recent Entries</h3>
                                {history.length === 0 ? (
                                    <div className="no-data">No mood entries found</div>
                                ) : (
                                    <div className="history-list">
                                        {[...history]
                                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                            .slice(0, 10)
                                            .map((entry, index) => {
                                                const mood = moodOptions.find(m => m.value === entry.mood) || moodOptions[2];
                                                
                                                return (
                                                    <div key={index} className="history-item">
                                                        <div className="history-date">
                                                            {format(new Date(entry.timestamp), 'MMM dd, yyyy')}
                                                            <span className="history-time">{format(new Date(entry.timestamp), 'h:mm a')}</span>
                                                        </div>
                                                        <div className="history-mood">
                                                            <span className="history-emoji">{mood.emoji}</span>
                                                            <span className="history-label">{mood.label}</span>
                                                        </div>
                                                        {entry.tags && entry.tags.length > 0 && (
                                                            <div className="history-tags">
                                                                {entry.tags.map((tag, i) => (
                                                                    <span key={i} className="history-tag">{tag}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {entry.notes && (
                                                            <div className="history-notes">{entry.notes}</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyMoodTracker; 