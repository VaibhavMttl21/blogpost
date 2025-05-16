import express, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Middleware to verify JWT token from cookies or Authorization header
export const authenticateJwt = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Use global config for consistency
    const { JWT_SECRET, COOKIE_NAME } = global.appConfig;
    
    // Check for token in cookies first
    let token = req.cookies[COOKIE_NAME];
  
    // If not in cookies, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
  
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: (decoded as JwtPayload).id, email: (decoded as JwtPayload).email };
      next();
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };