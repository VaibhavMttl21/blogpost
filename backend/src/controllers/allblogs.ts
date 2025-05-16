import  { Request, Response} from 'express';
import { prisma } from '../prismaclient/prismaclient';


export const allblogs = async (req: Request, res: Response) => {
    try {
      const blogs = await prisma.blog.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json(blogs);
    } catch (error) {
      console.error('Error in get blogs:', error);
      res.status(500).json({ error: 'Failed to fetch blogs', details: String(error) });
    }
  }