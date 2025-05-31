import { configureStore } from '@reduxjs/toolkit';
import accessibilityReducer from './slices/accessibilitySlice';
import authReducer from './slices/authSlice';
import modalReducer from './slices/modalSlice';

export const store = configureStore({
  reducer: {
    accessibility: accessibilityReducer,
    auth: authReducer,
    modal: modalReducer,
  },
});

export default store; 