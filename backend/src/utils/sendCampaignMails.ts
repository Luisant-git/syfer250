import nodemailer from "nodemailer";
import axios from 'axios';
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
  const now = new Date();
  const expiresAt = new Date(sender.expiresAt);
  
  console.log('Token expiry check:', {
    now: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isExpired: now > expiresAt
  });
  
  // Always try to refresh token if we have a refresh token (Google tokens can be invalid even before expiry)
  if (sender.refreshToken) {
    console.log('Refreshing access token...');
    try {
      const refreshResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        refresh_token: sender.refreshToken,
        grant_type: 'refresh_token'
      });
      
      const tokenData = refreshResponse.data as any;
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        console.log('Token refreshed successfully');
        
        // Update token in database
        const newExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
        await prisma.sender.update({
          where: { id: sender.id },
          data: {
            accessToken: accessToken,
            expiresAt: newExpiresAt
          }
        });
        console.log('Updated token in database');
      }
    } catch (refreshError: any) {
      console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
    }
  }

  console.log('OAuth config:', {
    clientId: process.env.GMAIL_CLIENT_ID ? `${process.env.GMAIL_CLIENT_ID.substring(0, 20)}...` : 'Missing',
    clientSecret: process.env.GMAIL_CLIENT_SECRET ? `${process.env.GMAIL_CLIENT_SECRET.substring(0, 10)}...` : 'Missing',
    hasRefreshToken: !!sender.refreshToken,
    hasAccessToken: !!accessToken,
    refreshTokenLength: sender.refreshToken?.length || 0,
    accessTokenLength: accessToken?.length || 0
  });
  
  // Check if credentials match what was used during OAuth
  console.log('Credential validation:', {
    storedClientId: process.env.GMAIL_CLIENT_ID,
    expectedClientId: '1072370452711-3tgkvl5g3ejrspefsod180k5oddrcum3.apps.googleusercontent.com',
    clientIdMatch: process.env.GMAIL_CLIENT_ID === '1072370452711-3tgkvl5g3ejrspefsod180k5oddrcum3.apps.googleusercontent.com'
  });

  console.log('Using Gmail API instead of SMTP for better OAuth compatibility...');

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

      console.log(`Sending email via Gmail API to: ${recipient.email}`);
      
      // Create email message in RFC 2822 format
      const emailMessage = [
        `From: "${sender.name}" <${sender.email}>`,
        `To: ${recipient.email}`,
        `Subject: ${personalizedSubject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${htmlContent}</div>`
      ].join('\r\n');
      
      // Encode message in base64url format
      const encodedMessage = Buffer.from(emailMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Send via Gmail API
      const result = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        { raw: encodedMessage },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Email sent successfully to ${recipient.email}:`, {
        messageId: result.data.id,
        threadId: result.data.threadId
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
