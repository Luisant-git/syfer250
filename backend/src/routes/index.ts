import { Router } from 'express';
import authRoutes from './auth';
import campaignRoutes from './campaigns';
import senderRoutes from './senders';
import analyticsRoutes from './analytics';
import testOauthRoutes from './test-oauth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/senders', senderRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/test-oauth', testOauthRoutes);

export default router;