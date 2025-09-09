import { Router } from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';

const router = Router();

/**
 * @swagger
 * /api/test-oauth/gmail:
 *   post:
 *     summary: Test Gmail OAuth token exchange with detailed debugging
 *     tags: [Test]
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
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: Test results with detailed error information
 */
router.post('/gmail', async (req: Request, res: Response) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required'
    });
  }
  
  console.log('=== Gmail OAuth Debug Test ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Code received:', code);
  console.log('Code length:', code.length);
  console.log('Client ID:', process.env.GMAIL_CLIENT_ID);
  console.log('Client ID length:', process.env.GMAIL_CLIENT_ID?.length);
  console.log('Client Secret:', process.env.GMAIL_CLIENT_SECRET ? `SET (${process.env.GMAIL_CLIENT_SECRET.length} chars)` : 'NOT SET');
  console.log('Client Secret value:', process.env.GMAIL_CLIENT_SECRET);
  console.log('Redirect URI:', process.env.GMAIL_REDIRECT_URI);
  console.log('Environment variables loaded:', {
    GMAIL_CLIENT_ID: !!process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: !!process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI: !!process.env.GMAIL_REDIRECT_URI
  });
  
  const requestParams = {
    code: code,
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    redirect_uri: process.env.GMAIL_REDIRECT_URI,
    grant_type: 'authorization_code'
  };
  
  console.log('Request parameters object:', requestParams);
  
  const data = qs.stringify(requestParams);
  
  console.log('Stringified request data:', data);
  console.log('Request URL:', 'https://oauth2.googleapis.com/token');

  try {
    
    console.log('Making request to Google OAuth endpoint...');
    
    const response = await axios.post('https://oauth2.googleapis.com/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('=== SUCCESS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    res.json({
      success: true,
      data: response.data,
      debug: {
        clientId: process.env.GMAIL_CLIENT_ID,
        clientIdLength: process.env.GMAIL_CLIENT_ID?.length,
        redirectUri: process.env.GMAIL_REDIRECT_URI,
        hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
        clientSecretLength: process.env.GMAIL_CLIENT_SECRET?.length,
        timestamp: new Date().toISOString(),
        requestData: data
      }
    });
    
  } catch (error: any) {
    console.error('=== Gmail OAuth Error Details ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('=== HTTP Response Error ===');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Config:', JSON.stringify({
        url: error.response.config?.url,
        method: error.response.config?.method,
        headers: error.response.config?.headers,
        data: error.response.config?.data
      }, null, 2));
      
      res.status(error.response.status).json({
        success: false,
        error: 'OAuth token exchange failed',
        details: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          timestamp: new Date().toISOString()
        },
        debug: {
          clientId: process.env.GMAIL_CLIENT_ID,
          clientIdLength: process.env.GMAIL_CLIENT_ID?.length,
          redirectUri: process.env.GMAIL_REDIRECT_URI,
          hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
          clientSecretLength: process.env.GMAIL_CLIENT_SECRET?.length,
          requestData: data
        }
      });
    } else if (error.request) {
      console.error('=== Request Error (No Response) ===');
      console.error('Request object:', error.request);
      console.error('Request config:', error.config);
      res.status(500).json({
        success: false,
        error: 'No response received from Google',
        details: {
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('=== Request Setup Error ===');
      console.error('Setup Error Message:', error.message);
      console.error('Error Code:', error.code);
      res.status(500).json({
        success: false,
        error: 'Request setup error',
        details: {
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
});

export default router;