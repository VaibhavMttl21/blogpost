import  { Request, Response} from 'express';
import { prisma } from '../prismaclient/prismaclient';


export const savedraft = async (req: Request, res: Response) => {
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
  }