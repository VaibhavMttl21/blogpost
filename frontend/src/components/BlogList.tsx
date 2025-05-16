
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/blogs');
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

  const drafts = blogs.filter(blog => blog.status === 'DRAFT');
  const published = blogs.filter(blog => blog.status === 'PUBLISHED');

  return (
    <div className="blog-list">
      <section>
        <h2>Published Posts</h2>
        {published.map(blog => (
          <div key={blog.id} className="blog-item">
            <h3>{blog.title}</h3>
            <p>{blog.tags}</p>
            <Link to={`/edit/${blog.id}`}>Edit</Link>
          </div>
        ))}
      </section>
      
      <section>
        <h2>Drafts</h2>
        {drafts.map(blog => (
          <div key={blog.id} className="blog-item">
            <h3>{blog.title}</h3>
            <p>{blog.tags}</p>
            <Link to={`/edit/${blog.id}`}>Edit</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
