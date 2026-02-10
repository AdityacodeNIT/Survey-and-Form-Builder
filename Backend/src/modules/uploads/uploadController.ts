import { Request, Response } from 'express';
import { ApiError, ApiResponse, asyncHandler } from '../../utils/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Upload a file to local storage
 * POST /api/upload
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  try {
    // File is already saved by multer to uploads/ folder
    const fileUrl = `/uploads/${req.file.filename}`;

    logger.info('File uploaded successfully', { 
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: fileUrl
    });

    return ApiResponse.success(res, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: fileUrl,
      storage: 'local',
    }, 'File uploaded successfully');
  } catch (error: any) {
    logger.error('File upload failed', { error: error.message });
    throw new ApiError(500, `File upload failed: ${error.message}`);
  }
});
