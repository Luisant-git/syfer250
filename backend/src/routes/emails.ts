import { Router } from 'express';
import { checkEmails } from '../services/emailReceiver';
import { prisma } from '../config/database';

const router = Router();

router.get('/senders', async (req, res) => {
  try {
    const senders = await prisma.sender.findMany({
      select: { id: true, email: true, provider: true }
    });
    res.json({ senders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get senders' });
  }
});

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