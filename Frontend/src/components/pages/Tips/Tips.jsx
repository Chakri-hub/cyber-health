import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { tipService } from '../../../services/tipService';
import { showAuthModal } from '../../../store/slices/modalSlice';
import './Tips.css';
import CustomLoader from '../../shared/Loading Animation/CustomLoader';

function Tips() {
  const auth = useSelector((state) => state.auth);
  const { user, token } = auth;
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const [templateForms, setTemplateForms] = useState([]);
  const [savedTemplateId, setSavedTemplateId] = useState(null); // Track which template was just saved
  const fileInputRefs = useRef([]);
  const topRef = useRef(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [layout, setLayout] = useState('grid'); // grid, list, featured
  // Define how many tips to show for unauthenticated users
  const TIPS_LIMIT_FOR_UNAUTHENTICATED = 6; // This is approximately 2 rows (3 tips per row)

  // Reset state when auth changes (login/logout)
  useEffect(() => {
    // Clear template forms when user logs out
    if (!user) {
      setTemplateForms([]);
    }
    
    // Update admin status
    if (user) {
      // Check for super-admin (protected account)
      if (user.email === 'pchakradhar91@gmail.com' || user.is_superuser === true) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
      } else if (user.role === 'admin' || user.is_staff === true) {
        // Check both role property and is_staff property
        setIsAdmin(true);
        setIsSuperAdmin(false);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    } else {
      // If user is null (logged out), reset admin privileges
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, [user]);

  // Fetch tips on component mount
  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const response = await tipService.getAllTips();
      setTips(response.tips || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
      // Set error message for user display
      setError('Failed to load cybersecurity tips. Please try again later.');
      // Set empty array on error to avoid undefined tips
      setTips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = () => {
    const newTemplate = {
      id: Date.now(), // Use timestamp as temporary ID
      text: '',
      image: null
    };
    setTemplateForms([...templateForms, newTemplate]);
  };

  const handleFileChange = (e, templateId) => {
    if (e.target.files && e.target.files[0]) {
      setTemplateForms(templateForms.map(template => 
        template.id === templateId 
          ? { ...template, image: e.target.files[0] } 
          : template
      ));
    }
  };

  const handleTextChange = (e, templateId) => {
    setTemplateForms(templateForms.map(template => 
      template.id === templateId 
        ? { ...template, text: e.target.value } 
        : template
    ));
  };

  const handleSaveTip = async (templateId) => {
    const templateToSave = templateForms.find(t => t.id === templateId);
    
    if (!templateToSave || (!templateToSave.text && !templateToSave.image)) {
      alert('Please add some text or select an image/video file');
      return;
    }

    try {
      setIsLoading(true);
      await tipService.saveTip(templateToSave, token);
      
      // Set the saved template ID to show success state
      setSavedTemplateId(templateId);
      
      // Reset the saved state after 2 seconds
      setTimeout(() => {
        setSavedTemplateId(null);
        // Remove the template from the forms list
        setTemplateForms(templateForms.filter(t => t.id !== templateId));
        // Refresh tips list
        fetchTips();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving tip:', error);
      alert('Failed to save tip: ' + error.message);
      setSavedTemplateId(null);
      setIsLoading(false);
    }
  };

  const handleRemoveTemplate = (templateId) => {
    setTemplateForms(templateForms.filter(t => t.id !== templateId));
  };

  const handleDeleteTip = async (tipId) => {
    if (!window.confirm('Are you sure you want to delete this tip?')) {
      return;
    }

    try {
      setIsLoading(true);
      await tipService.deleteTip(tipId, token);
      // Refresh tips list
      fetchTips();
    } catch (error) {
      console.error('Error deleting tip:', error);
      alert('Failed to delete tip: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine tips to display based on authentication status
  const getTipsToDisplay = () => {
    if (user) {
      // If user is authenticated, return all tips
      return tips;
    } else {
      // If user is not authenticated, return only the first two rows (limited number)
      return tips.slice(0, TIPS_LIMIT_FOR_UNAUTHENTICATED);
    }
  };

  // Handle login button click
  const handleLoginClick = () => {
    // Find the auth-card element
    const authCard = document.querySelector('.auth-card');
    
    if (authCard) {
      // Scroll to the auth-card with offset to center it in the viewport
      const offset = authCard.offsetTop - (window.innerHeight / 2) + (authCard.offsetHeight / 2);
      
      // Scroll to the auth-card
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    } else {
      // Fallback to scrolling to top if auth-card not found
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Show modal after scrolling animation completes
    setTimeout(() => {
      dispatch(showAuthModal());
      
      // After modal appears, find auth-card again (it may not exist until modal is shown)
      setTimeout(() => {
        const authCardAfterModalShown = document.querySelector('.auth-card');
        if (authCardAfterModalShown) {
          const newOffset = authCardAfterModalShown.offsetTop - (window.innerHeight / 2) + (authCardAfterModalShown.offsetHeight / 2);
          window.scrollTo({
            top: newOffset,
            behavior: 'smooth'
          });
        }
      }, 100);
    }, 700);
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
    const draggedIndex = tips.findIndex(item => item.id === draggedItemId);
    const targetIndex = tips.findIndex(item => item.id === targetId);
    
    // Create a new array with the items reordered
    const reorderedTips = [...tips];
    const [movedItem] = reorderedTips.splice(draggedIndex, 1);
    reorderedTips.splice(targetIndex, 0, movedItem);
    
    // Update the state with the reordered tips
    setTips(reorderedTips);
    
    // Update the backend with the new order
    saveNewOrder(reorderedTips.map((item, index) => ({ id: item.id, order: index })));
  };

  // Save the new order to the backend
  const saveNewOrder = async (orderData) => {
    try {
      setIsLoading(true);
      await tipService.reorderTips(orderData);
    } catch (error) {
      console.error('Error saving new order:', error);
      // Revert to original order if there's an error
      fetchTips();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };
  
  // Get CSS class based on current layout
  const getLayoutClass = () => {
    switch(layout) {
      case 'list': return 'list-layout';
      case 'featured': return 'featured-layout';
      default: return 'grid-layout';
    }
  };

  return (
    <>
      {/* Named anchor at the top of page */}
      <a id="top" name="top" ref={topRef} style={{ position: 'absolute', top: 0 }}></a>
      
      <div className="tips-container" id="tips-section">
        <h1>Cybersecurity Tips</h1>
        <p className="tips-intro" style={{ color: 'white' }}>
          Explore practical cybersecurity advice and best practices to protect your digital life.
          These tips are designed to help individuals and organizations strengthen their cyber defenses.
        </p>

        {/* Error message display */}
        {error && !isLoading && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="dismiss-error">×</button>
          </div>
        )}

        {/* Admin Templates Section */}
        {isAdmin && (
          <div className="admin-templates-section">
            <div className="admin-controls">
              <div className="add-template-button" onClick={handleAddTemplate}>
                <span>Add Templates</span>
                <span className="plus-icon">+</span>
              </div>
            </div>
            
            <div className="layout-options-wrapper">
              <div className="layout-options">
                <h3 style={{ color: 'white' }}>Layout Options</h3>
                <div className="layout-buttons">
                  <button 
                    className={`layout-button ${layout === 'grid' ? 'active' : ''}`}
                    onClick={() => handleLayoutChange('grid')}
                  >
                    <span className="grid-icon">□</span> Grid (3×3)
                  </button>
                  <button 
                    className={`layout-button ${layout === 'list' ? 'active' : ''}`}
                    onClick={() => handleLayoutChange('list')}
                  >
                    <span className="list-icon">≡</span> List View
                  </button>
                  <button 
                    className={`layout-button ${layout === 'featured' ? 'active' : ''}`}
                    onClick={() => handleLayoutChange('featured')}
                  >
                    <span className="featured-icon">◩</span> Featured
                  </button>
                </div>
              </div>
              
              <button 
                className={`reorder-button ${reorderMode ? 'active' : ''}`}
                onClick={() => setReorderMode(!reorderMode)}
              >
                {reorderMode ? 'Exit Reorder Mode' : 'Reorder Tips'}
              </button>
            </div>
              
            {reorderMode && (
              <p className="reorder-instructions">Drag and drop tips to reorder them. Changes are saved automatically.</p>
            )}
            
            {/* New template forms */}
            {templateForms.length > 0 && (
              <div className={`templates-grid ${getLayoutClass()}`}>
                {templateForms.map((template, index) => (
                  <div className="template-card" key={template.id}>
                    <span className="close-button" onClick={() => handleRemoveTemplate(template.id)}>×</span>
                    <div 
                      className="template-media-area" 
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      {template.image ? (
                        <div className="image-preview">
                          {template.image.type.startsWith('image/') ? (
                            <>
                              <span 
                                className="media-delete-button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateForms(templateForms.map(temp => 
                                    temp.id === template.id ? {...temp, image: null} : temp
                                  ));
                                }}
                              >
                                ×
                              </span>
                              <img 
                                src={URL.createObjectURL(template.image)} 
                                alt="Preview" 
                                className="uploaded-image-preview" 
                              />
                            </>
                          ) : (
                            <>
                              <span 
                                className="media-delete-button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateForms(templateForms.map(temp => 
                                    temp.id === template.id ? {...temp, image: null} : temp
                                  ));
                                }}
                              >
                                ×
                              </span>
                              <div className="file-name-preview">
                                {template.image.name}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="plus-icon">+</div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*,video/mp4" 
                        onChange={(e) => handleFileChange(e, template.id)} 
                        ref={el => fileInputRefs.current[index] = el}
                        style={{ display: 'none' }} 
                      />
                    </div>
                    <div className="template-text-area">
                      <label>Tips:</label>
                      <textarea 
                        value={template.text} 
                        onChange={(e) => handleTextChange(e, template.id)} 
                        placeholder="Enter cybersecurity tip here..."
                      />
                    </div>
                    <button 
                      className={`save-template-button ${savedTemplateId === template.id ? 'saved hide-button' : ''}`}
                      onClick={() => handleSaveTip(template.id)}
                      disabled={isLoading || savedTemplateId === template.id}
                    >
                      {isLoading && savedTemplateId !== template.id ? 'Saving...' : 
                       savedTemplateId === template.id ? 'SAVED ✓' : 'SAVE'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Display existing tip templates for admin */}
            {tips.length > 0 && (
              <div className={`templates-grid existing-templates ${getLayoutClass()}`}>
                {tips.map((tip, index) => (
                  <div 
                    className={`template-card ${reorderMode ? 'reorder-mode' : ''}`}
                    key={tip.id}
                    draggable={reorderMode}
                    onDragStart={(e) => handleDragStart(e, tip.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, tip.id)}
                  >
                    {reorderMode && <div className="drag-handle"></div>}
                    <span className="close-button" onClick={() => handleDeleteTip(tip.id)}>×</span>
                    
                    <div className="template-media-area">
                      {tip.image_url ? (
                        <>
                          <span 
                            className="media-delete-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Remove this image from the tip?')) {
                                // Here you would implement API call to remove just the image
                                console.log('Would remove image from tip:', tip.id);
                              }
                            }}
                          >
                            ×
                          </span>
                          <img src={tip.image_url} alt={tip.title} className="template-image" />
                        </>
                      ) : (
                        <div className="plus-icon">+</div>
                      )}
                    </div>
                    <div className="template-text-area">
                      <label>Tips:</label>
                      <p>{tip.content}</p>
                    </div>
                    <div className="template-order">
                      <span>Position: {index + 1}</span>
                    </div>
                    <button className="save-template-button">SAVE</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Display tips for regular users */}
        {!isAdmin && tips.length > 0 && (
          <div className="user-tips-container">
            <div className={`user-tips-view ${getLayoutClass()}`}>
              {getTipsToDisplay().map(tip => (
                <div 
                  className={`tip-display-card`} 
                  key={tip.id}
                >
                  {tip.image_url && (
                    <div className="tip-media">
                      {tip.image_url.endsWith('.mp4') ? (
                        <video src={tip.image_url} controls className="tip-video"></video>
                      ) : (
                        <img src={tip.image_url} alt={tip.title} className="tip-image" />
                      )}
                    </div>
                  )}
                  <div className="tip-content">
                    <p>{tip.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Login prompt for unauthenticated users if there are more tips */}
            {!user && tips.length > TIPS_LIMIT_FOR_UNAUTHENTICATED && (
              <div className="login-prompt-container">
                <div className="login-prompt">
                  <h3>Want to see more cybersecurity tips?</h3>
                  <p>Please log in to access all our cybersecurity tips and resources.</p>
                  <a href="#top" className="login-button" onClick={(e) => {
                    e.preventDefault(); // Prevent default anchor behavior
                    handleLoginClick();
                  }}>
                    Login / Register
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && <CustomLoader />}
      </div>
    </>
  );
}

export default Tips;