import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import offersReducer from './offersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    offers: offersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
