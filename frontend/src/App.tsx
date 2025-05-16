
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <Link to="/">All Blogs</Link>
          <Link to="/new">New Blog</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/new" element={<BlogEditor />} />
          <Route path="/edit/:id" element={<BlogEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
