import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { logout } from '../../store/slices/authSlice';
import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';

/**
 * ProtectedRoute component that checks if user is authenticated
 * If authenticated, renders the children components
 * If not authenticated, redirects to the home page
 */
const ProtectedRoute = ({ children }) => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (user && token) {
        try {
          setIsValidating(true);
          console.log('Validating token for protected route...');
          const result = await authService.validateToken(token);
          
          if (!result.valid) {
            console.log('Token invalid, redirecting to login');
            dispatch(logout());
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error validating token:', error);
          dispatch(logout());
          navigate('/', { replace: true });
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateToken();
  }, [user, token, dispatch, navigate]);

  if (!user) {
    // Redirect to home page if user is not authenticated
    return <Navigate to="/" replace />;
  }

  if (isValidating) {
    // Show loading spinner while validating token
    return <LoadingSpinner />;
  }

  // Render children if user is authenticated
  return children;
};

export default ProtectedRoute;