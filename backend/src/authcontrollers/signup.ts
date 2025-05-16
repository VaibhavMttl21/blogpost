import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaclient/prismaclient';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

export const Signup = async (req: Request, res: Response) => {
    try {
      const { JWT_SECRET, COOKIE_NAME } = global.appConfig;
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
  }