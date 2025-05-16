import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../prismaclient/prismaclient';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

export const login = async (req: Request, res: Response) => {
    try {
      const { JWT_SECRET, COOKIE_NAME } = global.appConfig;
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
  }