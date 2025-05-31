import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import './News.css';
import { newsService } from '../../../services/newsService';
import CustomLoader from '../../shared/Loading Animation/CustomLoader';

function News() {
  const { user } = useSelector(state => state.auth);
  const [newsVideos, setNewsVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeData, setYoutubeData] = useState(null);
  const [exportTips, setExportTips] = useState('');
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [layoutOption, setLayoutOption] = useState(() => {
    const savedLayout = localStorage.getItem('newsLayoutPreference');
    return savedLayout || 'grid'; // Default to grid if no preference is saved
  });
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is admin or super-admin
  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin' || user.is_staff === true || user.is_superuser === true);
  
  useEffect(() => {
    // Clear previous state when user auth changes
    setNewsVideos([]);
    setRequiresLogin(false);
    
    // Add a small delay to make sure token is properly set in localStorage
    const fetchTimer = setTimeout(() => {
      fetchNewsVideos();
      
      // Debug logging for authentication state
      console.log('News component - Auth state:', {
        isAuthenticated: !!user,
        user: user,
        requiresLogin,
        authToken: localStorage.getItem('token')
      });
    }, 100); // Small delay to ensure auth state is fully updated
    
    return () => clearTimeout(fetchTimer);
  }, [user]); // Refetch when user auth state changes
  
  useEffect(() => {
    localStorage.setItem('newsLayoutPreference', layoutOption);
  }, [layoutOption]);
  
  const fetchNewsVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await newsService.getAllNews();
      
      console.log('News API response:', {
        response,
        userAuthenticated: !!user,
        authToken: localStorage.getItem('token'),
        backendAuthDetected: response.auth_detected
      });
      
      // If we have auth token but backend didn't detect it, try refetching once
      const hasToken = !!localStorage.getItem('token');
      if (hasToken && !response.auth_detected && newsVideos.length <= 4) {
        console.log('Auth token exists but backend did not detect it. Will try refetching in 1 second...');
        setTimeout(fetchNewsVideos, 1000);
      }
      
      setNewsVideos(response.news || []);
      
      // Override requiresLogin if user is authenticated - don't show login prompt
      // even if backend incorrectly reports requires_login as true
      if (user) {
        setRequiresLogin(false);
      } else {
        setRequiresLogin(response.requires_login || false);
      }
      
      setTotalCount(response.total_count || 0);
    } catch (error) {
      console.error('Error fetching news videos:', error);
      setError('Failed to load news. Please try again later.');
      setNewsVideos([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrl(e.target.value);
    // Clear previous data when URL changes
    if (youtubeData) {
      setYoutubeData(null);
    }
  };
  
  const fetchYoutubeData = async () => {
    if (!youtubeUrl) {
      alert('Please enter a YouTube video URL');
      return;
    }
    
    // Simple validation for YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(youtubeUrl)) {
      alert('Please enter a valid YouTube URL');
      return;
    }
    
    try {
      setIsFetchingYoutube(true);
      setError(null);
      const data = await newsService.fetchYoutubeData(youtubeUrl);
      
      // Make sure data contains all required fields
      if (!data || !data.title || !data.description) {
        throw new Error('Incomplete data received from YouTube');
      }
      
      console.log('YouTube data fetched:', data);
      setYoutubeData(data);
    } catch (error) {
      setError(`Failed to fetch YouTube data: ${error.message}`);
      alert('Failed to fetch YouTube data: ' + error.message);
    } finally {
      setIsFetchingYoutube(false);
    }
  };
  
  const handleExportTipsChange = (e) => {
    setExportTips(e.target.value);
  };
  
  const handleSaveNews = async () => {
    if (!youtubeData) {
      alert('Please fetch YouTube data first');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await newsService.saveNewsVideo({
        title: youtubeData.title,
        description: youtubeData.description,
        thumbnail_url: youtubeData.thumbnail_url,
        video_url: youtubeUrl,
        expert_tips: exportTips
      });
      
      // Reset form
      setYoutubeUrl('');
      setYoutubeData(null);
      setExportTips('');
      setShowAddTemplate(false);
      
      // Refresh news list
      fetchNewsVideos();
    } catch (error) {
      setError(`Failed to save news: ${error.message}`);
      alert('Failed to save news: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelAdd = () => {
    if (youtubeData || youtubeUrl || exportTips) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        resetForm();
      }
    } else {
      resetForm();
    }
  };
  
  const resetForm = () => {
    setYoutubeUrl('');
    setYoutubeData(null);
    setExportTips('');
    setShowAddTemplate(false);
    setError(null);
  };
  
  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        setIsLoading(true);
        setError(null);
        await newsService.deleteNewsVideo(newsId);
        fetchNewsVideos();
      } catch (error) {
        setError(`Failed to delete news: ${error.message}`);
        alert('Failed to delete news: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Function to extract video ID from YouTube URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return null;
  };

  const handleKeyDown = (e) => {
    // Fetch when user presses Enter in the URL field
    if (e.key === 'Enter') {
      fetchYoutubeData();
    }
  };

  const handleLayoutChange = (layout) => {
    setLayoutOption(layout);
    localStorage.setItem('newsLayoutPreference', layout);
  };

  // Add drag and drop handlers
  const handleDragStart = (e, id) => {
    if (!reorderMode) return;
    setDraggedItemId(id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    if (!reorderMode) return;
    e.currentTarget.classList.remove('dragging');
    setDraggedItemId(null);
  };

  const handleDragOver = (e) => {
    if (!reorderMode) return;
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    if (!reorderMode || !draggedItemId || draggedItemId === targetId) return;
    e.preventDefault();
    
    // Get the indices of the dragged and target items
    const draggedIndex = newsVideos.findIndex(item => item.id === draggedItemId);
    const targetIndex = newsVideos.findIndex(item => item.id === targetId);
    
    // Create a new array with the items reordered
    const reorderedVideos = [...newsVideos];
    const [movedItem] = reorderedVideos.splice(draggedIndex, 1);
    reorderedVideos.splice(targetIndex, 0, movedItem);
    
    // Update the state with the reordered videos
    setNewsVideos(reorderedVideos);
    
    // Update the order in the backend - make sure we're sending an array as expected by the API
    const orderData = reorderedVideos.map((item, index) => ({ 
      id: item.id, 
      order: index 
    }));
    
    saveNewOrder(orderData);
  };

  const saveNewOrder = async (orderData) => {
    try {
      setIsLoading(true);
      console.log('Sending order data to backend:', orderData);
      const result = await newsService.reorderNews(orderData);
      console.log('Reorder success:', result);
    } catch (error) {
      console.error('Error saving new order:', error);
      setError('Failed to save the new order. The changes might not persist after refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add reorder toggle button to layout controls
  const LayoutControls = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="layout-controls">
        <div className="layout-header-row">
          <h3 className="layout-header">Layout Options</h3>
          <button 
            className={`reorder-toggle ${reorderMode ? 'active' : ''}`}
            onClick={() => setReorderMode(!reorderMode)}
            title={reorderMode ? "Exit Reorder Mode" : "Enable Reorder Mode"}
            disabled={isLoading}
          >
            {reorderMode ? (isLoading ? 'Saving...' : 'Exit Reorder Mode') : 'Reorder Videos'}
          </button>
        </div>
        <div className="layout-buttons">
          <button 
            className={`layout-button ${layoutOption === 'grid' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('grid')}
          >
            <span className="layout-icon grid-icon"></span>
            Grid (2×2)
          </button>
          <button 
            className={`layout-button ${layoutOption === 'list' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('list')}
          >
            <span className="layout-icon list-icon"></span>
            List View
          </button>
          <button 
            className={`layout-button ${layoutOption === 'featured' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('featured')}
          >
            <span className="layout-icon featured-icon"></span>
            Featured
          </button>
        </div>
        {reorderMode && (
          <p className="reorder-instructions">
            {isLoading ? 'Saving changes...' : 'Drag and drop videos to reorder them. Changes are saved automatically.'}
          </p>
        )}
      </div>
    );
  };

  // Function to force fetch all videos
  const handleForceLoadAllVideos = () => {
    // Override the requiresLogin flag and refetch
    console.log('Forcing fetch of all videos for authenticated user');
    setRequiresLogin(false);
    fetchNewsVideos();
  };

  // Function to render the login prompt
  const renderLoginPrompt = () => {
    // Don't show login prompt if user is authenticated or if requiresLogin is false
    if (user || !requiresLogin) return null;
    
    const hiddenCount = totalCount - newsVideos.length;
    
    // Function to handle auth redirect with specific tab
    const handleAuthRedirect = (tab) => (e) => {
      e.stopPropagation();
      // Navigate to home and dispatch an action to show the auth modal
      navigate('/', { state: { showAuth: true, authTab: tab } });
    };
    
    return (
      <div className="login-prompt-container" onClick={() => navigate('/', { state: { showAuth: true, authTab: 'login' } })}>
        <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
          <div className="lock-icon">🔒</div>
          <h3>Access More Cybersecurity News</h3>
          <p>
            {hiddenCount} more videos are available after login. 
            Create a free account to access all cybersecurity news and resources.
          </p>
          <div className="login-buttons">
            <button 
              className="login-button" 
              onClick={handleAuthRedirect('login')}
            >
              Login to Continue
            </button>
            <button 
              className="register-link" 
              onClick={handleAuthRedirect('register')}
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="news-container" id="news-section">
      <h1>Cybersecurity News</h1>
      <p className="news-intro" style={{ color: 'white' }}>
        Stay informed about the latest cybersecurity threats, breaches, and industry updates.
        Knowledge is your first line of defense in the digital world.
      </p>
      
      {error && !isLoading && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="dismiss-error">×</button>
        </div>
      )}
      
      {/* Button to force load all videos if user is logged in but only seeing limited videos */}
      {user && newsVideos.length > 0 && newsVideos.length <= 4 && (
        <div className="refresh-container">
          <button 
            className="refresh-videos-button"
            onClick={handleForceLoadAllVideos}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Show All Videos For Logged-in Users'}
          </button>
          <p className="refresh-note">You're logged in but only seeing limited videos. Click to load all content.</p>
        </div>
      )}
      
      {isAdmin && (
        <div className="admin-controls">
          {!showAddTemplate ? (
            <button 
              className="add-news-button"
              onClick={() => setShowAddTemplate(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add News Video'}
            </button>
          ) : (
            <div className="news-template-card">
              <div className="news-template-header">
                <div className="header-title">Add YouTube Video</div>
                <div className="button-container">
                  <button 
                    className="close-button" 
                    onClick={handleCancelAdd}
                  >
                    ×
                  </button>
                  <button 
                    className="save-button" 
                    onClick={handleSaveNews}
                    disabled={!youtubeData || isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              
              <div className="news-template-content">
                <div className="template-column">
                  <div className="template-field">
                    <label>Video Title</label>
                    <input 
                      type="text" 
                      readOnly={!isAdmin}  
                      value={youtubeData ? youtubeData.title : ''}
                      onChange={(e) => youtubeData && setYoutubeData({...youtubeData, title: e.target.value})}
                      placeholder="Video title will appear here after fetching"
                      className="youtube-data-field"
                    />
                    {isAdmin && youtubeData && <small className="input-help">As admin, you can edit the video title</small>}
                  </div>
                  
                  <div className="template-field">
                    <label>YouTube Video Preview</label>
                    <div className="video-preview">
                      {isFetchingYoutube ? (
                        <div className="loading-preview">Loading video data...</div>
                      ) : youtubeData ? (
                        <iframe
                          src={getYoutubeEmbedUrl(youtubeUrl)}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="fullscreen"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="empty-preview">YouTube video preview will appear here</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="template-field required">
                    <label>
                      Video Link <span>(YouTube URL)</span>
                      <button 
                        className="fetch-button" 
                        onClick={fetchYoutubeData}
                        disabled={isFetchingYoutube || !youtubeUrl}
                        title="Fetch video data"
                      >
                        {isFetchingYoutube ? '...' : '+'}
                      </button>
                    </label>
                    <input 
                      type="text"
                      value={youtubeUrl}
                      onChange={handleYoutubeUrlChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter a valid YouTube video URL"
                      disabled={isFetchingYoutube}
                    />
                    <small className="input-help">Paste a YouTube URL and click + or press Enter to fetch video data</small>
                  </div>
                </div>
                
                <div className="template-column">
                  <div className="template-field">
                    <label>Video Description</label>
                    <textarea 
                      readOnly={!isAdmin}
                      value={youtubeData ? youtubeData.description : ''}
                      onChange={(e) => youtubeData && setYoutubeData({...youtubeData, description: e.target.value})}
                      placeholder="Video description will appear here after fetching"
                      className="youtube-data-field"
                    ></textarea>
                    {isAdmin && youtubeData && <small className="input-help">As admin, you can edit the video description</small>}
                  </div>
                  
                  <div className="template-field">
                    <label>Expert Tips</label>
                    <textarea
                      value={exportTips}
                      onChange={handleExportTipsChange}
                      placeholder="Add your cybersecurity expert tips related to this video"
                      disabled={!youtubeData}
                    ></textarea>
                    <small className="input-help">Share your professional insights about the video content</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <CustomLoader />
      ) : newsVideos.length > 0 ? (
        <>
          <LayoutControls />
          <div className={`news-grid ${layoutOption}-layout`}>
            {newsVideos.map(news => (
              <div 
                className={`news-video-card ${reorderMode ? 'reorder-mode' : ''}`}
                key={news.id}
                draggable={reorderMode}
                onDragStart={(e) => handleDragStart(e, news.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, news.id)}
              >
                {reorderMode && <div className="drag-handle"></div>}
                <div className="news-video-preview">
                  <iframe
                    src={getYoutubeEmbedUrl(news.video_url)}
                    title={news.title}
                    frameBorder="0"
                    allow="fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="news-video-info">
                  <h3>{news.title}</h3>
                  <p style={{ color: 'black' }} className="news-video-description">{news.description}</p>
                  
                  {news.expert_tips && (
                    <div className="news-expert-tips">
                      <h4>Expert Tips</h4>
                      <p>{news.expert_tips}</p>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <button 
                    className="delete-news-button"
                    onClick={() => handleDeleteNews(news.id)}
                    title="Delete video"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Render login prompt after videos if needed */}
          {renderLoginPrompt()}
        </>
      ) : (
        <div className="empty-state">
          <p>No cybersecurity news videos available yet.</p>
          {isAdmin && (
            <button 
              className="add-news-button"
              onClick={() => setShowAddTemplate(true)}
            >
              Add First Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default News;