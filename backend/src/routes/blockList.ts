import { Router } from 'express';
import { 
  getBlockList, 
  addToBlockList, 
  bulkAddToBlockList,
  removeFromBlockList, 
  bulkRemoveFromBlockList,
  getBlockListStats 
} from '../controllers/blockListController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getBlockList);
router.get('/stats', getBlockListStats);
router.post('/', addToBlockList);
router.post('/bulk', bulkAddToBlockList);
router.delete('/:id', removeFromBlockList);
router.delete('/bulk/remove', bulkRemoveFromBlockList);

export default router;