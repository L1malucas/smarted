import { ICompetency } from "@/domain/models/Competency";
import { IJobQuestion } from "@/domain/models/JobQuestion";

export interface ValidationErrors {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
  salaryRange?: string;
  competencies?: string;
  questions?: string;
}
