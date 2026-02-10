import { Router } from 'express';
import {
  createForm,
  getForm,
  updateForm,
  deleteForm,
  listForms,
  publishForm,
  unpublishForm,
} from '../controllers/formController.js';
import { authenticate } from '../../auth/middleware/authMiddleware.js';

const router = Router();

// All form routes require authentication
router.use(authenticate);

// Form CRUD routes
router.post('/', createForm);
router.get('/', listForms);
router.get('/:id', getForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

// Publish/unpublish routes
router.post('/:id/publish', publishForm);
router.post('/:id/unpublish', unpublishForm);

export { router as formRoutes };
