import mongoose, { Schema, Document } from 'mongoose';

export interface IJobQuestion extends Document {
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "single_choice" | "file_upload";
  options?: string[];
  required: boolean;
  order: number;
}

const JobQuestionSchema: Schema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, required: true, enum: ["text", "multiple_choice", "single_choice", "file_upload"] },
  options: { type: [String] },
  required: { type: Boolean, required: true },
  order: { type: Number, required: true },
});

export default JobQuestionSchema;
