import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { ApiError } from '../../../utils/apiError.js';
import { generateSuggestions } from '../services/aiService.js';

/**
 * POST /api/ai/suggestions
 * Get AI-generated form field suggestions based on form purpose
 */
export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { purpose } = req.body;

  if (!purpose || typeof purpose !== 'string') {
    throw new ApiError(400, 'Form purpose is required and must be a string');
  }

  // Get userId from authenticated user (set by authenticate middleware)
  const userId = (req as any).user?.id || 'anonymous';

  const suggestions = await generateSuggestions(purpose, userId);

  return ApiResponse.success(
    res,
    suggestions,
    'AI suggestions generated successfully'
  );
});
