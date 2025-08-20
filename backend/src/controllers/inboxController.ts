import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getEmailAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const emailAccounts = await prisma.emailAccount.findMany({
      where: { userId: req.user!.id },
      include: {
        _count: {
          select: {
            emails: {
              where: { isRead: false }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const accountsWithUnreadCount = emailAccounts.map(account => ({
      ...account,
      unreadCount: account._count.emails
    }));

    res.json({ success: true, data: accountsWithUnreadCount });
  } catch (error) {
    console.error('Get email accounts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch email accounts' });
  }
};

export const addEmailAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { email, provider, settings } = req.body;

    if (!email || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Email and provider are required'
      });
    }

    // Check if account already exists
    const existing = await prisma.emailAccount.findFirst({
      where: {
        userId: req.user!.id,
        email: email.toLowerCase()
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Email account already connected'
      });
    }

    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: req.user!.id,
        email: email.toLowerCase(),
        provider,
        settings: settings || {},
        status: 'connected'
      }
    });

    res.status(201).json({ success: true, data: emailAccount });
  } catch (error) {
    console.error('Add email account error:', error);
    res.status(500).json({ success: false, error: 'Failed to add email account' });
  }
};

export const getEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      accountId, 
      folder = 'inbox', 
      search, 
      isRead, 
      isStarred,
      limit = 50,
      offset = 0 
    } = req.query;

    const where: any = {
      emailAccount: {
        userId: req.user!.id
      }
    };

    if (accountId && accountId !== 'all') {
      where.emailAccountId = accountId as string;
    }

    if (folder !== 'all') {
      where.folder = folder as string;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search as string, mode: 'insensitive' } },
        { fromName: { contains: search as string, mode: 'insensitive' } },
        { from: { contains: search as string, mode: 'insensitive' } },
        { preview: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (isStarred !== undefined) {
      where.isStarred = isStarred === 'true';
    }

    const emails = await prisma.email.findMany({
      where,
      include: {
        emailAccount: {
          select: {
            id: true,
            email: true,
            provider: true
          }
        }
      },
      orderBy: { receivedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const totalCount = await prisma.email.count({ where });

    res.json({ 
      success: true, 
      data: {
        emails,
        totalCount,
        hasMore: totalCount > parseInt(offset as string) + emails.length
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch emails' });
  }
};

export const getEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const email = await prisma.email.findFirst({
      where: {
        id,
        emailAccount: {
          userId: req.user!.id
        }
      },
      include: {
        emailAccount: {
          select: {
            id: true,
            email: true,
            provider: true
          }
        }
      }
    });

    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    // Mark as read if not already
    if (!email.isRead) {
      await prisma.email.update({
        where: { id },
        data: { isRead: true }
      });
      email.isRead = true;
    }

    res.json({ success: true, data: email });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch email' });
  }
};

export const updateEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead, isStarred, folder, labels } = req.body;

    const updateData: any = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isStarred !== undefined) updateData.isStarred = isStarred;
    if (folder !== undefined) updateData.folder = folder;
    if (labels !== undefined) updateData.labels = labels;

    const email = await prisma.email.updateMany({
      where: {
        id,
        emailAccount: {
          userId: req.user!.id
        }
      },
      data: updateData
    });

    if (email.count === 0) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    const updatedEmail = await prisma.email.findUnique({
      where: { id },
      include: {
        emailAccount: {
          select: {
            id: true,
            email: true,
            provider: true
          }
        }
      }
    });

    res.json({ success: true, data: updatedEmail });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ success: false, error: 'Failed to update email' });
  }
};

export const bulkUpdateEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { emailIds, updates } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email IDs array is required'
      });
    }

    const updateData: any = {};
    if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
    if (updates.isStarred !== undefined) updateData.isStarred = updates.isStarred;
    if (updates.folder !== undefined) updateData.folder = updates.folder;

    const result = await prisma.email.updateMany({
      where: {
        id: { in: emailIds },
        emailAccount: {
          userId: req.user!.id
        }
      },
      data: updateData
    });

    res.json({ success: true, data: { updated: result.count } });
  } catch (error) {
    console.error('Bulk update emails error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk update emails' });
  }
};

export const deleteEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { emailIds } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email IDs array is required'
      });
    }

    const result = await prisma.email.deleteMany({
      where: {
        id: { in: emailIds },
        emailAccount: {
          userId: req.user!.id
        }
      }
    });

    res.json({ success: true, data: { deleted: result.count } });
  } catch (error) {
    console.error('Delete emails error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete emails' });
  }
};

export const getFolders = async (req: AuthRequest, res: Response) => {
  try {
    // Get folder counts
    const folderCounts = await prisma.email.groupBy({
      by: ['folder'],
      where: {
        emailAccount: {
          userId: req.user!.id
        }
      },
      _count: {
        id: true
      }
    });

    const folders = [
      { id: 'inbox', name: 'Inbox', count: 0 },
      { id: 'important', name: 'Important', count: 0 },
      { id: 'sent', name: 'Sent', count: 0 },
      { id: 'draft', name: 'Draft', count: 0 },
      { id: 'archived', name: 'Archived', count: 0 },
      { id: 'trash', name: 'Trash', count: 0 }
    ];

    // Update counts from database
    folderCounts.forEach(folderCount => {
      const folder = folders.find(f => f.id === folderCount.folder);
      if (folder) {
        folder.count = folderCount._count.id;
      }
    });

    res.json({ success: true, data: folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch folders' });
  }
};

export const syncEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;

    // Verify account belongs to user
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        userId: req.user!.id
      }
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Email account not found' });
    }

    // Here you would implement actual email syncing logic
    // For now, we'll create some sample emails
    const sampleEmails = [
      {
        messageId: `sample-${Date.now()}-1`,
        from: 'alice@example.com',
        fromName: 'Alice Johnson',
        to: account.email,
        subject: 'Re: Product Demo Request',
        content: 'Thank you for the demo. I have a few questions about the pricing...',
        preview: 'Thank you for the demo. I have a few questions about the pricing...',
        receivedAt: new Date()
      },
      {
        messageId: `sample-${Date.now()}-2`,
        from: 'bob@startup.com',
        fromName: 'Bob Smith',
        to: account.email,
        subject: 'Partnership Opportunity',
        content: 'Hi there, I came across your company and would love to discuss...',
        preview: 'Hi there, I came across your company and would love to discuss...',
        receivedAt: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ];

    // Create sample emails if they don't exist
    for (const emailData of sampleEmails) {
      const existing = await prisma.email.findUnique({
        where: { messageId: emailData.messageId }
      });

      if (!existing) {
        await prisma.email.create({
          data: {
            ...emailData,
            emailAccountId: accountId
          }
        });
      }
    }

    res.json({ success: true, message: 'Emails synced successfully' });
  } catch (error) {
    console.error('Sync emails error:', error);
    res.status(500).json({ success: false, error: 'Failed to sync emails' });
  }
};