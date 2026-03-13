import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Auth context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          apiService.setToken(token);
          const user = await apiService.getUserProfile();

          localStorage.setItem('user', JSON.stringify(user.user));
          localStorage.setItem('li_auth', 'true');
          localStorage.setItem('li_role', user.user.role === 'project_owner' ? 'projectOwner' : user.user.role);
          localStorage.setItem('li_approved', String(!!user.user.isApproved));

          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: user.user,
          });
        } catch (error) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.message,
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('li_auth');
          localStorage.removeItem('li_role');
          localStorage.removeItem('li_approved');
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'No token found',
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await apiService.login(credentials);

      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('li_auth', 'true');
        localStorage.setItem('li_role', response.user.role === 'project_owner' ? 'projectOwner' : response.user.role);
        localStorage.setItem('li_approved', String(!!response.user.isApproved));
        localStorage.removeItem('verification_data');
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await apiService.register(userData);

      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('li_auth', 'true');
        localStorage.setItem('li_role', response.user.role === 'project_owner' ? 'projectOwner' : response.user.role);
        localStorage.setItem('li_approved', String(!!response.user.isApproved));
        localStorage.removeItem('verification_data');
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('li_auth');
      localStorage.removeItem('li_role');
      localStorage.removeItem('li_approved');
      localStorage.removeItem('verification_data');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
