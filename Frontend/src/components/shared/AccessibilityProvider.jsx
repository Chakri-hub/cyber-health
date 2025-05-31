import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

function AccessibilityProvider({ children }) {
  const { fontSize, textSpacing, hideImages, darkMode } = useSelector(state => state.accessibility);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Apply text spacing
    document.documentElement.style.setProperty('--text-spacing', textSpacing);

    // Apply hide images class
    if (hideImages) {
      document.documentElement.classList.add('hide-images');
    } else {
      document.documentElement.classList.remove('hide-images');
    }

    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [fontSize, textSpacing, hideImages, darkMode]);

  return children;
}

export default AccessibilityProvider; 