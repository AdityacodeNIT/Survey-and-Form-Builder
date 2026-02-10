import { Router } from 'express';
import { getSuggestions } from '../controllers/aiController.js';
import { authenticate } from '../../auth/middleware/authMiddleware.js';

const router = Router();

// POST /api/ai/suggestions - Get AI suggestions (requires authentication)
router.post('/suggestions', authenticate, getSuggestions);

export default router;
