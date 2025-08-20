import { Router } from 'express';
import { getProfile, updateProfile, getSettings, updateSettings, updatePassword } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.put('/password', updatePassword);

export default router;