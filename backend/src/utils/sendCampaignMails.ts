import nodemailer from "nodemailer";
import { prisma } from '../config/database';

// Function to replace template variables with recipient data
const replaceTemplateVariables = (template: string, recipient: any): string => {
  let result = template;
  
  // Replace common template variables
  result = result.replace(/{{firstName}}/g, recipient.firstName || recipient.name || 'there');
  result = result.replace(/{{lastName}}/g, recipient.lastName || '');
  result = result.replace(/{{name}}/g, recipient.name || recipient.firstName || 'there');
  result = result.replace(/{{email}}/g, recipient.email || '');
  
  // Add more variables as needed
  if (recipient.company) {
    result = result.replace(/{{company}}/g, recipient.company);
  }
  if (recipient.phone) {
    result = result.replace(/{{phone}}/g, recipient.phone);
  }
  
  return result;
};

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
      // Replace template variables with recipient data
      const personalizedSubject = replaceTemplateVariables(campaign.subject, recipient);
      const personalizedContent = replaceTemplateVariables(campaign.content, recipient);
      
      // Convert plain text to HTML with proper formatting
      const htmlContent = personalizedContent
        .replace(/\n/g, '<br>')
        .replace(/\r\n/g, '<br>')
        .replace(/\r/g, '<br>');
      
      await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.email,
        subject: personalizedSubject,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${htmlContent}</div>`,
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
