import type React from "react";
import { IJob } from "@/domain/models/Job";
import { IJobStatus } from "@/domain/models/JobStatus";
import { ICandidate } from "@/domain/models/Candidate";
import { IAllowedCPF } from "@/domain/models/AllowedCPF";
import { IAuditLog } from "@/domain/models/AuditLog";
import { ISystemSettings } from "@/domain/models/SystemSettings";
import { IDashboardData, IMetricsData, IUserActivityData } from "./dashboard-interface";
import { IUser } from "@/domain/models/User";
import { ITheme, IColorMode } from "./theme-interface";
import { IJobQuestion } from "@/domain/models/JobQuestion";
import { ICompetency } from "@/domain/models/Competency";

export interface IThemeSelectorProps {
  showLabel?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export interface ICustomThemeProviderProps {
  children?: React.ReactNode;
}

export interface ITestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface IShareDialogProps {
  title: string;
  resourceType: "job" | "candidates" | "report";
  resourceId: string;
  resourceName: string;
  tenantSlug?: string;
  jobSlug?: string;
}

export interface INavbarProps {
  tenantSlug: string;
  user: IUser | null;
}

export interface ICandidateRankingProps {
  candidates: ICandidate[];
  jobTitle: string;
  jobId: string;
  tenantSlug: string;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
}

export interface IStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isOptional?: boolean;
}

export interface IApplicationStepperProps {
  steps: IStep[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  onValidateStep?: (stepIndex: number) => Promise<boolean> | boolean;
  className?: string;
}

export interface IPageHeaderProps {
  title: string;
  description: string;
}

export interface IJobStatsProps {
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

export interface IJobSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export interface IJobListProps {
  jobs: IJob[];
  loading: boolean;
  tenantSlug?: string;
}

export interface IQuestionSectionProps {
  questions: IJobQuestion[];
  onChange: (questions: IJobQuestion[]) => void;
  error?: string;
}

export interface IJobActionsMenuProps {
  job: IJob;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: IJobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export interface IJobViewProps {
  jobs: IJob[];
  tenantSlug: string;
  viewMode: "card" | "list";
  onStatusChange: (jobId: string, newStatus: IJobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export interface IJobListHeaderProps {
  tenantSlug: string;
}

export interface IJobPreviewProps {
  formData: Partial<IJob>;
}

export interface IJobListItemProps {
  job: IJob;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: IJobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export interface IJobDetailsProps {
  job: IJob;
  candidates: ICandidate[];
  tenantSlug: string;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
}

export interface IJobCreateFormProps {
  tenantSlug: string;
}

export interface IJobCardProps {
  job: IJob;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: IJobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export interface ICompetencySectionProps {
  competencies: ICompetency[];
  onChange: (competencies: ICompetency[]) => void;
  error?: string;
}

export interface IJobBasicInfoProps {
  formData: Partial<IJob>;
  onChange: <K extends keyof IJob>(field: K, value: IJob[K]) => void;
  errors: {
    title?: string;
    description?: string;
    department?: string;
    location?: string;
    salaryRange?: string;
  };
}

export interface IActionButtonsProps {
  onSubmit: (status: IJobStatus) => void;
  disabled: boolean;
}

export interface IUserActivityChartProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
}

export interface IProgressChartProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
}

export interface IMetricsCardsProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
}

export interface IDashboardHeaderProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
  setPeriod: (value: "7d" | "30d" | "90d") => void;
  data: IDashboardData;
}

export interface IUserManagementProps {
  allowedCPFs: IAllowedCPF[];
  addCPF: (newUser: IAllowedCPF) => Promise<void>;
  removeCPF: (cpf: string) => Promise<void>;
}

export interface ISystemSettingsProps {
  systemMetrics: ISystemSettings | null;
}

export interface IAuditLogsProps {
  accessLogs: IAuditLog[];
  allowedCPFs: IAllowedCPF[];
}

export interface IActionButtonsProps {
  onSubmit: (status: IJobStatus) => void;
  disabled: boolean;
}