import { ObjectId } from 'mongodb';

export interface IJobQuestion {
  _id?: ObjectId; // MongoDB's default ID
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "single_choice" | "file_upload";
  options?: string[];
  required: boolean;
  order: number;
}
