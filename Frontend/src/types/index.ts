// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Field types
export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'rating' | 'file';

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  order: number;
}

// Form types
export interface Form {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  purpose?: string;
  fields: Field[];
  publishStatus: 'draft' | 'published';
  shareableUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Response types
export interface ResponseData {
  [fieldId: string]: any;
}

export interface FormResponse {
  _id: string;
  formId: string;
  responseData: ResponseData;
  submittedAt: string;
}

// AI Suggestion types
export interface AISuggestion {
  id: string;
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: Array<{
    type: string;
    value: string | number;
    message: string;
  }>;
  options?: string[];
  reasoning?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
