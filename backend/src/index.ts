import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const COOKIE_NAME = 'blogcraft_auth';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add specific handling for OPTIONS requests (preflight)
app.options('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to verify JWT token from cookies or Authorization header
const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for token in cookies first
  let token = req.cookies[COOKIE_NAME];

  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      req.user = { id: decoded.id, email: decoded.email };
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

// Signup endpoint
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '3d' });
    
    // Set cookie with the token - modified settings
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
      maxAge: THREE_DAYS_MS,
      path: '/'
    });
    
    // Also return the token in the response for clients using localStorage
    res.json({ message: 'User created successfully', token });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '3d' });
    
    // Set cookie with the token - modified settings
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
      maxAge: THREE_DAYS_MS,
      path: '/'
    });
    
    // Return the token explicitly in the response for clients using localStorage
    return res.status(200).json({ 
      success: true,
      message: 'Logged in successfully', 
      token: token, // Ensure token is named consistently and included
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: String(error) });
  }
});

// Add logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' 
  });
  res.json({ message: 'Logged out successfully' });
});

// Save/update draft
app.post('/api/blogs/save-draft', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { id, title, content, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const blog = await prisma.blog.upsert({
      where: { id: id || '' },
      update: { title, content, tags },
      create: { title, content, tags: tags || '', status: 'DRAFT' }
    });
    res.json(blog);
  } catch (error) {
    console.error('Error in save-draft:', error);
    res.status(500).json({ error: 'Failed to save draft', details: String(error) });
  }
});

// Publish blog
app.post('/api/blogs/publish', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { id, title, content, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const blog = await prisma.blog.upsert({
      where: { id: id || '' },
      update: { title, content, tags, status: 'PUBLISHED' },
      create: { title, content, tags: tags || '', status: 'PUBLISHED' }
    });
    res.json(blog);
  } catch (error) {
    console.error('Error in publish:', error);
    res.status(500).json({ error: 'Failed to publish blog', details: String(error) });
  }
});

// Get all blogs
app.get('/api/blogs', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(blogs);
  } catch (error) {
    console.error('Error in get blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs', details: String(error) });
  }
});

// Get blog by id
app.get('/api/blogs/:id', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id }
    });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error in get blog by ID:', error);
    res.status(500).json({ error: 'Failed to fetch blog', details: String(error) });
  }
});

// Delete blog by id
app.delete('/api/blogs/:id', authenticateJwt, async (req: Request, res: Response) => {
  try {
    // Check if blog exists first
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id }
    });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete the blog
    await prisma.blog.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error in delete blog:', error);
    res.status(500).json({ error: 'Failed to delete blog', details: String(error) });
  }
});

// Run database connection test before starting the server
testDbConnection()
  .then(() => {
    // Log the CORS configuration for debugging
    console.log(`CORS configured for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    app.listen(5000, '0.0.0.0', () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  });
