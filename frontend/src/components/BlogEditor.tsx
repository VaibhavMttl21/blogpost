
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Blog {
  id?: string;
  title: string;
  content: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function BlogEditor({ id }: { id?: string }) {
  const [blog, setBlog] = useState<Blog>({
    title: '',
    content: '',
    tags: '',
    status: 'DRAFT'
  });
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout>();
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    const fetchBlog = async () => {
      if (id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          setBlog(response.data);
        } catch (error) {
          console.error('Error fetching blog:', error);
        }
      }
    };
    fetchBlog();
  }, [id]);

  const saveDraft = async () => {
    try {
      await axios.post('http://localhost:5000/api/blogs/save-draft', blog);
      setSaveStatus('Draft saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('Error saving draft');
    }
  };

  const publish = async () => {
    try {
      await axios.post('http://localhost:5000/api/blogs/publish', blog);
      setSaveStatus('Blog published');
    } catch (error) {
      console.error('Error publishing:', error);
      setSaveStatus('Error publishing');
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

  return (
    <div className="blog-editor">
      <input
        type="text"
        placeholder="Title"
        value={blog.title}
        onChange={(e) => setBlog({ ...blog, title: e.target.value })}
        className="title-input"
      />
      <textarea
        placeholder="Content"
        value={blog.content}
        onChange={(e) => setBlog({ ...blog, content: e.target.value })}
        className="content-input"
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={blog.tags}
        onChange={(e) => setBlog({ ...blog, tags: e.target.value })}
        className="tags-input"
      />
      <div className="button-group">
        <button onClick={saveDraft}>Save Draft</button>
        <button onClick={publish}>Publish</button>
      </div>
      {saveStatus && <div className="save-status">{saveStatus}</div>}
    </div>
  );
}
