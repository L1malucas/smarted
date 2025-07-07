"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ActionButtons } from "@/shared/components/jobs/action-buttons";
import { JobBasicInfo } from "@/shared/components/jobs/basic-info";
import { CompetencySection } from "@/shared/components/jobs/competency-section";
import { JobPreview } from "@/shared/components/jobs/job-preview";
import { QuestionSection } from "@/shared/components/jobs/question-section";
import { useJobValidation } from "@/shared/hooks/use-job-validation";
import { toast } from "@/shared/hooks/use-toast";
import { withActionLogging } from "@/shared/lib/actions";
import { createJobAction } from "@/infrastructure/actions/job-actions";
import { ICompetency } from "@/domain/models/Competency";
import { IJobStatus } from "@/domain/models/JobStatus";
import { IJob } from "@/domain/models/Job";
import { Button } from "@/shared/components/ui/button";


export default function CreateJobPage() {
  const router = useRouter();
  const { slug } = useParams();
  const tenantSlug = slug as string;
  const { validateJob, getFieldError, hasFieldError, clearFieldError } = useJobValidation();
  

  const [formData, setFormData] = useState<Partial<IJob>>({
    title: "",
    description: "",
    department: "",
    location: "",
    salaryRange: { min: 0, max: 0, currency: "BRL" },
    competencies: [
      { id: crypto.randomUUID(), name: "", weight: 3 },
      { id: crypto.randomUUID(), name: "", weight: 3 },
      { id: crypto.randomUUID(), name: "", weight: 3 },
    ] as ICompetency[],
    questions: [{ id: crypto.randomUUID(), question: "", type: "text", required: false, order: 0 }],
    isPCDExclusive: false,
    isReferralJob: false,
    status: "draft",
    isDraft: true,
    criteriaWeights: { experience: 20, skills: 20, certifications: 20, behavioral: 20, leadership: 20 },
    candidatesCount: 0,
    tags: [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasContent = formData.title || formData.description || formData.department || formData.location ||
      (formData.competencies && formData.competencies.some(c => c.name));
    setHasUnsavedChanges(!!hasContent);
  }, [formData.title, formData.description, formData.department, formData.location, formData.competencies]);

  const handleInputChange = (field: keyof IJob, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (hasFieldError(field as any)) {
      clearFieldError(field as any);
    }
  };

  const handleSubmit = async (status: IJobStatus) => {
    const isDraft = status === "draft";
    const logConfig = {
      userId: "current-user-slug", // Replace with actual user ID
      userName: "Usuário Atual", // Replace with actual user name
      actionType: isDraft ? "Salvar Rascunho de Vaga" : "Publicar Vaga",
      resourceType: "Vaga",
      resourceId: formData._id?.toString() || "", // Will be populated after creation
      success: false, // Required by IActionLogConfig
    };

    const handleSubmitInternal = async (status: IJobStatus) => {
      const isValid = validateJob(formData, isDraft);

      if (!isValid) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, corrija os erros no formulário antes de salvar.",
          variant: "destructive",
        });
        throw new Error("Erro de validação no formulário.");
      }

      const jobData: Omit<IJob, '_id' | 'createdAt' | 'updatedAt' | 'candidatesCount'> = {
        ...formData,
        title: formData.title || "",
        description: formData.description || "",
        department: formData.department || "",
        location: formData.location || "",
        salaryRange: formData.salaryRange,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        tags: formData.tags,
        closingDate: formData.closingDate,
        slug: (formData.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim() || crypto.randomUUID(),
        createdBy: "current-user-slug",
        createdByName: "Usuário Atual",
        status,
        isDraft,
        competencies: formData.competencies || [],
        questions: (formData.questions || []).map((q, i) => ({ ...q, order: i })),
        isPCDExclusive: formData.isPCDExclusive || false,
        isReferralJob: formData.isReferralJob || false,
        criteriaWeights: formData.criteriaWeights || {
          experience: 20, skills: 20, certifications: 20, behavioral: 20, leadership: 20
        },
      };

      const result = await createJobAction(jobData, isDraft);
      setHasUnsavedChanges(false);

      if (result.success && result.data && result.data._id) {
        logConfig.resourceId = result.data._id.toString();
      }

      router.push(`/${tenantSlug}/jobs`);
      return result.data; // Return IJob directly
    };

    const wrappedSubmit = withActionLogging(handleSubmitInternal, logConfig);
    const finalResult = await wrappedSubmit(status);
    return finalResult;
  };

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const userChoice = window.confirm(
        "Você tem alterações não salvas. Deseja salvar como rascunho antes de sair?"
      );
      if (userChoice) {
        await handleSubmit("draft");
        setTimeout(() => router.push(`/${tenantSlug}/jobs`), 1000);
        return;
      }
    }
    router.push(`/${tenantSlug}/jobs`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Nova Vaga</h1>
          <p className="text-muted-foreground">Defina os detalhes e critérios para a nova posição.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <JobBasicInfo
            formData={formData}
            onChange={handleInputChange}
            errors={{
              title: getFieldError("title"),
              description: getFieldError("description"),
              department: getFieldError("department"),
              location: getFieldError("location"),
              salaryRange: getFieldError("salaryRange"),
            }}
          />
          <CompetencySection
            competencies={formData.competencies || []}
            onChange={(competencies) => handleInputChange("competencies", competencies)}
            error={getFieldError("competencies")}
          />
          <QuestionSection
            questions={formData.questions || []}
            onChange={(questions) => handleInputChange("questions", questions)}
            error={getFieldError("questions")}
          />
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          <JobPreview formData={formData} />
          <ActionButtons
            onSubmit={handleSubmit}
            disabled={!formData.title || !formData.description || !formData.department || !formData.location}
          />
        </div>
      </div>
    </div>
  );
}