import { Router } from 'express';
import { createSender, getSenders, updateSender, deleteSender } from '../controllers/senderController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { senderSchemas } from '../utils/validation';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/senders:
 *   post:
 *     summary: Create a new sender
 *     tags: [Senders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sender created successfully
 */
router.post('/', validateRequest(senderSchemas.create), createSender);

/**
 * @swagger
 * /api/senders:
 *   get:
 *     summary: Get all senders
 *     tags: [Senders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Senders retrieved successfully
 */
router.get('/', getSenders);

/**
 * @swagger
 * /api/senders/{id}:
 *   put:
 *     summary: Update sender
 *     tags: [Senders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sender updated successfully
 */
router.put('/:id', updateSender);

/**
 * @swagger
 * /api/senders/{id}:
 *   delete:
 *     summary: Delete sender
 *     tags: [Senders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sender deleted successfully
 */
router.delete('/:id', deleteSender);

export default router;