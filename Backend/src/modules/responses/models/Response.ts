import { Schema, model, Document, Types } from 'mongoose';

export interface IResponse extends Document {
  formId: Types.ObjectId;
  responseData: Map<string, any>;
  submittedAt: Date;
}

const ResponseSchema = new Schema<IResponse>({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true,
  },
  responseData: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const Response = model<IResponse>('Response', ResponseSchema);
