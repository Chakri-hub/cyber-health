import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthModal: false,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    showAuthModal: (state) => {
      state.showAuthModal = true;
    },
    hideAuthModal: (state) => {
      state.showAuthModal = false;
    },
  },
});

export const { showAuthModal, hideAuthModal } = modalSlice.actions;

export default modalSlice.reducer; 