import { Router } from 'express';
import { Request, Response } from 'express';
import { google } from 'googleapis';
import axios from 'axios';

const router = Router();

/**
 * @swagger
 * /api/oauth/gmail/callback:
 *   post:
 *     summary: Exchange Gmail OAuth code for tokens
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Gmail OAuth authorization code
 *                 example: "4/0AVMBsJihe9_Oo46ULtFcBv4llTw3vdtXKD_6n8pJNAvIEzni5WmqiG0_ct9z8XI6mo022g"
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: OAuth tokens exchanged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     expires_in:
 *                       type: number
 *       500:
 *         description: Failed to exchange code
 */
router.post('/gmail/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    console.log('Gmail OAuth code received:', code);
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    
    res.json({
      success: true,
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600
      }
    });
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange Gmail code'
    });
  }
});

/**
 * @swagger
 * /api/oauth/outlook/callback:
 *   post:
 *     summary: Exchange Outlook OAuth code for tokens
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Outlook OAuth authorization code
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: OAuth tokens exchanged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     expires_in:
 *                       type: number
 *       500:
 *         description: Failed to exchange code
 */
router.post('/outlook/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    console.log('Outlook OAuth code received:', code);
    
    const tokenResponse = await axios.post(`https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`, {
      client_id: process.env.OUTLOOK_CLIENT_ID,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/mail.read https://graph.microsoft.com/mail.send https://graph.microsoft.com/user.read'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    res.json({
      success: true,
      data: {
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token,
        expires_in: tokenResponse.data.expires_in
      }
    });
  } catch (error) {
    console.error('Outlook OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange Outlook code'
    });
  }
});

export default router;