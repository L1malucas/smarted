import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Job } from "@/types/jobs-interface";
import { JobService } from "@/services/jobs";
import { AuditService } from "@/services/audit";
import { useJobValidation } from "@/hooks/use-job-validation";

interface JobCreateFormProps {
  tenantSlug: string;
}

interface Competency {
  id: string;
  name: string;
  weight: 1 | 2 | 3 | 4 | 5;
}

export function JobCreateForm({ tenantSlug }: JobCreateFormProps) {
  const router = useRouter();
  const { validateJob, validateField, getFieldError, hasFieldError, clearFieldError } = useJobValidation();

  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    description: "",
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 1, skills: 1, certifications: 1, behavioral: 1, leadership: 1 },
    status: "draft",
    candidatesCount: 0,
    isDraft: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Instanciar os serviços
  const jobService = new JobService();
  const auditService = new AuditService();

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasContent = formData.title || formData.description || (formData.competencies && formData.competencies.length > 0);
    setHasUnsavedChanges(!!hasContent);
  }, [formData.title, formData.description, formData.competencies]);

  const generateSlug = useCallback((title: string): string => {
    if (!title) return uuidv4();

    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .trim() || uuidv4();
  }, []);

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);

    try {
      // Validar apenas se não for rascunho
      if (!isDraft) {
        const isValid = validateJob(formData, false);
        if (!isValid) {
          toast({
            title: "Erro de Validação",
            description: "Corrija os erros no formulário antes de publicar a vaga.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const jobData: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'candidatesCount'> = {
        title: formData.title || "",
        description: formData.description || "",
        slug: generateSlug(formData.title || ""),
        createdBy: "current-user-slug",
        createdByName: "Usuário Atual",
        status: isDraft ? "draft" : "aberta",
        isDraft: isDraft,
        competencies: formData.competencies || [],
        questions: formData.questions || [],
        isPCDExclusive: formData.isPCDExclusive || false,
        isReferralJob: formData.isReferralJob || false,
        criteriaWeights: formData.criteriaWeights || {
          experience: 1, skills: 1, certifications: 1, behavioral: 1, leadership: 1
        },
      };

      // Salvar a vaga
      const savedJob = await jobService.saveJob(jobData);

      setHasUnsavedChanges(false);

      toast({
        title: isDraft ? "Rascunho Salvo" : "Vaga Criada",
        description: isDraft
          ? "A vaga foi salva como rascunho com sucesso."
          : "A vaga foi criada e publicada com sucesso.",
      });

      if (!isDraft) {
        router.push(`/${tenantSlug}/jobs`);
      }
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      toast({
        title: "Erro ao Salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar a vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const userChoice = window.confirm(
        "Você tem alterações não salvas. Deseja salvar como rascunho antes de sair?"
      );

      if (userChoice) {
        await handleSubmit(true);
        // Aguardar um momento para o toast aparecer antes de navegar
        setTimeout(() => {
          router.push(`/${tenantSlug}/jobs`);
        }, 1000);
        return;
      }
    }
    router.push(`/${tenantSlug}/jobs`);
  };

  const handleInputChange = (field: keyof Job, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (hasFieldError(field as any)) {
      clearFieldError(field as any);
    }
  };

  const handleFieldBlur = (field: keyof Job, value: any) => {
    // Validate field on blur for immediate feedback
    if (field === 'title' || field === 'description' || field === 'competencies') {
      validateField(field, value);
    }
  };

  const handleCompetencyAdd = () => {
    const newCompetency: Competency = {
      id: uuidv4(),
      name: "",
      weight: 1,
    };
    const newCompetencies = [...(formData.competencies || []), newCompetency];
    handleInputChange("competencies", newCompetencies);
  };

  const handleCompetencyRemove = (competencyId: string) => {
    const newCompetencies = (formData.competencies || []).filter(comp => comp.id !== competencyId);
    handleInputChange("competencies", newCompetencies);

    // Revalidate competencies after removal
    setTimeout(() => {
      if (newCompetencies.length > 0) {
        validateField('competencies', newCompetencies);
      }
    }, 100);
  };

  const handleCompetencyChange = (index: number, field: 'name' | 'weight', value: string | number) => {
    const newCompetencies = [...(formData.competencies || [])];
    if (field === 'name') {
      newCompetencies[index].name = value as string;
    } else {
      newCompetencies[index].weight = value as 1 | 2 | 3 | 4 | 5;
    }
    handleInputChange("competencies", newCompetencies);

    // Validate competencies after change
    setTimeout(() => {
      validateField('competencies', newCompetencies);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Criar Nova Vaga</h1>
        <p className="text-muted-foreground">Preencha os detalhes da vaga abaixo</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">
            Título da Vaga <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            onBlur={(e) => handleFieldBlur("title", e.target.value)}
            placeholder="Digite o título da vaga (mínimo 20 caracteres)"
            className={hasFieldError('title') ? 'border-red-500' : ''}
          />
          {hasFieldError('title') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('title')}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData.title?.length || 0}/200 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="description">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            onBlur={(e) => handleFieldBlur("description", e.target.value)}
            placeholder="Descreva a vaga em detalhes (mínimo 100 caracteres)"
            rows={6}
            className={hasFieldError('description') ? 'border-red-500' : ''}
          />
          {hasFieldError('description') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('description')}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description?.length || 0}/5000 caracteres
          </p>
        </div>

        <div>
          <Label>
            Competências <span className="text-red-500">*</span>
            <span className="text-sm text-muted-foreground ml-2">(mínimo 3)</span>
          </Label>
          <div className="space-y-2">
            {formData.competencies?.map((comp, index) => (
              <div key={comp.id} className="flex gap-2 items-center">
                <Input
                  placeholder="Nome da competência"
                  value={comp.name}
                  onChange={(e) => handleCompetencyChange(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <select
                  value={comp.weight}
                  onChange={(e) => handleCompetencyChange(index, 'weight', Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[1, 2, 3, 4, 5].map((weight) => (
                    <option key={weight} value={weight}>Peso {weight}</option>
                  ))}
                </select>
                {formData.competencies && formData.competencies.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompetencyRemove(comp.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={handleCompetencyAdd}>
              Adicionar Competência
            </Button>
          </div>
          {hasFieldError('competencies') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('competencies')}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData.competencies?.length || 0} competência(s) adicionada(s)
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Publicando..." : "Publicar Vaga"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Rascunho"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}