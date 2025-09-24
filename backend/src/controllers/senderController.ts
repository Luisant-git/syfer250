import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createSender = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, host, port, isVerified, provider, accessToken, refreshToken, expiresAt, tenantId, scope } = req.body;
    
    // Check if sender with this email and provider already exists for this user
    const existingSender = await prisma.sender.findFirst({
      where: {
        email,
        provider: provider || 'SMTP',
        userId: req.user!.id
      }
    });
    
    if (existingSender) {
      return res.status(409).json({ 
        success: false, 
        error: `A ${provider || 'SMTP'} sender with this email already exists` 
      });
    }
    
    // Determine provider if not specified
    let emailProvider = provider;
    if (!emailProvider) {
      if (host && port) {
        emailProvider = 'SMTP';
      } else if (email.includes('@gmail.com')) {
        emailProvider = 'GMAIL';
      } else {
        emailProvider = 'OUTLOOK';
      }
    }
    
    const sender = await prisma.sender.create({
      data: {
        name,
        email,
        password: password || null,
        host: host || null,
        port: port || null,
        isVerified: isVerified || false,
        provider: emailProvider,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        tenantId: tenantId || null,
        scope: scope || null,
        userId: req.user!.id
      }
    });

    res.status(201).json({ success: true, data: sender });
  } catch (error) {
    console.error('Create sender error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create sender' 
    });
  }
};

export const getSenders = async (req: AuthRequest, res: Response) => {
  try {
    const senders = await prisma.sender.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: senders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch senders' });
  }
};

export const updateSender = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, isVerified, provider, host, port, password } = req.body;

    const updateData: any = { name, email, isVerified };
    if (provider) updateData.provider = provider;
    if (host !== undefined) updateData.host = host;
    if (port !== undefined) updateData.port = port;
    if (password !== undefined) updateData.password = password;

    const sender = await prisma.sender.updateMany({
      where: { id, userId: req.user!.id },
      data: updateData
    });

    if (sender.count === 0) {
      return res.status(404).json({ success: false, error: 'Sender not found' });
    }

    const updatedSender = await prisma.sender.findUnique({ where: { id } });
    res.json({ success: true, data: updatedSender });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update sender' });
  }
};

export const deleteSender = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.sender.deleteMany({
      where: { id, userId: req.user!.id }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, error: 'Sender not found' });
    }

    res.json({ success: true, message: 'Sender deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete sender' });
  }
};