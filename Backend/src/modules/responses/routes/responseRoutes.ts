import { Router } from 'express';
import { submitResponse, getResponses, getAnalytics } from '../controllers/responseController.js';
import { authenticate } from '../../auth/middleware/authMiddleware.js';

const router = Router();

// POST /api/forms/:id/responses - Submit a response to a form (PUBLIC - no auth required)
router.post('/:id/responses', submitResponse);

// GET /api/forms/:id/responses - Get all responses for a form (PROTECTED - requires auth)
router.get('/:id/responses', authenticate, getResponses);

// GET /api/forms/:id/analytics - Get analytics for a form (PROTECTED - requires auth)
router.get('/:id/analytics', authenticate, getAnalytics);

export default router;
