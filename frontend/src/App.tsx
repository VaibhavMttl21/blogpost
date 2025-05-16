
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'

interface Blog {
  id?: string
  title: string
  content: string
  tags?: string
  status: 'DRAFT' | 'PUBLISHED'
}

function App() {
  const [blog, setBlog] = useState<Blog>({ 
    title: '', 
    content: '', 
    tags: '',
    status: 'DRAFT' 
  })
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [saving, setSaving] = useState(false)

  const saveDraft = useCallback(async () => {
    setSaving(true)
    try {
      const response = await axios.post('http://0.0.0.0:5000/api/blogs/save-draft', blog)
      if (!blog.id) {
        setBlog(prev => ({ ...prev, id: response.data.id }))
      }
      fetchBlogs()
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
    setSaving(false)
  }, [blog])

  const publishBlog = async () => {
    try {
      await axios.post('http://0.0.0.0:5000/api/blogs/publish', blog)
      fetchBlogs()
      setBlog({ title: '', content: '', tags: '', status: 'DRAFT' })
    } catch (error) {
      console.error('Failed to publish:', error)
    }
  }

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://0.0.0.0:5000/api/blogs')
      setBlogs(response.data)
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (blog.title || blog.content) {
        saveDraft()
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [blog, saveDraft])

  const handleEdit = (editBlog: Blog) => {
    setBlog(editBlog)
  }

  return (
    <div className="app">
      <div className="editor">
        <input
          type="text"
          value={blog.title}
          onChange={(e) => setBlog(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Title"
          className="title-input"
        />
        <textarea
          value={blog.content}
          onChange={(e) => setBlog(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Write your blog content..."
          className="content-input"
        />
        <input
          type="text"
          value={blog.tags}
          onChange={(e) => setBlog(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="Tags (comma-separated)"
          className="tags-input"
        />
        <div className="button-group">
          <button onClick={saveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={publishBlog}>Publish</button>
        </div>
      </div>

      <div className="blog-list">
        <h2>Drafts</h2>
        {blogs.filter(b => b.status === 'DRAFT').map(blog => (
          <div key={blog.id} className="blog-item" onClick={() => handleEdit(blog)}>
            <h3>{blog.title}</h3>
            <p>{blog.content.substring(0, 100)}...</p>
          </div>
        ))}

        <h2>Published</h2>
        {blogs.filter(b => b.status === 'PUBLISHED').map(blog => (
          <div key={blog.id} className="blog-item" onClick={() => handleEdit(blog)}>
            <h3>{blog.title}</h3>
            <p>{blog.content.substring(0, 100)}...</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
