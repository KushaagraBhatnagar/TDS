import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  // Check if refresh token is in localStorage on load, to refresh access token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedRefreshToken = localStorage.getItem('tdc_refresh_token');
      const storedUser = localStorage.getItem('tdc_user');

      if (storedRefreshToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Perform initial silent refresh to get a fresh access token
          await refreshAccessToken(storedRefreshToken);
        } catch (error) {
          console.error('Failed to initialize session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshAccessToken = async (tokenToUse) => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const performRefresh = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokenToUse })
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem('tdc_refresh_token', data.refreshToken);
        return data.accessToken;
      } catch (error) {
        console.warn('Session expired. Logging out.');
        logout();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = performRefresh();
    return refreshPromiseRef.current;
  };

  const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem('tdc_refresh_token', data.refreshToken);
    localStorage.setItem('tdc_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('tdc_refresh_token');
    if (storedRefreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken })
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('tdc_refresh_token');
    localStorage.removeItem('tdc_user');
  };

  // Custom fetch wrapper with automatic JWT header and silent refresh retry
  const apiCall = async (url, options = {}) => {
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Attach active access token if available
    let token = accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Run query
    let response = await fetch(url, {
      ...options,
      headers
    });

    // Handle expired token
    if (response.status === 401) {
      const resClone = response.clone();
      try {
        const errData = await resClone.json();
        if (errData.error === 'token_expired') {
          // Token expired, attempt to refresh
          console.log('Access token expired. Retrying after silent refresh...');
          const currentRefreshToken = localStorage.getItem('tdc_refresh_token');
          if (currentRefreshToken) {
            const freshAccessToken = await refreshAccessToken(currentRefreshToken);
            if (freshAccessToken) {
              // Retry with fresh access token
              headers['Authorization'] = `Bearer ${freshAccessToken}`;
              response = await fetch(url, {
                ...options,
                headers
              });
            }
          }
        }
      } catch (e) {
        // Fallback for non-JSON 401 errors
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
