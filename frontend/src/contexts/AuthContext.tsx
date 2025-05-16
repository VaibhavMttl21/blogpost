import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  // Configure axios
  useEffect(() => {
    // Set default base URL
    axios.defaults.baseURL = 'http://localhost:5000';
    
    // Important for cookies to work properly
    axios.defaults.withCredentials = true;
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Add a verification request to check token validity after refresh
      const verifyToken = async () => {
        try {
          // We'll use the blogs endpoint to verify authentication since it requires auth
          await axios.get('/api/blogs');
          setIsLoggedIn(true);
        } catch (err) {
          console.error('Token verification failed:', err);
          // If verification fails, clear token and set logged out
          localStorage.removeItem('authToken');
          setToken(null);
          setIsLoggedIn(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      };
      
      verifyToken();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  }, [token]);

  // Add interceptors to handle 401/403 responses globally
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // If we get an unauthorized or forbidden response, clear authentication state
          localStorage.removeItem('authToken');
          setToken(null);
          setIsLoggedIn(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('authToken', token);
      setToken(token);
      setIsLoggedIn(true);
      return response.data;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/signup', {
        email,
        password
      });
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('authToken', token);
      setToken(token);
      setIsLoggedIn(true);
      return response.data;
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      throw err;
    }
  };

  const logout = () => {
    // Call the logout API endpoint
    axios.post('/api/auth/logout')
      .catch(err => console.error('Logout error:', err))
      .finally(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        setIsLoggedIn(false);
      });
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
