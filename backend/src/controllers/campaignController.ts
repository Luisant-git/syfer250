import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendCampaignMails, sendCampaignMailsGoogle, sendCampaignMailsOutlook } from "../utils/sendCampaignMails";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, content, senderId, scheduledAt, recipients, scheduleType } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one recipient is required",
      });
    }

    let status: "DRAFT" | "SENT" | "SCHEDULED" = "DRAFT";
    let finalScheduledAt: Date | null = null;

    if (scheduleType === "now") {
      status = "SENT";
    } else if (scheduleType === "later" && scheduledAt) {
      status = "SCHEDULED";
      finalScheduledAt = new Date(scheduledAt);
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        content,
        status,
        senderId: senderId && senderId.trim() !== "" ? senderId : null,
        scheduledAt: finalScheduledAt,
        sentAt: status === "SENT" ? new Date() : null,
        userId: req.user!.id,
        recipients: {
          create: recipients.map((recipient: any) => ({
            email: recipient.email,
            firstName: recipient.firstName || null,
            lastName: recipient.lastName || null,
            status: status === "SENT" ? "SENT" : "PENDING",
            sentAt: status === "SENT" ? new Date() : null,
          })),
        },
      },
      include: { recipients: true, sender: true },
    });

    await prisma.analytics.create({
      data: {
        campaignId: campaign.id,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      },
    });

    // 🚀 Send emails if "now"
    if (campaign.sender?.provider === "GMAIL") {
      await sendCampaignMailsGoogle(campaign);
      console.log('Using Gmail OAuth sending function');
    } else if (campaign.sender?.provider === "OUTLOOK") {
      await sendCampaignMailsOutlook(campaign);
      console.log('Using Outlook OAuth sending function');
    } else {
      await sendCampaignMails(campaign);
      console.log('Using SMTP sending function');
    }

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error("Campaign creation error:", error);
    res.status(500).json({ success: false, error: "Failed to create campaign" });
  }
};


// export const createCampaign = async (req: AuthRequest, res: Response) => {
//   try {
//     const { name, subject, content, senderId, scheduledAt, recipients, scheduleType } = req.body;
    
//     // Validate recipients array
//     if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'At least one recipient is required' 
//       });
//     }

//     // Determine campaign status based on schedule type
//     let status: 'DRAFT' | 'SENT' | 'SCHEDULED' = 'DRAFT';
//     let finalScheduledAt = null;
    
//     if (scheduleType === 'now') {
//       status = 'SENT';
//     } else if (scheduleType === 'later' && scheduledAt) {
//       status = 'SCHEDULED';
//       finalScheduledAt = new Date(scheduledAt);
//     }
//     // scheduleType === 'draft' keeps status as 'DRAFT'

//     const campaign = await prisma.campaign.create({
//       data: {
//         name,
//         subject,
//         content,
//         status,
//         senderId: senderId && senderId.trim() !== '' ? senderId : null,
//         scheduledAt: finalScheduledAt,
//         sentAt: status === 'SENT' ? new Date() : null,
//         userId: req.user!.id,
//         recipients: {
//           create: recipients.map((recipient: any) => ({
//             email: recipient.email,
//             firstName: recipient.firstName || null,
//             lastName: recipient.lastName || null,
//             status: status === 'SENT' ? 'SENT' as const : 'PENDING' as const,
//             sentAt: status === 'SENT' ? new Date() : null
//           }))
//         }
//       },
//       include: { recipients: true, sender: true }
//     });

//     // Create analytics record
//     await prisma.analytics.create({
//       data: {
//         campaignId: campaign.id,
//         totalSent: 0,
//         totalOpened: 0,
//         totalClicked: 0,
//         totalBounced: 0,
//         openRate: 0,
//         clickRate: 0,
//         bounceRate: 0
//       }
//     });

//     res.status(201).json({ success: true, data: campaign });
//   } catch (error) {
//     console.error('Campaign creation error:', error);
//     res.status(500).json({ success: false, error: 'Failed to create campaign' });
//   }
// };

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user!.id },
      include: { recipients: true, sender: true, analytics: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch campaigns' });
  }
};

export const getCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: req.user!.id },
      include: { recipients: true, sender: true, analytics: true }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch campaign' });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle senderId
    if (updateData.senderId !== undefined) {
      updateData.senderId = updateData.senderId && updateData.senderId.trim() !== '' ? updateData.senderId : null;
    }

    // Handle scheduledAt
    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    const campaign = await prisma.campaign.updateMany({
      where: { id, userId: req.user!.id },
      data: updateData
    });

    if (campaign.count === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { recipients: true, sender: true, analytics: true }
    });

    res.json({ success: true, data: updatedCampaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to update campaign' });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await prisma.analytics.deleteMany({ where: { campaignId: id } });
    await prisma.recipient.deleteMany({ where: { campaignId: id } });
    
    // Then delete the campaign
    const deleted = await prisma.campaign.deleteMany({
      where: { id, userId: req.user!.id }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete campaign' });
  }
};