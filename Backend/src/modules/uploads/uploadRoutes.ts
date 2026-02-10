import { Router } from 'express';
import { upload } from '../../config/upload.js';
import { uploadFile } from './uploadController.js';

const router = Router();

// Upload file endpoint

router.post('/', upload.single('file'), uploadFile);

export default router;
