import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import submissionReducer from '../submissionSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    submission: submissionReducer,
  },
});

