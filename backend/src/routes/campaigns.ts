import { Router } from 'express';
import { createCampaign, getCampaigns, getCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { campaignSchemas } from '../utils/validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(campaignSchemas.create), createCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaign);
router.put('/:id', validateRequest(campaignSchemas.update), updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;