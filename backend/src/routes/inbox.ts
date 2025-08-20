import { Router } from 'express';
import { 
  getEmailAccounts,
  addEmailAccount,
  getEmails,
  getEmail,
  updateEmail,
  bulkUpdateEmails,
  deleteEmails,
  getFolders,
  syncEmails
} from '../controllers/inboxController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Email accounts
router.get('/accounts', getEmailAccounts);
router.post('/accounts', addEmailAccount);
router.post('/accounts/:accountId/sync', syncEmails);

// Emails
router.get('/emails', getEmails);
router.get('/emails/:id', getEmail);
router.put('/emails/:id', updateEmail);
router.put('/emails/bulk', bulkUpdateEmails);
router.delete('/emails', deleteEmails);

// Folders
router.get('/folders', getFolders);

export default router;