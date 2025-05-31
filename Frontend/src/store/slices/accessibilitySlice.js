import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
  textSpacing: parseFloat(localStorage.getItem('textSpacing')) || 1,
  hideImages: localStorage.getItem('hideImages') === 'true' || false,
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
};

export const accessibilitySlice = createSlice({
  name: 'accessibility',
  initialState,
  reducers: {
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },
    setTextSpacing: (state, action) => {
      state.textSpacing = action.payload;
      localStorage.setItem('textSpacing', action.payload);
    },
    setHideImages: (state, action) => {
      state.hideImages = action.payload;
      localStorage.setItem('hideImages', action.payload);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
    resetSettings: (state) => {
      state.fontSize = 16;
      state.textSpacing = 1;
      state.hideImages = false;
      state.darkMode = false;
      localStorage.setItem('fontSize', '16');
      localStorage.setItem('textSpacing', '1');
      localStorage.setItem('hideImages', 'false');
      localStorage.setItem('darkMode', 'false');
    },
  },
});

export const { 
  setFontSize, 
  setTextSpacing, 
  setHideImages, 
  setDarkMode, 
  resetSettings 
} = accessibilitySlice.actions;

export default accessibilitySlice.reducer; 