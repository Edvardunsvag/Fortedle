import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getTokenFromStorage = (): string | null => {
  try {
    const token = localStorage.getItem('huma:accessToken');
    if (!token) return null;
    
    const parsed = JSON.parse(token);
    // Handle array format: ["token"] -> extract first element
    if (Array.isArray(parsed) && parsed.length > 0) {
      return typeof parsed[0] === 'string' ? parsed[0] : null;
    }
    // Handle string format
    if (typeof parsed === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  accessToken: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      // Handle token that might be pasted as JSON string (array format)
      let token = action.payload.trim();
      
      // Try to parse if it looks like JSON
      if (token.startsWith('[') || token.startsWith('"')) {
        try {
          const parsed = JSON.parse(token);
          if (Array.isArray(parsed) && parsed.length > 0) {
            token = typeof parsed[0] === 'string' ? parsed[0] : token;
          } else if (typeof parsed === 'string') {
            token = parsed;
          }
        } catch {
          // If parsing fails, use the original token
        }
      }
      
      state.accessToken = token;
      state.isAuthenticated = true;
      try {
        // Store as string in our localStorage
        localStorage.setItem('huma:accessToken', JSON.stringify(token));
      } catch (error) {
        console.error('Failed to save token to localStorage:', error);
      }
    },
    clearToken: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('huma:accessToken');
      } catch (error) {
        console.error('Failed to remove token from localStorage:', error);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    checkToken: (state) => {
      const token = getTokenFromStorage();
      state.accessToken = token;
      state.isAuthenticated = !!token;
    },
  },
});

export const { setToken, clearToken, setLoading, checkToken } = authSlice.actions;

export const selectAccessToken = (state: RootState): string | null => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState): boolean => state.auth.isLoading;

export default authSlice.reducer;

