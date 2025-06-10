"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // Added useParams
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, PlusCircle, Trash2, HelpCircle } from "lucide-react"
import Link from "next/link"
import type { Job, Competency, JobQuestion, JobStatus } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const initialCompetency: Competency = { id: crypto.randomUUID(), name: "", weight: 3, isMandatory: false }
const initialQuestion: JobQuestion = { id: crypto.randomUUID(), text: "", type: "open" }

/**
 * @component CreateJobPage
 * @description Página de criação de vagas de emprego. Permite criar novas vagas com informações detalhadas,
 * competências e perguntas para candidatos.
 * 
 * @state {Partial<Job>} formData - Estado principal que armazena todos os dados do formulário da vaga
 * @state {number} mandatoryCompetenciesCount - Contador de competências obrigatórias
 * 
 * @hooks
 * - useRouter: Utilizado para navegação
 * - useParams: Obtém o slug do tenant da URL
 * - useEffect: Atualiza o contador de competências obrigatórias
 * 
 * @handlers
 * - handleInputChange: Gerencia mudanças nos campos básicos do formulário
 * - handleCompetencyChange: Gerencia mudanças nas competências
 * - addCompetency: Adiciona nova competência (máximo 5 obrigatórias)
 * - removeCompetency: Remove competência (mantém mínimo 1 obrigatória)
 * - handleQuestionChange: Gerencia mudanças nas perguntas
 * - handleQuestionOptionChange: Gerencia mudanças nas opções de perguntas fechadas
 * - addQuestionOption: Adiciona opção em pergunta fechada
 * - removeQuestionOption: Remove opção de pergunta fechada
 * - addQuestion: Adiciona nova pergunta
 * - removeQuestion: Remove pergunta existente
 * - handleSubmit: Valida e salva a vaga (como rascunho ou publicada)
 * 
 * @validations
 * - Mínimo 1 e máximo 5 competências obrigatórias
 * - Título e descrição são obrigatórios
 * - Perguntas fechadas precisam ter pelo menos 1 opção
 * 
 * @communications
 * - Integra com serviço de vagas (jobsService) para persistência
 * - Usa sistema de toast para feedback ao usuário
 * - Navegação baseada no tenant atual
 * 
 * @UI
 * - Layout responsivo (2 colunas em desktop)
 * - Preview em tempo real da vaga
 * - Campos dinâmicos para competências e perguntas
 * - Tooltips informativos
 * 
 * @modifications
 * Para modificar/estender:
 * 1. Altere initialCompetency/initialQuestion para novos campos padrão
 * 2. Adicione validações em handleSubmit
 * 3. Expanda interface Job para novos campos
 * 4. Modifique preview no Card lateral
 * 5. Ajuste pesos e limites de competências nas constantes
 * 
 * @dependencies
 * - shadcn/ui para componentes
 * - lucide-react para ícones
 * - next/navigation para roteamento
 * 
 * @example
 * // Uso básico do componente em uma rota Next.js:
 * app/[slug]/jobs/create/page.tsx
 */
export default function CreateJobPage() {
  const router = useRouter()
  const params = useParams() // Get params
  const tenantSlug = params.slug as string // Extract tenantSlug

  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    description: "",
    competencies: Array(1)
      .fill(null)
      .map(() => ({ ...initialCompetency, id: crypto.randomUUID(), isMandatory: true })), // Start with 1 mandatory
    questions: [{ ...initialQuestion, id: crypto.randomUUID() }],
    isPCDExclusive: false,
    isReferralJob: false,
    status: "draft",
    criteriaWeights: { experience: 20, skills: 20, certifications: 20, behavioral: 20, leadership: 20 },
  })
  const [mandatoryCompetenciesCount, setMandatoryCompetenciesCount] = useState(
    formData.competencies?.filter((c) => c.isMandatory).length || 0,
  )

  useEffect(() => {
    setMandatoryCompetenciesCount(formData.competencies?.filter((c) => c.isMandatory).length || 0)
  }, [formData.competencies])

  const handleInputChange = (field: keyof Job, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCompetencyChange = (index: number, field: keyof Competency, value: any) => {
    const updatedCompetencies = [...(formData.competencies || [])]
    updatedCompetencies[index] = { ...updatedCompetencies[index], [field]: value }

    // Ensure at least 1 and up to 5 mandatory competencies if user tries to uncheck
    if (field === "isMandatory") {
      const currentMandatoryCount = updatedCompetencies.filter((c) => c.isMandatory).length
      if (!value && currentMandatoryCount < 1 && updatedCompetencies.length > 0) {
        // Prevent unchecking if it's the last mandatory one and there's at least one competency
        toast({
          title: "Validação",
          description: "Deve haver pelo menos 1 competência principal obrigatória.",
          variant: "default",
        })
        return // Don't update state
      }
    }
    setFormData((prev) => ({ ...prev, competencies: updatedCompetencies }))
  }

  const addCompetency = () => {
    const newCompetency = { ...initialCompetency, id: crypto.randomUUID() }
    // If less than 5 competencies total, new ones can be marked mandatory by default, user can change
    if ((formData.competencies?.length || 0) < 5) {
      newCompetency.isMandatory = true
    } else {
      newCompetency.isMandatory = false
    }
    setFormData((prev) => ({ ...prev, competencies: [...(prev.competencies || []), newCompetency] }))
  }

  const removeCompetency = (index: number) => {
    const competencyToRemove = formData.competencies?.[index]
    const currentMandatoryCount = formData.competencies?.filter((c) => c.isMandatory).length || 0

    if (competencyToRemove?.isMandatory && currentMandatoryCount <= 1 && (formData.competencies?.length || 0) > 0) {
      toast({
        title: "Validação",
        description: "Não é possível remover a última competência principal obrigatória.",
        variant: "default",
      })
      return
    }
    setFormData((prev) => ({ ...prev, competencies: prev.competencies?.filter((_, i) => i !== index) }))
  }

  // ... (Question Management functions remain the same) ...
  const handleQuestionChange = (index: number, field: keyof JobQuestion, value: any) => {
    const updatedQuestions = [...(formData.questions || [])]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    if (field === "type" && value === "open") {
      delete updatedQuestions[index].options
    } else if (field === "type" && value === "closed" && !updatedQuestions[index].options) {
      updatedQuestions[index].options = [""]
    }
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const handleQuestionOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...(formData.questions || [])]
    const question = updatedQuestions[qIndex]
    if (question && question.options) {
      question.options[oIndex] = value
      setFormData((prev) => ({ ...prev, questions: updatedQuestions }))
    }
  }

  const addQuestionOption = (qIndex: number) => {
    const updatedQuestions = [...(formData.questions || [])]
    const question = updatedQuestions[qIndex]
    if (question && question.options) {
      question.options.push("")
      setFormData((prev) => ({ ...prev, questions: updatedQuestions }))
    }
  }

  const removeQuestionOption = (qIndex: number, oIndex: number) => {
    const updatedQuestions = [...(formData.questions || [])]
    const question = updatedQuestions[qIndex]
    if (question && question.options && question.options.length > 1) {
      question.options = question.options.filter((_, i) => i !== oIndex)
      setFormData((prev) => ({ ...prev, questions: updatedQuestions }))
    }
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), { ...initialQuestion, id: crypto.randomUUID() }],
    }))
  }

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({ ...prev, questions: prev.questions?.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (status: JobStatus) => {
    if (mandatoryCompetenciesCount < 1) {
      toast({
        title: "Erro de Validação",
        description:
          "É necessário definir pelo menos 1 competência principal obrigatória. Você tem " + mandatoryCompetenciesCount,
        variant: "destructive",
      })
      return
    }
    if (mandatoryCompetenciesCount > 5) {
      toast({
        title: "Erro de Validação",
        description:
          "Você pode definir no máximo 5 competências principais obrigatórias. Você tem " + mandatoryCompetenciesCount,
        variant: "destructive",
      })
      return
    }
    if (!formData.title || !formData.description) {
      toast({ title: "Erro de Validação", description: "Título e Descrição são obrigatórios.", variant: "destructive" })
      return
    }

    try {
      const jobToSave = {
        ...formData,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "current-user-slug", // Substituir pelo slug do usuário logado
        createdByName: "Usuário Atual", // Substituir pelo nome do usuário logado
      }
      console.log("Saving job:", jobToSave)
      // Aqui seria a chamada para a API: await jobsService.createJob(jobToSave)
      toast({ title: "Vaga Salva!", description: `A vaga "${formData.title}" foi salva como ${status}.` })
      router.push(`/${tenantSlug}/jobs`)
    } catch (error) {
      console.error("Error saving job:", error)
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar a vaga.", variant: "destructive" })
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${tenantSlug}/jobs`}>
              {" "}
              {/* Updated Link */}
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Nova Vaga</h1>
            <p className="text-muted-foreground">Defina os detalhes e critérios para a nova posição.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Vaga</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Engenheiro de Software Backend Pleno"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição Completa da Vaga</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalhe as responsabilidades, requisitos, cultura da empresa, benefícios, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={8}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPCDExclusive"
                    checked={formData.isPCDExclusive}
                    onCheckedChange={(checked) => handleInputChange("isPCDExclusive", checked)}
                  />
                  <Label htmlFor="isPCDExclusive">Vaga exclusiva para Pessoa com Deficiência (PCD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isReferralJob"
                    checked={formData.isReferralJob}
                    onCheckedChange={(checked) => handleInputChange("isReferralJob", checked)}
                  />
                  <Label htmlFor="isReferralJob">
                    Permitir candidatura simplificada por indicação (pula perguntas)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Competências da Vaga
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Defina de 1 a 5 competências principais obrigatórias. Adicione outras competências ilimitadas
                        (não obrigatórias).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>Total de obrigatórias: {mandatoryCompetenciesCount} (Min: 1, Máx: 5).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.competencies?.map((comp, index) => (
                  <div key={comp.id} className="p-3 border rounded-md space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-grow">
                        <Label htmlFor={`comp-name-${index}`}>Nome da Competência</Label>
                        <Input
                          id={`comp-name-${index}`}
                          value={comp.name}
                          onChange={(e) => handleCompetencyChange(index, "name", e.target.value)}
                          placeholder="Ex: React, Liderança, Comunicação"
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`comp-weight-${index}`}>Peso (1-5)</Label>
                        <Select
                          value={String(comp.weight)}
                          onValueChange={(val) => handleCompetencyChange(index, "weight", Number.parseInt(val))}
                        >
                          <SelectTrigger id={`comp-weight-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((w) => (
                              <SelectItem key={w} value={String(w)}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetency(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`comp-mandatory-${index}`}
                        checked={comp.isMandatory}
                        onCheckedChange={(checked) => handleCompetencyChange(index, "isMandatory", checked)}
                        disabled={!comp.isMandatory && mandatoryCompetenciesCount >= 5}
                      />
                      <Label htmlFor={`comp-mandatory-${index}`}>Competência Principal Obrigatória</Label>
                      {!comp.isMandatory && mandatoryCompetenciesCount >= 5 && (
                        <Badge variant="default" className="ml-2">
                          Máx. 5 obrigatórias
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addCompetency}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Competência
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Perguntas para Candidatos
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Crie perguntas abertas ou fechadas. Serão puladas se a vaga for por indicação.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.questions?.map((q, qIndex) => (
                  <div key={q.id} className="p-3 border rounded-md space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-grow">
                        <Label htmlFor={`q-text-${qIndex}`}>Texto da Pergunta</Label>
                        <Textarea
                          id={`q-text-${qIndex}`}
                          value={q.text}
                          onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                          placeholder="Ex: Descreva sua experiência com..."
                        />
                      </div>
                      <div className="w-40">
                        <Label htmlFor={`q-type-${qIndex}`}>Tipo</Label>
                        <Select
                          value={q.type}
                          onValueChange={(val) => handleQuestionChange(qIndex, "type", val as "open" | "closed")}
                        >
                          <SelectTrigger id={`q-type-${qIndex}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberta</SelectItem>
                            <SelectItem value="closed">Fechada (Múltipla Escolha)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {q.type === "closed" && (
                      <div className="space-y-2 pl-4">
                        <Label>Opções de Resposta:</Label>
                        {q.options?.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => handleQuestionOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Opção ${oIndex + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestionOption(qIndex, oIndex)}
                              disabled={(q.options?.length || 0) <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addQuestionOption(qIndex)}>
                          Adicionar Opção
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addQuestion}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Pergunta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview e Ações */}
          <div className="lg:col-span-1 space-y-6 sticky top-20">
            {" "}
            {/* Sticky para preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview da Vaga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-lg">{formData.title || "Título da Vaga"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {formData.description || "Descrição da vaga..."}
                </p>
                {formData.isPCDExclusive && (
                  <Badge variant="default" className="bg-blue-500 text-white">
                    Vaga Exclusiva PCD
                  </Badge>
                )}

                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Competências:</h4>
                  {formData.competencies
                    ?.filter((c) => c.name)
                    .map((c) => (
                      <div key={c.id} className="text-xs flex justify-between">
                        <span>
                          {c.name}{" "}
                          {c.isMandatory && (
                            <Badge variant="outline" className="ml-1 text-xs p-0.5 px-1">
                              Obrigatória
                            </Badge>
                          )}
                        </span>
                        <span>Peso: {c.weight}</span>
                      </div>
                    ))}
                  {(formData.competencies?.filter((c) => c.name).length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma competência definida.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Perguntas:</h4>
                  {formData.questions
                    ?.filter((q) => q.text)
                    .map((q) => (
                      <div key={q.id} className="text-xs">
                        <span>
                          {q.text} ({q.type === "open" ? "Aberta" : "Fechada"})
                        </span>
                      </div>
                    ))}
                  {(formData.questions?.filter((q) => q.text).length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma pergunta definida.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <Button
                onClick={() => handleSubmit("aberta")}
                className="w-full"
                disabled={!formData.title || !formData.description}
              >
                Publicar Vaga
              </Button>
              <Button onClick={() => handleSubmit("draft")} variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar como Rascunho
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
