import { Request, Response } from 'express';

export const logout = (req: Request, res: Response) => {
  const { COOKIE_NAME } = global.appConfig;
  
  res.clearCookie(COOKIE_NAME, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' 
  });
  res.json({ message: 'Logged out successfully' });
}