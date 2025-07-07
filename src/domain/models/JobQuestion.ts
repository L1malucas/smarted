export interface IJobQuestion {
  _id?: string;
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "single_choice" | "file_upload";
  options?: string[];
  required: boolean;
  order: number;
}