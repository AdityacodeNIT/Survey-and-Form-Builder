import { Response } from 'express';

/**
 * Standardized API response structure
 */

export interface ApiResponseData<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}


export class ApiResponse {

    // we make them static  becasue it is just the way of sneidng data

  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponseData<T> = {
      status: 'success',
      message,
      data,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data?: T, message?: string): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send a no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}


// stable contract for object 