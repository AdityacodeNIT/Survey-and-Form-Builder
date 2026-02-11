export interface User {
  _id: string;
  email: string;
  name?: string;
}

export type FieldType = 
  | 'text' 
  | 'email'
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'rating' 
  | 'file';

export interface Field {
  id: string;
  label: string;
  type: FieldType | string;
  required: boolean;
  order: number;
  options?: string[];
  maxRating?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  placeholder?: string;
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  purpose?: string;
  fields: Field[];
  shareableUrl?: string;
  publishStatus?: 'draft' | 'published';
  preventDuplicates?: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface Response {
  _id: string;
  formId: string;
  responseData: ResponseData;
  createdAt: string;
  updatedAt?: string;
}

export type ResponseData = Record<string, any>;

export interface AISuggestion {
  id?: string;
  title: string;
  description: string;
  label?: string;
  fieldType?: FieldType | string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  fields: Field[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}
