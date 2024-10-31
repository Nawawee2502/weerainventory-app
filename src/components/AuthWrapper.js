import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../api/userApi';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = localStorage.getItem('userData2');
        
        if (!userData) {
          if (location.pathname !== '/') {
            navigate('/');
          }
          return;
        }

        const response = await dispatch(checkAuth({})).unwrap();
        
        if (!response.result) {
          localStorage.removeItem('userData2');
          if (location.pathname !== '/') {
            navigate('/');
          }
          return;
        }

        setIsAuthenticated(true);
        // If we're on login page and authenticated, redirect to dashboard
        if (location.pathname === '/') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('userData2');
        if (location.pathname !== '/') {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [dispatch, navigate, location]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthWrapper;