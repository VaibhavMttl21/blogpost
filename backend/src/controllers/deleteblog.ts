import  { Request, Response} from 'express';
import { prisma } from '../prismaclient/prismaclient';

export const deleteblog = async (req: Request, res: Response) => {
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
  }