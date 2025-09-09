import { Router } from 'express';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

interface GoogleUserResponse {
  email: string;
  name?: string;
  picture?: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface MicrosoftUserResponse {
  mail: string;
  userPrincipalName: string;
}

const router = Router();

/**
 * @swagger
 * /api/oauth/gmail/callback:
 *   get:
 *     summary: Exchange Gmail OAuth code for tokens
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Gmail OAuth authorization code
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: OAuth error if any
 *     responses:
 *       200:
 *         description: OAuth tokens exchanged successfully
 *       400:
 *         description: Missing code or OAuth error
 *       500:
 *         description: Failed to exchange code
 */
router.get('/gmail/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string | undefined;
    const error = req.query.error as string | undefined;

    if (error) {
      return res.status(400).json({ success: false, error: `Google error: ${error}` });
    }
    if (!code) {
      return res.status(400).json({ success: false, error: 'Authorization code is required' });
    }

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GMAIL_CLIENT_ID!);
    params.append('client_secret', process.env.GMAIL_CLIENT_SECRET!);
    params.append('redirect_uri', process.env.GMAIL_REDIRECT_URI!);
    params.append('grant_type', 'authorization_code');

    const tokenResp = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokenData = tokenResp.data as GoogleTokenResponse;

    if (!tokenData.access_token) {
      console.error('Google token response without access_token:', tokenResp.data);
      throw new Error('No access token received from Google');
    }

    const meResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = meResp.data as GoogleUserResponse;

    return res.json({
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        email: userData.email
      }
    });
  } catch (e: any) {
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || 'Token exchange failed');
    console.error('Gmail OAuth error:', msg);
    return res.status(500).json({ success: false, error: msg });
  }
});

// Keep POST endpoint for frontend API calls
router.post('/gmail/callback', async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GMAIL_CLIENT_ID!);
    params.append('client_secret', process.env.GMAIL_CLIENT_SECRET!);
    params.append('redirect_uri', process.env.GMAIL_REDIRECT_URI!);
    params.append('grant_type', 'authorization_code');

    const tokenResp = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokenData = tokenResp.data as GoogleTokenResponse;
    
    if (!tokenData.access_token) {
      console.error('Google token response without access_token:', tokenResp.data);
      throw new Error('No access token received from Google');
    }

    const meResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    
    const userData = meResp.data as GoogleUserResponse;
    
    res.json({
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in || 3600,
        email: userData.email
      }
    });
  } catch (e: any) {
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || 'Token exchange failed');
    console.error('Gmail OAuth error:', msg);
    res.status(500).json({ success: false, error: msg });
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
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }
    
    console.log('Outlook OAuth code received:', code);
    
    const tokenResponse = await axios.post(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
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
    
    const tokenData = tokenResponse.data as MicrosoftTokenResponse;
    
    if (!tokenData.access_token) {
      throw new Error('No access token received from Microsoft');
    }
    
    // Get user profile to fetch email
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = userResponse.data as MicrosoftUserResponse;
    const email = userData.mail || userData.userPrincipalName;
    
    if (!email) {
      throw new Error('Could not retrieve email address from Microsoft profile');
    }
    
    res.json({
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        email: email
      }
    });
  } catch (error) {
    console.error('Outlook OAuth error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to exchange Outlook code'
    });
  }
});

export default router;