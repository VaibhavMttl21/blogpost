import  { Request, Response} from 'express';
import { prisma } from '../prismaclient/prismaclient';

export const getblog = async (req: Request, res: Response) => {
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
  }