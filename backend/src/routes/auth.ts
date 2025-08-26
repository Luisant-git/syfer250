import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { authSchemas } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRequest(authSchemas.register), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validateRequest(authSchemas.login), login);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

/**
 * @swagger
 * /api/auth/oauth/gmail:
 *   post:
 *     summary: Exchange Gmail OAuth code for tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "4/0AVMBsJihe9_Oo46ULtFcBv4llTw3vdtXKD_6n8pJNAvIEzni5WmqiG0_ct9z8XI6mo022g"
 *     responses:
 *       200:
 *         description: OAuth tokens received
 */
// Gmail OAuth route
router.post('/oauth-gmail', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Gmail OAuth code:', code);
    res.json({
      success: true,
      data: {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        expires_in: 3600
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'OAuth failed' });
  }
});

/**
 * @swagger
 * /api/auth/oauth/outlook:
 *   post:
 *     summary: Exchange Outlook OAuth code for tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OAuth tokens received
 */
router.post('/oauth/outlook', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Outlook OAuth code:', code);
    res.json({
      success: true,
      data: {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        expires_in: 3600
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'OAuth failed' });
  }
});

export default router;