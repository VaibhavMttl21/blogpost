import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Ensure dotenv is configured FIRST before any other imports
dotenv.config();

import cookieParser from 'cookie-parser';
import { authenticateJwt } from './middleware/middleware';
import { Signup } from './authcontrollers/signup';
import { login } from './authcontrollers/login';
import { savedraft } from './controllers/savedraft';
import { publishpost } from './controllers/publishpost';
import { allblogs } from './controllers/allblogs';
import { getblog } from './controllers/getblog';
import { deleteblog } from './controllers/deleteblog';
import { logout } from './authcontrollers/logout';
import { loadEnvConfig } from './utils/config';

const app = express();

// Initialize global configuration
global.appConfig = loadEnvConfig();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware for auth headers
app.use((req, res, next) => {
  next();
});

// Signup endpoint
app.post('/api/auth/signup', Signup);

// Login endpoint
app.post('/api/auth/login', login);

// Add logout endpoint
app.post('/api/auth/logout', logout);

// Save/update draft
app.post('/api/blogs/save-draft', authenticateJwt, savedraft);

// Publish blog
app.post('/api/blogs/publish', authenticateJwt, publishpost);

// Get all blogs
app.get('/api/blogs', authenticateJwt, allblogs);

// Get blog by id
app.get('/api/blogs/:id', authenticateJwt, getblog);

// Delete blog by id
app.delete('/api/blogs/:id', authenticateJwt, deleteblog);


// Start the server
app.listen(global.appConfig.PORT, () => {
  console.log(`Server is running on port ${global.appConfig.PORT}`);
});

