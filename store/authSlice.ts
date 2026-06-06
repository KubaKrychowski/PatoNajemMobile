import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Inicjalizacja sesji — odczyt z SecureStore przy starcie aplikacji
export const initAuth = createAsyncThunk('auth/init', async () => {
  const token = await authService.getToken();
  if (!token) return { user: null, token: null };
  try {
    const user = await authService.getMe(token);
    return { user, token };
  } catch {
    await authService.logout();
    return { user: null, token: null };
  }
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Błąd logowania');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // init
      .addCase(initAuth.fulfilled, (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      })
      // login
      .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
