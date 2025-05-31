import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store/store';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner/LoadingSpinner';
import Navbar from './components/Navbar/Navbar';
import SubNav from './components/SubNav/SubNav';
import Footer from './components/Footer/Footer';
import AuthModal from './components/Auth/AuthModal';
import AccessibilityProvider from './components/shared/AccessibilityProvider';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { hideAuthModal } from './store/slices/modalSlice';
import { disableAutocomplete, setupAutocompleteObserver } from './utils/formUtils';
import { initSessionTimeoutTracker } from './utils/sessionUtils';
import { authService } from './services/authService';
import { logout } from './store/slices/authSlice';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Banner = lazy(() => {
  return new Promise((resolve) => {
    import('./components/Banner/Banner')
      .then(module => resolve(module))
      .catch(error => {
        console.error('Error loading Banner component:', error);
        // Return a fallback component instead of throwing
        resolve({ default: () => null });
      });
  });
});
const PureCssBackground = lazy(() => import('./components/shared/PureCssBackground'));
// Keep these for backward compatibility
const EnhancedParticleBackground = lazy(() => import('./components/shared/EnhancedParticleBackground'));
const ParticleBackground = lazy(() => import('./components/shared/ParticleBackground'));
const SocialBar = lazy(() => import('./components/shared/SocialBar'));
const ContentContainer = lazy(() => import('./components/shared/ContentContainer'));
const Home = lazy(() => import('./components/pages/Home/Home'));
const Tools = lazy(() => import('./components/pages/Tools/Tools'));
const News = lazy(() => import('./components/pages/News/News'));
const Contact = lazy(() => import('./components/pages/Contact/Contact'));
const Tips = lazy(() => import('./components/pages/Tips/Tips'));
const NotFound = lazy(() => import('./components/pages/NotFound/NotFound'));
const Dashboard = lazy(() => import('./components/pages/Dashboard/Dashboard'));

// Layout component that conditionally renders the Banner
const Layout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { showAuthModal } = useSelector(state => state.modal);
  const { user, token } = useSelector(state => state.auth);

  // Add effect to disable autocomplete on all forms and inputs
  useEffect(() => {
    // Disable autocomplete on initial load
    disableAutocomplete();
    
    // Setup observer for dynamically added elements
    const observer = setupAutocompleteObserver();
    
    // Cleanup observer on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Validate token on app initialization
  useEffect(() => {
    const validateUserSession = async () => {
      if (user && token) {
        try {
          console.log('Validating user session token...');
          const result = await authService.validateToken(token);
          
          if (!result.valid) {
            console.log('Session token invalid, logging out');
            dispatch(logout());
          } else {
            console.log('Session token valid, session refreshed');
            // Session timeout will be initiated by the user effect below
          }
        } catch (error) {
          console.error('Error validating token:', error);
          dispatch(logout());
        }
      }
    };
    
    validateUserSession();
    
    // Set up interval to periodically validate token (every 15 minutes)
    const tokenValidationInterval = setInterval(validateUserSession, 15 * 60 * 1000);
    
    return () => {
      clearInterval(tokenValidationInterval);
    };
  }, [dispatch, user, token]);
  
  // Initialize session timeout tracker when user is logged in
  useEffect(() => {
    if (user) {
      console.log('Initializing session timeout tracker');
      // Setup session timeout (45 minutes)
      initSessionTimeoutTracker(45 * 60 * 1000);
    }
  }, [user]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="App">
          <SocialBar />
          <Navbar />
          {!user && <Banner />}
          <SubNav />
          <main>
            <PureCssBackground>
              {children}
            </PureCssBackground>
          </main>
          <Footer />
          <AuthModal isOpen={showAuthModal} onClose={() => dispatch(hideAuthModal())} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

// No longer need separate DashboardLayout import

function App() {
  return (
    <Provider store={store}>
      <AccessibilityProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #00f7ff',
                  boxShadow: '0 0 10px rgba(0, 247, 255, 0.5)'
                },
                success: {
                  iconTheme: {
                    primary: '#2ecc71',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#e74c3c',
                    secondary: '#fff'
                  }
                }
              }}
            />
            <Routes>
              <Route path="/*" element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<ContentContainer><Home /></ContentContainer>} />
                      <Route path="/tools" element={<ContentContainer><Tools /></ContentContainer>} />
                      <Route path="/news" element={<ContentContainer><News /></ContentContainer>} />
                      <Route path="/contact" element={<ContentContainer><Contact /></ContentContainer>} />
                      <Route path="/tips" element={<ContentContainer><Tips /></ContentContainer>} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <ContentContainer><Dashboard /></ContentContainer>
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<ContentContainer><NotFound /></ContentContainer>} />
                    </Routes>
                  </Suspense>
                </Layout>
              } />
            </Routes>
          </div>
        </Router>
      </AccessibilityProvider>
    </Provider>
  );
}

export default App;