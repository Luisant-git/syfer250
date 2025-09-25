import { Router } from 'express';
import { schedulerService } from '../services/schedulerService';
import { prisma } from '../config/database';

const router = Router();

// Test endpoint to manually trigger scheduler (for testing)
router.post('/trigger', async (req, res) => {
  try {
    // Get scheduled campaigns that are due
    const now = new Date();
    const scheduledCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now
        }
      },
      include: {
        recipients: true,
        sender: true
      }
    });

    res.json({
      success: true,
      message: `Found ${scheduledCampaigns.length} campaigns ready to send`,
      campaigns: scheduledCampaigns.map(c => ({
        id: c.id,
        name: c.name,
        scheduledAt: c.scheduledAt,
        timezone: c.timezone,
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Scheduler trigger error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger scheduler' });
  }
});

// Get scheduler status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Scheduler is running',
    nextCheck: 'Every 60 seconds'
  });
});

export default router;