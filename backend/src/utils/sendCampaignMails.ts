import nodemailer from "nodemailer";
import { prisma } from '../config/database';

export const sendCampaignMails = async (campaign: any) => {
  if (!campaign.sender) {
    console.error("No sender configured for this campaign.");
    return;
  }

  const sender = campaign.sender;

  const transporter = nodemailer.createTransport({
    host: sender.host,
    port: sender.port,
    secure: true,
    auth: {
      user: sender.email,
      pass: sender.password,
    },
  });

  for (const recipient of campaign.recipients) {
    try {
      await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.email,
        subject: campaign.subject,
        html: campaign.content,
      });

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      await prisma.analytics.update({
        where: { campaignId: campaign.id },
        data: { totalSent: { increment: 1 } },
      });
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err);

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED" },
      });

      await prisma.analytics.update({
        where: { campaignId: campaign.id },
        data: { totalBounced: { increment: 1 } },
      });
    }
  }
};
