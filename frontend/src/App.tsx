import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Root component that wraps everything
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Internal component that has access to auth context
function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <Router>
      <div className="app">
        <Header />
        
        <main className="container mx-auto px-4 pt-6 pb-16">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={
                isLoggedIn ? <Navigate to="/" replace /> : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Login />
                  </motion.div>
                )
              } />
              <Route path="/signup" element={
                isLoggedIn ? <Navigate to="/" replace /> : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Signup />
                  </motion.div>
                )
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BlogList />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/new" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BlogEditor />
                  </motion.div>
                </ProtectedRoute>
              } />
              
              <Route path="/edit/:id" element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BlogEditor />
                  </motion.div>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
