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

router.post('/gmail/callback', async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await response.json() as GoogleTokenResponse;
    
    if (tokens.access_token) {
      // Get user email
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      });
      const userInfo = await userResponse.json() as GoogleUserResponse;
      
      res.json({
        success: true,
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          email: userInfo.email
        }
      });
    } else {
      res.json(tokens); // Return error from Google
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token exchange failed" });
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