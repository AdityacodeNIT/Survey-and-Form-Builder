import { Request, Response } from 'express';
import { Form } from '../models/Form.js';
import { ApiError, ApiResponse, asyncHandler } from '../../../utils/index.js';
import { nanoid } from 'nanoid';

// Extend Request to include user from auth middleware
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Create a new form
 * POST /api/forms
 */
export const createForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, purpose, fields } = req.body;

  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const form = await Form.create({
    userId,
    title,
    description,
    purpose,
    fields: fields || [],
    publishStatus: 'draft',
  });

  return ApiResponse.created(res, form, 'Form created successfully');
});

/**
 * Get a specific form by ID
 * GET /api/forms/:id
 */
export const getForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if user owns the form
  const userId = req.user?.userId;
  if (form.userId.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to access this form');
  }

  return ApiResponse.success(res, form, 'Form retrieved successfully');
});

/**
 * Update a form
 * PUT /api/forms/:id
 */
export const updateForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, purpose, fields } = req.body;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if user owns the form
  const userId = req.user?.userId;
  if (form.userId.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to update this form');
  }

  // Update fields
  if (title !== undefined) form.title = title;
  if (description !== undefined) form.description = description;
  if (purpose !== undefined) form.purpose = purpose;
  if (fields !== undefined) form.fields = fields;

  await form.save();

  return ApiResponse.success(res, form, 'Form updated successfully');
});

/**
 * Delete a form
 * DELETE /api/forms/:id
 */
export const deleteForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if user owns the form
  const userId = req.user?.userId;
  if (form.userId.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to delete this form');
  }

  await Form.findByIdAndDelete(id);

  return ApiResponse.success(res, null, 'Form deleted successfully');
});

/**
 * List all forms for the authenticated user
 * GET /api/forms
 */
export const listForms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const forms = await Form.find({ userId })
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, forms, 'Forms retrieved successfully');
});

/**
 * Publish a form
 * POST /api/forms/:id/publish
 */
export const publishForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if user owns the form
  const userId = req.user?.userId;
  if (form.userId.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to publish this form');
  }

  // Generate shareable URL if not already published
  if (!form.shareableUrl) {
    form.shareableUrl = nanoid(10);
  }

  form.publishStatus = 'published';
  await form.save();

  return ApiResponse.success(res, form, 'Form published successfully');
});

/**
 * Unpublish a form
 * POST /api/forms/:id/unpublish
 */
export const unpublishForm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if user owns the form
  const userId = req.user?.userId;
  if (form.userId.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to unpublish this form');
  }

  form.publishStatus = 'draft';
  await form.save();

  return ApiResponse.success(res, form, 'Form unpublished successfully');
});

/**
 * Get a public form by shareable URL (no authentication required)
 * GET /api/public/forms/:shareableUrl
 */
export const getPublicForm = asyncHandler(async (req: Request, res: Response) => {
  const { shareableUrl } = req.params;

  const form = await Form.findOne({ shareableUrl });

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if form is published
  if (form.publishStatus !== 'published') {
    throw new ApiError(403, 'This form is not currently accepting responses');
  }

  return ApiResponse.success(res, form, 'Form retrieved successfully');
});
