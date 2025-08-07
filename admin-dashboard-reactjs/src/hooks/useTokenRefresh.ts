import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { refreshAccessToken, logoutUser } from '../store/slices/authSlice';
import config from '../config';

const useTokenRefresh = () => {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken, isAuthenticated } = useAppSelector((state) => state.auth);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      // Parse JWT token to get expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Refresh token before it expires (subtract buffer time from config)
      const refreshTime = Math.max(timeUntilExpiry - config.auth.tokenExpiryBuffer, 0);

      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Schedule refresh if token will expire
      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated && refreshToken) {
            console.log('🔄 Auto-refreshing access token...');
            dispatch(refreshAccessToken());
          }
        }, refreshTime);
        
        console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`);
      } else {
        // Token is already expired or about to expire, refresh immediately
        if (isAuthenticated && refreshToken) {
          console.log('🔄 Token expired, refreshing immediately...');
          dispatch(refreshAccessToken());
        }
      }
    } catch (error) {
      // If we can't parse the token (mock token case), use fallback logic
      console.warn('⚠️ Could not parse JWT token, using fallback refresh logic');
      
      try {
        const tokenTimestamp = parseInt(token.split('-').pop() || '0');
        const currentTime = Date.now();
        const tokenAge = (currentTime - tokenTimestamp) / 1000 / 60; // in minutes
        
        // If token is older than configured session timeout minus buffer, refresh it
        const maxAge = (config.auth.sessionTimeout - config.auth.tokenExpiryBuffer) / 60000;
        
        if (tokenAge > maxAge) {
          if (refreshToken) {
            dispatch(refreshAccessToken());
          } else {
            dispatch(logoutUser());
          }
        } else {
          // Schedule next check
          const nextCheckTime = (maxAge - tokenAge) * 60000;
          refreshTimeoutRef.current = setTimeout(() => {
            scheduleTokenRefresh(token);
          }, Math.max(nextCheckTime, 60000)); // Check at least every minute
        }
      } catch (fallbackError) {
        console.error('❌ Error in fallback token refresh logic:', fallbackError);
      }
    }
  }, [dispatch, isAuthenticated, refreshToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken && refreshToken) {
      scheduleTokenRefresh(accessToken);
    }

    // Cleanup timeout on unmount or when authentication changes
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [accessToken, isAuthenticated, refreshToken, scheduleTokenRefresh]);

  // Handle manual token refresh
  const handleManualRefresh = useCallback(() => {
    if (isAuthenticated && refreshToken) {
      dispatch(refreshAccessToken());
    }
  }, [dispatch, isAuthenticated, refreshToken]);

  return { 
    scheduleTokenRefresh, 
    handleManualRefresh 
  };
};

export default useTokenRefresh;
