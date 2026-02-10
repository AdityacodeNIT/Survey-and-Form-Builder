import { Request, Response as ExpressResponse } from 'express';
import { Response } from '../models/Response.js';
import { Form } from '../../forms/models/Form.js';
import { ApiError, ApiResponse, asyncHandler } from '../../../utils/index.js';


 // Submit a response to a form

export const submitResponse = asyncHandler(async (req: Request, res: ExpressResponse) => {
  const { id } = req.params;
  const { responseData } = req.body;

  if (!responseData || typeof responseData !== 'object') {
    throw new ApiError(400, 'Response data is required and must be an object');
  }

  // Find the form
  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Check if form is published
  if (form.publishStatus !== 'published') {
    throw new ApiError(403, 'This form is not accepting responses');
  }

  // Validate required fields
  const missingFields: string[] = [];
  
  for (const field of form.fields) {
    if (field.required) {
      const value = responseData[field.id];
      
      // Check if field is missing or empty
      if (value === undefined || value === null || value === '') {
        missingFields.push(field.label);
      }
    }
  }

  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }

  // Create response
  const response = await Response.create({
    formId: id,
    responseData: new Map(Object.entries(responseData)),
    submittedAt: new Date(),
  });

  return ApiResponse.created(res, response, 'Response submitted successfully');
});

/**
 * Get all responses for a form
 * GET /api/forms/:id/responses
 */
export const getResponses = asyncHandler(async (req: Request, res: ExpressResponse) => {
  const { id } = req.params;

  // Find the form to ensure it exists
  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Get all responses for this form
  const responses = await Response.find({ formId: id })
    .sort({ submittedAt: -1 });

  // Convert Map to plain object for JSON serialization
  const formattedResponses = responses.map(response => ({
    _id: response._id,
    formId: response.formId,
    responseData: Object.fromEntries(response.responseData),
    submittedAt: response.submittedAt,
  }));

  return ApiResponse.success(res, formattedResponses, 'Responses retrieved successfully');
});


 // Get analytics for a form

export const getAnalytics = asyncHandler(async (req: Request, res: ExpressResponse) => {
  const { id } = req.params;

  // Find the form to ensure it exists
  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  // Get all responses for this form
  const responses = await Response.find({ formId: id });

  // Calculate response count
  const responseCount = responses.length;

  // Calculate field-level statistics
  const fieldStatistics: Record<string, any> = {};

  for (const field of form.fields) {
    const fieldId = field.id;
    const fieldType = field.type;
    const fieldLabel = field.label;

    // Initialize field stats
    fieldStatistics[fieldId] = {
      fieldId,
      label: fieldLabel,
      type: fieldType,
    };

    // Collect all values for this field
    const values: any[] = [];
    for (const response of responses) {
      const value = response.responseData.get(fieldId);
      if (value !== undefined && value !== null && value !== '') {
        values.push(value);
      }
    }

    const responseCountForField = values.length;
    fieldStatistics[fieldId].responseCount = responseCountForField;

    // Calculate statistics based on field type
    if (fieldType === 'select') {
      // For select fields, calculate distribution
      const distribution: Record<string, number> = {};
      
      for (const value of values) {
        distribution[value] = (distribution[value] || 0) + 1;
      }

      // Convert to percentages
      const distributionPercentages: Record<string, number> = {};
      for (const [option, count] of Object.entries(distribution)) {
        distributionPercentages[option] = responseCountForField > 0 
          ? Math.round((count / responseCountForField) * 100 * 100) / 100 
          : 0;
      }

      fieldStatistics[fieldId].distribution = distribution;
      fieldStatistics[fieldId].distributionPercentages = distributionPercentages;
    } else if (fieldType === 'text' || fieldType === 'textarea') {
      // For text fields, just list the responses
      fieldStatistics[fieldId].responses = values;
    }
  }

  const analyticsData = {
    formId: id,
    formTitle: form.title,
    responseCount,
    fieldStatistics: Object.values(fieldStatistics),
  };

  return ApiResponse.success(res, analyticsData, 'Analytics retrieved successfully');
});
