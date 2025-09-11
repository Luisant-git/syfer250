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

export const sendCampaignMailsGoogle = async (campaign: any) => {
  console.log('Starting Gmail campaign send for campaign:', campaign.id);
  
  if (!campaign.sender) {
    console.error("No sender configured for this campaign.");
    return;
  }

  const sender = campaign.sender;
  console.log('Sender details:', {
    email: sender.email,
    name: sender.name,
    hasAccessToken: !!sender.accessToken,
    hasRefreshToken: !!sender.refreshToken,
    expiresAt: sender.expiresAt
  });

  // Check if access token is expired and refresh if needed
  let accessToken = sender.accessToken;
  if (sender.expiresAt && new Date() > new Date(sender.expiresAt)) {
    console.log('Access token expired, refreshing...');
    // You'll need to implement token refresh logic here
  }

  console.log('Creating Gmail transporter with OAuth2...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: sender.email,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: sender.refreshToken,
      accessToken: accessToken,
    },
  });
  
  console.log('Gmail transporter created successfully');

  console.log(`Starting to send to ${campaign.recipients.length} recipients`);
  
  for (const recipient of campaign.recipients) {
    console.log(`Attempting to send email to: ${recipient.email}`);
    
    try {
      // Replace template variables with recipient data
      const personalizedSubject = replaceTemplateVariables(campaign.subject, recipient);
      const personalizedContent = replaceTemplateVariables(campaign.content, recipient);

      console.log(`Personalized content for ${recipient.email}:`, {
        subject: personalizedSubject,
        contentLength: personalizedContent.length
      });

      // Convert plain text to HTML with proper formatting
      const htmlContent = personalizedContent
        .replace(/\n/g, '<br>')
        .replace(/\r\n/g, '<br>')
        .replace(/\r/g, '<br>');

      console.log(`Sending email via Gmail OAuth to: ${recipient.email}`);
      
      const result = await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.email,
        subject: personalizedSubject,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${htmlContent}</div>`,
      });
      
      console.log(`Email sent successfully to ${recipient.email}:`, {
        messageId: result.messageId,
        response: result.response
      });

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      await prisma.analytics.update({
        where: { campaignId: campaign.id },
        data: { totalSent: { increment: 1 } },
      });
      
      console.log(`Database updated for successful send to: ${recipient.email}`);
      
    } catch (err: any) {
      console.error(`Failed to send to ${recipient.email}:`, {
        error: err.message,
        code: err.code,
        command: err.command,
        response: err.response,
        responseCode: err.responseCode,
        stack: err.stack
      });

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED" },
      });

      await prisma.analytics.update({
        where: { campaignId: campaign.id },
        data: { totalBounced: { increment: 1 } },
      });
      
      console.log(`Database updated for failed send to: ${recipient.email}`);
    }
  }
  
  console.log('Gmail campaign send completed');
};
