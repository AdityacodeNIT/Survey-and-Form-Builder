import { Schema, model, Document, Types } from 'mongoose';

export interface IField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'rating' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox fields
  minRating?: number; // For rating fields
  maxRating?: number; // For rating fields
  acceptedFileTypes?: string; // For file fields (e.g., ".pdf,.doc,.docx")
  maxFileSize?: number; // For file fields (in MB)
  order: number;
}

export interface IForm extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  purpose?: string;
  fields: IField[];
  publishStatus: 'draft' | 'published';
  shareableUrl?: string;
  preventDuplicates?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema<IField>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'email', 'textarea', 'select', 'radio', 'checkbox', 'date', 'rating', 'file'],
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    placeholder: {
      type: String,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
    },
    minRating: {
      type: Number,
    },
    maxRating: {
      type: Number,
    },
    acceptedFileTypes: {
      type: String,
    },
    maxFileSize: {
      type: Number,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    fields: {
      type: [FieldSchema],
      default: [],
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    shareableUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    preventDuplicates: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Form = model<IForm>('Form', FormSchema);
