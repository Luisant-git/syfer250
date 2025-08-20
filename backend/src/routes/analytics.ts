import { Router } from 'express';
import { getDashboardStats, getCampaignAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/campaign/:campaignId', getCampaignAnalytics);

export default router;