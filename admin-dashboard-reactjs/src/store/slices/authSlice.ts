import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiManager from '../../api';
import config from '../../config';

// Types
export interface User {
  id: number;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem(config.auth.tokenStorageKey),
  refreshToken: localStorage.getItem(config.auth.refreshTokenStorageKey),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Mock API calls (replace with real API calls when backend is ready)
const mockLoginAPI = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (credentials.email === 'john.doe@volcanion.com' && credentials.password === 'password123') {
    const now = new Date();
    return {
      user: {
        id: 1,
        email: 'john.doe@volcanion.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '0123456789',
        date_of_birth: new Date('1990-11-24'),
        gender: 'male',
        avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
        is_verified: true,
        is_active: true,
        last_login: now,
        created_at: now,
        updated_at: now,
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

const mockRefreshTokenAPI = async (refreshToken: string): Promise<{ accessToken: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (refreshToken.startsWith('mock-refresh-token')) {
    return {
      accessToken: 'mock-access-token-' + Date.now(),
    };
  } else {
    throw new Error('Invalid refresh token');
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      let response;
      
      if (config.api.mockAPI) {
        // Use mock API for development
        console.log('🔧 Using Mock API for login');
        response = await mockLoginAPI(credentials);
      } else {
        // Use real API
        console.log('🌐 Using Real API for login');
        const apiResponse = await apiManager.auth.login({
          email: credentials.email,
          password: credentials.password
        });
        
        if (apiResponse.success && apiResponse.data) {
          response = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Login failed');
        }
      }
      
      // Store tokens in localStorage
      localStorage.setItem(config.auth.tokenStorageKey, response.accessToken);
      localStorage.setItem(config.auth.refreshTokenStorageKey, response.refreshToken);
      localStorage.setItem(config.auth.userStorageKey, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      let response;
      
      if (config.api.mockAPI) {
        // Use mock API for development
        console.log('🔧 Using Mock API for token refresh');
        response = await mockRefreshTokenAPI(refreshToken);
      } else {
        // Use real API
        console.log('🌐 Using Real API for token refresh');
        const apiResponse = await apiManager.auth.refreshToken(refreshToken);
        
        if (apiResponse.success && apiResponse.data) {
          response = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Token refresh failed');
        }
      }
      
      // Update access token in localStorage
      localStorage.setItem(config.auth.tokenStorageKey, response.accessToken);
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API if not using mock
      if (!config.api.mockAPI) {
        console.log('🌐 Using Real API for logout');
        try {
          await apiManager.auth.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        }
      } else {
        console.log('🔧 Using Mock API for logout (no actual API call needed)');
      }
      
      // Clear localStorage
      localStorage.removeItem(config.auth.tokenStorageKey);
      localStorage.removeItem(config.auth.refreshTokenStorageKey);
      localStorage.removeItem(config.auth.userStorageKey);
      
      // Clear API manager auth token
      apiManager.clearAuthToken();
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    const accessToken = localStorage.getItem(config.auth.tokenStorageKey);
    const refreshToken = localStorage.getItem(config.auth.refreshTokenStorageKey);
    const userData = localStorage.getItem(config.auth.userStorageKey);
    
    if (accessToken && refreshToken && userData) {
      try {
        const user = JSON.parse(userData);
        // Parse lại các trường ngày nếu có
        if (user.created_at) user.created_at = new Date(user.created_at);
        if (user.updated_at) user.updated_at = new Date(user.updated_at);
        if (user.last_login) user.last_login = new Date(user.last_login);
        if (user.date_of_birth) user.date_of_birth = new Date(user.date_of_birth);
        return {
          user,
          accessToken,
          refreshToken,
        };
      } catch (error) {
        // Invalid stored data, clear everything
        dispatch(logoutUser());
        return null;
      }
    }
    
    return null;
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(config.auth.userStorageKey, JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Chỉ nhận user đúng kiểu mới, nếu không đúng thì bỏ qua
        if (action.payload.user && typeof action.payload.user.id === 'number' && 'is_verified' in action.payload.user) {
          state.user = action.payload.user;
        } else {
          state.user = null;
        }
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Initialize auth
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
        state.isLoading = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
