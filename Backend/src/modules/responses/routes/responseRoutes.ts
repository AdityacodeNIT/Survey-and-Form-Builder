import { Router } from 'express';
import { submitResponse, getResponses, getAnalytics } from '../controllers/responseController.js';
import { authenticate } from '../../auth/middleware/authMiddleware.js';

const router = Router();

// POST /api/forms/:id/responses 

router.post('/:id/responses', submitResponse);

// GET /api/forms/:id/responses 

router.get('/:id/responses', authenticate, getResponses);

// GET /api/forms/:id/analytics 

router.get('/:id/analytics', authenticate, getAnalytics);

export default router;
