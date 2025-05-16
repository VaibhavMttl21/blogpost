import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiHome, FiEdit, FiLogOut, FiLogIn, FiUserPlus, FiMoon, FiSun } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className={`app-header ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span className="text-white font-bold text-xl">B</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold gradient-text"
          >
            BlogCraft
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isLoggedIn ? (
            <>
              <Link to="/" className="btn-icon group flex items-center">
                <FiHome className="mr-2 group-hover:text-primary-500" />
                <span>Home</span>
              </Link>
              <Link to="/new" className="btn-primary py-2 px-4 rounded-full flex items-center">
                <FiEdit className="mr-2" />
                <span>New Post</span>
              </Link>
              <button 
                onClick={logout}
                className="btn-icon group ml-2 flex items-center"
              >
                <FiLogOut className="mr-2 group-hover:text-red-500" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-icon group flex items-center">
                <FiLogIn className="mr-2 group-hover:text-primary-500" />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn-primary py-2 px-6 rounded-full flex items-center">
                <FiUserPlus className="mr-2" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
          <button 
            onClick={toggleDarkMode} 
            className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? 
              <FiSun className="text-yellow-400 text-xl" /> : 
              <FiMoon className="text-gray-700 text-xl" />
            }
          </button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 
            <FiX className="h-6 w-6" /> :
            <FiMenu className="h-6 w-6" />
          }
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 right-0 card-glass z-50 border-t dark:border-gray-800"
          >
            <nav className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/" 
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHome className="mr-3 text-primary-500" />
                    <span>Home</span>
                  </Link>
                  <Link 
                    to="/new" 
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiEdit className="mr-3 text-primary-500" />
                    <span>New Post</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left w-full"
                  >
                    <FiLogOut className="mr-3 text-red-500" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiLogIn className="mr-3 text-primary-500" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUserPlus className="mr-3 text-primary-500" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
              <button 
                onClick={() => {
                  toggleDarkMode();
                  setIsMenuOpen(false);
                }}
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {isDarkMode ? (
                  <>
                    <FiSun className="mr-3 text-yellow-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FiMoon className="mr-3 text-gray-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
