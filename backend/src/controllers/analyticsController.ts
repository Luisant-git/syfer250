import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get campaign counts
    const totalCampaigns = await prisma.campaign.count({
      where: { userId }
    });

    const sentCampaigns = await prisma.campaign.count({
      where: { userId, status: 'SENT' }
    });

    // Get total recipients
    const totalRecipients = await prisma.recipient.count({
      where: { campaign: { userId } }
    });

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: { campaign: { userId } }
    });

    // Calculate overall stats
    const totalSent = analytics.reduce((sum, a) => sum + a.totalSent, 0);
    const totalOpened = analytics.reduce((sum, a) => sum + a.totalOpened, 0);
    const totalClicked = analytics.reduce((sum, a) => sum + a.totalClicked, 0);
    const totalBounced = analytics.reduce((sum, a) => sum + a.totalBounced, 0);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

    const stats = {
      totalCampaigns,
      sentCampaigns,
      totalRecipients,
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      openRate,
      clickRate,
      bounceRate
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

export const getCampaignAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    // Verify campaign belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // Get analytics for the campaign
    const analytics = await prisma.analytics.findUnique({
      where: { campaignId }
    });

    if (!analytics) {
      return res.status(404).json({ success: false, error: 'Analytics not found' });
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch campaign analytics' });
  }
};