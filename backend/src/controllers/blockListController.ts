import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getBlockList = async (req: AuthRequest, res: Response) => {
  try {
    const { search, source } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const blockList = await prisma.blockList.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Filter by source if specified
    let filteredList = blockList;
    if (source && source !== 'all') {
      filteredList = blockList.filter(item => 
        item.reason?.toLowerCase().includes(source as string)
      );
    }

    res.json({ success: true, data: filteredList });
  } catch (error) {
    console.error('Get block list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch block list' });
  }
};

export const addToBlockList = async (req: AuthRequest, res: Response) => {
  try {
    const { email, reason } = req.body;

    if (!email || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Email and reason are required'
      });
    }

    // Check if email already exists
    const existing = await prisma.blockList.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Email is already in the block list'
      });
    }

    const blockListEntry = await prisma.blockList.create({
      data: {
        email: email.toLowerCase().trim(),
        reason: reason.trim()
      }
    });

    res.status(201).json({ success: true, data: blockListEntry });
  } catch (error) {
    console.error('Add to block list error:', error);
    res.status(500).json({ success: false, error: 'Failed to add email to block list' });
  }
};

export const bulkAddToBlockList = async (req: AuthRequest, res: Response) => {
  try {
    const { emails, reason = 'Bulk import' } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Emails array is required'
      });
    }

    // Filter out duplicates and invalid emails
    const validEmails = emails
      .map(email => email.toLowerCase().trim())
      .filter(email => email.includes('@'));

    // Check for existing emails
    const existingEmails = await prisma.blockList.findMany({
      where: {
        email: { in: validEmails }
      },
      select: { email: true }
    });

    const existingEmailSet = new Set(existingEmails.map(e => e.email));
    const newEmails = validEmails.filter(email => !existingEmailSet.has(email));

    if (newEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'All emails are already in the block list'
      });
    }

    // Bulk create
    const blockListEntries = await prisma.blockList.createMany({
      data: newEmails.map(email => ({
        email,
        reason
      }))
    });

    res.status(201).json({ 
      success: true, 
      data: { 
        added: blockListEntries.count,
        skipped: validEmails.length - newEmails.length
      }
    });
  } catch (error) {
    console.error('Bulk add to block list error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk add emails to block list' });
  }
};

export const removeFromBlockList = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.blockList.delete({
      where: { id }
    });

    res.json({ success: true, data: deleted });
  } catch (error: any) {
    console.error('Remove from block list error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Email not found in block list' });
    }
    res.status(500).json({ success: false, error: 'Failed to remove email from block list' });
  }
};

export const bulkRemoveFromBlockList = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }

    const deleted = await prisma.blockList.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    res.json({ success: true, data: { removed: deleted.count } });
  } catch (error) {
    console.error('Bulk remove from block list error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk remove emails from block list' });
  }
};

export const getBlockListStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalBlocked = await prisma.blockList.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const addedToday = await prisma.blockList.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // Count by reason patterns for auto-blocked
    const autoBlocked = await prisma.blockList.count({
      where: {
        OR: [
          { reason: { contains: 'bounce', mode: 'insensitive' } },
          { reason: { contains: 'spam', mode: 'insensitive' } },
          { reason: { contains: 'complaint', mode: 'insensitive' } },
          { reason: { contains: 'automatic', mode: 'insensitive' } }
        ]
      }
    });

    const stats = {
      totalBlocked,
      autoBlocked,
      addedToday,
      manualBlocked: totalBlocked - autoBlocked
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get block list stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch block list statistics' });
  }
};