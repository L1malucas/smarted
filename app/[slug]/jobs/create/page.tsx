"use client";
// conectar o audit no s logs
//  ajuste dos campos
// gerar interface de job para backend 
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Job, JobStatus } from "@/types/jobs-interface";
import { JobService } from "@/services/jobs";
import { AuditService } from "@/services/audit";
import { useJobValidation } from "@/hooks/use-job-validation";
import { ActionButtons } from "@/components/jobs/action-buttons";
import { JobBasicInfo } from "@/components/jobs/basic-info";
import { CompetencySection } from "@/components/jobs/competency-section";
import { JobPreview } from "@/components/jobs/job-preview";
import { QuestionSection } from "@/components/jobs/question-section";

export default function CreateJobPage() {
  const router = useRouter();
  const { slug } = useParams();
  const tenantSlug = slug as string;
  const { validateJob, getFieldError, hasFieldError, clearFieldError } = useJobValidation();
  const jobService = new JobService();
  const auditService = new AuditService();

  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    description: "",
    department: "",
    location: "",
    salaryRange: { min: 0, max: 0, currency: "BRL" },
    competencies: [
      { id: crypto.randomUUID(), name: "", weight: 3 },
      { id: crypto.randomUUID(), name: "", weight: 3 },
      { id: crypto.randomUUID(), name: "", weight: 3 },
    ],
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

  const handleInputChange = (field: keyof Job, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (hasFieldError(field as any)) {
      clearFieldError(field as any);
    }
  };

  const handleSubmit = async (status: JobStatus) => {
    const isDraft = status === "draft";
    const isValid = validateJob(formData, isDraft);

    if (!isValid) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const jobData: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'candidatesCount'> = {
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

      await jobService.saveJob(jobData);
      setHasUnsavedChanges(false);

      toast({
        title: isDraft ? "Rascunho Salvo" : "Vaga Publicada",
        description: isDraft ? "A vaga foi salva como rascunho." : "A vaga foi publicada com sucesso.",
      });

      router.push(`/${tenantSlug}/jobs`);
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a vaga.",
        variant: "destructive",
      });
    }
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