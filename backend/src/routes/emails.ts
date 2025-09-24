import { Router } from 'express';
import { checkEmails } from '../services/emailReceiver';
import { prisma } from '../config/database';

const router = Router();

router.get('/check/:senderId', async (req, res) => {
  try {
    const { senderId } = req.params;
    
    const sender = await prisma.sender.findUnique({
      where: { id: senderId }
    });

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const result = await checkEmails(sender);
    
    res.json(result);
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Failed to check emails' });
  }
});

export default router;