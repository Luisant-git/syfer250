import { prisma } from '../config/database';
import { sendCampaignMails, sendCampaignMailsGoogle, sendCampaignMailsOutlook } from '../utils/sendCampaignMails';

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    // Check every minute for scheduled campaigns
    this.intervalId = setInterval(() => {
      this.processScheduledCampaigns();
    }, 60000); // 60 seconds

    console.log('Scheduler service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Scheduler service stopped');
    }
  }

  private async processScheduledCampaigns() {
    try {
      const now = new Date();
      
      // Find campaigns that are scheduled and due to be sent
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

      if (scheduledCampaigns.length > 0) {
        console.log(`[${now.toISOString()}] Found ${scheduledCampaigns.length} campaigns to process`);
      }

      for (const campaign of scheduledCampaigns) {
        try {
          console.log(`Processing scheduled campaign: ${campaign.id}`);
          
          // Update campaign status to SENT
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
              status: 'SENT',
              sentAt: new Date()
            }
          });

          // Update recipients status to SENT (will be updated individually during sending)
          await prisma.recipient.updateMany({
            where: { campaignId: campaign.id },
            data: { status: 'PENDING' }
          });

          // Send emails based on provider
          if (campaign.sender?.provider === 'GMAIL') {
            await sendCampaignMailsGoogle(campaign);
            console.log(`Sent scheduled campaign ${campaign.id} via Gmail`);
          } else if (campaign.sender?.provider === 'OUTLOOK') {
            await sendCampaignMailsOutlook(campaign);
            console.log(`Sent scheduled campaign ${campaign.id} via Outlook`);
          } else {
            await sendCampaignMails(campaign);
            console.log(`Sent scheduled campaign ${campaign.id} via SMTP`);
          }

        } catch (error) {
          console.error(`Failed to process scheduled campaign ${campaign.id}:`, error);
          
          // Mark campaign as failed
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: 'DRAFT' } // Reset to draft so it can be retried
          });
        }
      }
    } catch (error) {
      console.error('Error processing scheduled campaigns:', error);
    }
  }
}

export const schedulerService = new SchedulerService();