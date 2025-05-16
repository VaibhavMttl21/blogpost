import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiPlus, FiBookOpen, FiClock, FiTag, FiChevronRight, FiTrash, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Blog {
  id: string;
  title: string;
  content: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/blogs', { 
        withCredentials: true 
      });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs. Please try again later.');
      toast.error('Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (blogId: string) => {
    setDeletingBlogId(blogId);
    setShowConfirmDelete(true);
  };

  const cancelDelete = () => {
    setDeletingBlogId(null);
    setShowConfirmDelete(false);
  };

  const deleteBlog = async () => {
    if (!deletingBlogId) return;

    try {
      await axios.delete(`http://localhost:5000/api/blogs/${deletingBlogId}`, { 
        withCredentials: true 
      });
      
      setBlogs(blogs.filter(blog => blog.id !== deletingBlogId));
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setDeletingBlogId(null);
      setShowConfirmDelete(false);
    }
  };

  const drafts = blogs.filter(blog => blog.status === 'DRAFT');
  const published = blogs.filter(blog => blog.status === 'PUBLISHED');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 dark:border-primary-900 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading your blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card-glass bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 p-6 text-center rounded-xl max-w-lg mx-auto"
      >
        <div className="w-16 h-16 mx-auto mb-4 text-red-500 flex items-center justify-center bg-red-100 dark:bg-red-800/30 rounded-full">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary py-2 px-6 rounded-full mx-auto block"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto">
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this blog? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={deleteBlog}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <motion.section 
          className="w-full md:w-1/2"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <div className="flex items-center mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
              <FiBookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Published Posts</h2>
          </div>
          
          {published.length > 0 ? (
            <div className="space-y-4">
              {published.map(blog => (
                <motion.div 
                  key={blog.id} 
                  className="blog-card group"
                  variants={item}
                  whileHover={{ y: -5 }}
                >
                  <div className="blog-card-gradient"></div>
                  <h3 className="text-xl font-medium mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{blog.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <FiClock className="mr-1" /> 
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-4 flex flex-wrap">
                    {blog.tags && blog.tags.split(',').map(tag => (
                      <span key={tag} className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                        <FiTag className="mr-1" size={12} />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <Link to={`/edit/${blog.id}`} className="btn-primary inline-flex items-center text-sm py-2 px-4 rounded-full">
                      <FiEdit className="w-4 h-4 mr-1" />
                      Edit
                      <FiChevronRight className="ml-1" />
                    </Link>
                    <button 
                      onClick={() => confirmDelete(blog.id)}
                      className="btn-secondary inline-flex items-center text-sm py-2 px-4 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    >
                      <FiTrash className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-glass p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <FiBookOpen className="w-8 h-8" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No published posts yet</p>
              <Link to="/new" className="btn-primary inline-flex items-center mt-4 py-2 px-4 rounded-full mx-auto">
                <FiPlus className="mr-2" />
                Create Your First Post
              </Link>
            </div>
          )}
        </motion.section>
        
        <motion.section 
          className="w-full md:w-1/2"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3">
              <FiClock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Drafts</h2>
          </div>
          
          {drafts.length > 0 ? (
            <div className="space-y-4">
              {drafts.map(blog => (
                <motion.div 
                  key={blog.id} 
                  className="blog-card group border-dashed"
                  variants={item}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-medium mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{blog.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <FiClock className="mr-1" /> 
                    <span>Last edited: {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-4 flex flex-wrap">
                    {blog.tags && blog.tags.split(',').map(tag => (
                      <span key={tag} className="inline-flex items-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                        <FiTag className="mr-1" size={12} />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <Link to={`/edit/${blog.id}`} className="btn-secondary inline-flex items-center text-sm py-2 px-4 rounded-full">
                      <FiEdit className="w-4 h-4 mr-1" />
                      Continue
                      <FiChevronRight className="ml-1" />
                    </Link>
                    <button 
                      onClick={() => confirmDelete(blog.id)}
                      className="btn-secondary inline-flex items-center text-sm py-2 px-4 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    >
                      <FiTrash className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-glass p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <FiClock className="w-8 h-8" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No drafts saved</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/new" className="btn-primary inline-flex items-center justify-center w-full max-w-xs mx-auto py-3 px-6 rounded-full">
              <FiPlus className="mr-2" />
              Create New Blog
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
