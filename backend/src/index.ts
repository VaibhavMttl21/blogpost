
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Save/update draft
app.post('/api/blogs/save-draft', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    const blog = await prisma.blog.upsert({
      where: { id: id || '' },
      update: { title, content, tags },
      create: { title, content, tags, status: 'DRAFT' }
    });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Publish blog
app.post('/api/blogs/publish', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    const blog = await prisma.blog.upsert({
      where: { id: id || '' },
      update: { title, content, tags, status: 'PUBLISHED' },
      create: { title, content, tags, status: 'PUBLISHED' }
    });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish blog' });
  }
});

// Get all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog by id
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id }
    });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
