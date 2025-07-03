import type React from "react";
import { Job, JobStatus, Candidate } from "./jobs-interface";
import { AllowedCPF, AccessLog, SystemMetrics } from "./admin-interface";
import { DashboardData } from "./dashboard-interface";
import { User } from "./user-interface";

export interface ThemeSelectorProps {
  size?: "default" | "sm" | "lg" | "icon";
}

export interface CustomThemeProviderProps {
  children?: React.ReactNode;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface ShareDialogProps {
  title: string;
  resourceType: "job" | "candidates" | "report";
  resourceId: string;
  resourceName: string;
  tenantSlug?: string;
  jobSlug?: string;
}

export interface NavbarProps {
  tenantSlug: string;
  user: User | null;
}

export interface CandidateRankingProps {
  candidates: Candidate[];
  jobTitle: string;
  loading: boolean;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isOptional?: boolean;
}

export interface ApplicationStepperProps {
  steps: Step[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  onValidateStep?: (stepIndex: number) => Promise<boolean> | boolean;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description: string;
}

export interface JobStatsProps {
  stats: {
    totalJobs: number;
    totalCandidates: number;
    pcdJobs: number;
    models: {
      presencial: number;
      hibrido: number;
      remoto: number;
    };
  };
}

export interface JobSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export interface JobListProps {
  jobs: Job[];
  loading: boolean;
}

export interface QuestionSectionProps {
  questions: any[]; // Adjust type as needed
  onChange: (questions: any[]) => void;
  error?: string;
}

export interface JobActionsMenuProps {
  job: Job;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export interface JobViewProps {
  jobs: Job[];
  tenantSlug: string;
  viewMode: "card" | "list";
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export interface JobListHeaderProps {
  tenantSlug: string;
}

export interface JobPreviewProps {
  formData: Partial<Job>;
}

export interface JobListItemProps {
  job: Job;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export interface JobDetailsProps {
  job: Job;
  candidates: Candidate[];
  tenantSlug: string;
  radarData: any[]; // Adjust type as needed
}

export interface JobCreateFormProps {
  tenantSlug: string;
}

export interface JobCardProps {
  job: Job;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export interface CompetencySectionProps {
  competencies: any[]; // Adjust type as needed
  onChange: (competencies: any[]) => void;
  error?: string;
}

export interface JobBasicInfoProps {
  formData: Partial<Job>;
  onChange: (field: keyof Job, value: any) => void;
  errors: Record<string, string | undefined>;
}

export interface ActionButtonsProps {
  onSubmit: (status: JobStatus) => void;
  disabled: boolean;
}

export interface UserActivityChartProps {
  data: any[]; // Adjust type as needed
}

export interface ProgressChartProps {
  data: any[]; // Adjust type as needed
}

export interface MetricsCardsProps {
  data: any[]; // Adjust type as needed
}

export interface DashboardHeaderProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
  setPeriod: (value: "7d" | "30d" | "90d") => void;
  data: DashboardData;
}

export interface UserManagementProps {
  allowedCPFs: AllowedCPF[];
  addCPF: (newUser: AllowedCPF) => Promise<void>;
  removeCPF: (cpf: string) => Promise<void>;
}

export interface SystemSettingsProps {
  systemMetrics: SystemMetrics | null;
}

export interface AuditLogsProps {
  accessLogs: AccessLog[];
  allowedCPFs: AllowedCPF[];
}
