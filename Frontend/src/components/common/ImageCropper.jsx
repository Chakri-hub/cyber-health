import React, { useState, useRef, useEffect } from 'react';
import './ImageCropper.css';

const ImageCropper = ({ onCropComplete, onClose, onRemove, hasExistingImage, existingImageUrl }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (png, jpg, jpeg)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      setError('');
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    if (onRemove && typeof onRemove === 'function') {
      onRemove();
    }
    onClose();
  };

  const handleViewProfilePicture = () => {
    if (existingImageUrl) {
      window.open(existingImageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // This effect runs whenever src changes to create the circular crop
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.onload = () => {
      // Get image dimensions
      const width = img.width;
      const height = img.height;
      
      // Calculate the crop - use the smaller dimension for a perfect circle
      const size = Math.min(width, height);
      const x = (width - size) / 2;
      const y = (height - size) / 2;
      
      // Create canvas for the cropped image
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = size;
      
      // Draw the circular crop
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create a circle
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      // Draw the image
      ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
      
      // Store the image reference
      imgRef.current = img;
    };
    
    img.src = src;
  }, [src]);

  const handleSave = () => {
    if (!src || !canvasRef.current) {
      setError('Please select an image first');
      return;
    }
    
    setLoading(true);
    
    try {
      canvasRef.current.toBlob(
        (blob) => {
          if (!blob) {
            setError('Failed to create image blob');
            setLoading(false);
            return;
          }
          
          // Create a File object from the Blob
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          
          // Call the onCropComplete callback with the cropped image
          onCropComplete(file);
          setLoading(false);
        },
        'image/jpeg',
        0.95 // Quality
      );
    } catch (err) {
      setError('Error processing image: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="image-cropper-modal">
        <div className="modal-header">
          <h2>Upload Profile Picture</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}
          
          {!src && (
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-upload-label">
                <span className="upload-icon">+</span>
                <span>Select an Image</span>
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                onChange={onSelectFile}
                className="file-input"
              />
              <p className="file-instructions">
                Select a JPG, PNG, or JPEG image (max 5MB)
              </p>
            </div>
          )}
          
          {src && (
            <div className="crop-container">
              <div className="image-preview">
                <h3>Original Image</h3>
                <div className="original-image-container">
                  <img 
                    src={src} 
                    alt="Original" 
                    className="original-image" 
                  />
                </div>
              </div>
              
              <div className="preview-container">
                <h3>Preview</h3>
                <div className="canvas-container">
                  <canvas
                    ref={canvasRef}
                    className="preview-canvas"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {!src && hasExistingImage && (
            <div className="button-group">
              <button 
                className="view-button" 
                onClick={handleViewProfilePicture}
              >
                View Profile Picture
              </button>
              <button 
                className="delete-button" 
                onClick={handleRemove}
              >
                Remove Profile Picture
              </button>
            </div>
          )}
          
          {src && (
            <>
              <button 
                className="cancel-button" 
                onClick={() => setSrc(null)}
                disabled={loading}
              >
                Change Image
              </button>
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Save Profile Picture'}
              </button>
            </>
          )}
          
          {!src && !hasExistingImage && (
            <button 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 