import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiSend, FiLoader, FiTag, FiEdit, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Blog {
  id?: string;
  title: string;
  content: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog>({
    title: '',
    content: '',
    tags: '',
    status: 'DRAFT'
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout>>();
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
            withCredentials: true
          });
          setBlog(response.data);
        } catch (error) {
          console.error('Error fetching blog:', error);
          setError('Failed to load the blog. Please try again later.');
          toast.error('Failed to load blog');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBlog();
  }, [id]);

  const saveDraft = async () => {
    // Don't try to save if there's no title yet or during initial load
    if (!blog.title.trim() || loading) return;

    try {
      setIsSaving(true);
      setSaveStatus('Saving...');
      const response = await axios.post('http://localhost:5000/api/blogs/save-draft', blog, {
        withCredentials: true
      });
      // Update the blog with the returned data (to get the ID if it's a new blog)
      setBlog(response.data);
      setSaveStatus('Draft saved');
      toast.success('Draft saved successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('Error saving draft');
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    try {
      setIsPublishing(true);
      await axios.post('http://localhost:5000/api/blogs/publish', blog, {
        withCredentials: true
      });
      setSaveStatus('Blog published');
      toast.success('Blog published successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error publishing:', error);
      setSaveStatus('Error publishing');
      toast.error('Failed to publish blog');
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    setAutoSaveTimer(setTimeout(saveDraft, 5000));
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [blog]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 dark:border-primary-900 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading your blog...</p>
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
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/')} 
            className="btn-secondary py-2 px-6 rounded-full"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blogs
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary py-2 px-6 rounded-full"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-4xl"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold gradient-text flex items-center">
          <FiEdit className="mr-3 text-primary-500" />
          {id ? 'Edit Blog' : 'Create New Blog'}
        </h1>
      </div>
      
      <div className="card-glass p-8 backdrop-blur-md">
        <div className="form-group">
          <label htmlFor="title" className="form-label text-lg">
            Title
          </label>
          <input
            type="text"
            id="title"
            placeholder="Enter a captivating title..."
            value={blog.title}
            onChange={(e) => setBlog({ ...blog, title: e.target.value })}
            className="form-input text-xl font-medium focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label text-lg">
            Content
          </label>
          <textarea
            id="content"
            placeholder="Write your amazing content here..."
            value={blog.content}
            onChange={(e) => setBlog({ ...blog, content: e.target.value })}
            className="form-input min-h-64 text-base focus:ring-2 focus:ring-primary-500"
            rows={10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label text-lg flex items-center">
            <FiTag className="mr-2" />
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            placeholder="technology, programming, web development..."
            value={blog.tags}
            onChange={(e) => setBlog({ ...blog, tags: e.target.value })}
            className="form-input focus:ring-2 focus:ring-primary-500"
          />
          
          {blog.tags && (
            <div className="mt-2 flex flex-wrap">
              {blog.tags.split(',').map((tag, index) => (
                tag.trim() && (
                  <span key={index} className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                    <FiTag className="mr-1" size={12} />
                    {tag.trim()}
                  </span>
                )
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-4">
            <button 
              onClick={saveDraft} 
              disabled={isSaving}
              className="btn-secondary py-2 px-6 rounded-full flex items-center disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Draft
                </>
              )}
            </button>
            
            <button 
              onClick={publish}
              disabled={isPublishing || !blog.title.trim()}
              className="btn-primary py-2 px-6 rounded-full flex items-center disabled:opacity-70"
            >
              {isPublishing ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Publish
                </>
              )}
            </button>
          </div>
          
          {saveStatus && (
            <div className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400">
              <FiCheck className="mr-1" />
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
