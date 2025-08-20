import { Router } from 'express';
import authRoutes from './auth';
import campaignRoutes from './campaigns';
import senderRoutes from './senders';
import analyticsRoutes from './analytics';

const router = Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/senders', senderRoutes);
router.use('/analytics', analyticsRoutes);

export default router;