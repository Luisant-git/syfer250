import { Router } from 'express';
import { Request, Response } from 'express';
import { google } from 'googleapis';

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
      '1072370452711-3tgkvl5g3ejrspefsod180k5oddrcum3.apps.googleusercontent.com',
      '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',
      'http://localhost:5174/campaigns/new'
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
    
    // Exchange code for tokens (simplified for testing)
    const tokenData = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    };
    
    res.json({
      success: true,
      data: tokenData
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