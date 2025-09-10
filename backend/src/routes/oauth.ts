import { Router } from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

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

// Debug endpoint - REMOVE IN PRODUCTION
router.get('/debug/env', (req: Request, res: Response) => {
  res.json({
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI,
    GMAIL_CLIENT_SECRET_EXISTS: !!process.env.GMAIL_CLIENT_SECRET,
    GMAIL_CLIENT_SECRET_LENGTH: process.env.GMAIL_CLIENT_SECRET?.length || 0
  });
});

// GET endpoint for Gmail OAuth redirect
router.get('/gmail/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  console.log('STATE', state);

  if (!code) {
    return res.redirect('https://campaign.shoppingsto.com/campaigns/new?error=no_code');
  }

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", 
      new URLSearchParams({
        code: code as string,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    console.log('Token response:', response.data);
    

    const tokens = response.data as GoogleTokenResponse;

    console.log('Exchanged tokens:', tokens);
    
    if (tokens.access_token) {
      // Get user email
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      });
      const userInfo = userResponse.data as GoogleUserResponse;
      
      // Extract userId from state parameter if present
      let userId = null;
      if (state) {
        try {
          const decoded = jwt.verify(state as string, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
        } catch (error) {
          console.log('Invalid state token');
        }
      }
      
      if (userId) {
        // Save sender to database
        await prisma.sender.create({
          data: {
            name: userInfo.name || userInfo.email.split('@')[0],
            email: userInfo.email,
            isVerified: true,
            userId: userId
          }
        });
      }
      
      // Redirect to frontend with success message
      const encodedEmail = encodeURIComponent(userInfo.email);
      const redirectUrl = `https://campaign.shoppingsto.com/campaigns/new?success=gmail_connected&email=${encodedEmail}`;
      console.log('Attempting redirect to:', redirectUrl);
      console.log('Response headers before redirect:', res.getHeaders());
      console.log('Response headersSent:', res.headersSent);
      
      if (res.headersSent) {
        console.error('Cannot redirect - headers already sent');
        return;
      }
      
      // Try server redirect first
      res.redirect(redirectUrl);
      console.log('Redirect called successfully');
      
      // Fallback: If server redirect fails, send HTML with client-side redirect
      // Uncomment the lines below if server redirect doesn't work:
      // res.send(`
      //   <html>
      //     <head><title>Redirecting...</title></head>
      //     <body>
      //       <script>window.location.href = '${redirectUrl}';</script>
      //       <p>If you are not redirected, <a href="${redirectUrl}">click here</a></p>
      //     </body>
      //   </html>
      // `);
    } else {
      res.redirect('https://campaign.shoppingsto.com/campaigns/new?error=token_exchange_failed');
    }
  } catch (err) {
    console.error(err);
    res.redirect('https://campaign.shoppingsto.com/campaigns/new?error=oauth_failed');
  }
});

// POST endpoint for Gmail OAuth (keep for backward compatibility)
router.post('/gmail/callback', async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", 
      new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    console.log('Token response:', response.data);

    const tokens = response.data as GoogleTokenResponse;

    console.log('Exchanged tokens:', tokens);
    
    if (tokens.access_token) {
      // Get user email
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      });
      const userInfo = userResponse.data as GoogleUserResponse;
      
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