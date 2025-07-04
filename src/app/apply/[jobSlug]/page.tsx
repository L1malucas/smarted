"use client"

import { CardFooter } from "@/shared/components/ui/card"

import type React from "react"

import { useState, useEffect, useTransition, startTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Progress } from "@/shared/components/ui/progress"
import { toast } from "@/shared/components/ui/use-toast"
import { UploadCloud, FileText, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { getJobBySlugAction, submitApplicationAction } from "@/infrastructure/actions/job-actions"
import { Job, CandidateAnswer } from "@/shared/types/types/jobs-interface"

/**
 * Componente de página para o formulário de candidatura a uma vaga.
 * 
 * @remarks
 * Este componente gerencia um processo de candidatura em múltiplos passos, incluindo:
 * - Upload de currículo em PDF
 * - Respostas para perguntas específicas da vaga (quando existentes)
 * 
 * @dependencies
 * - Requer um parâmetro `jobSlug` na URL para identificar a vaga
 * - Utiliza mock data temporário (mockJobData) para simular dados da vaga
 * - Integra-se com componentes UI da biblioteca shadcn/ui
 * 
 * @states
 * - currentStep: Controla o passo atual do formulário
 * - job: Armazena os dados da vaga
 * - resumeFile: Gerencia o arquivo PDF do currículo
 * - answers: Array de respostas às perguntas da vaga
 * - isLoading: Controla estados de carregamento
 * 
 * @callbacks
 * - handleFileChange: Processa o upload do arquivo PDF
 * - handleAnswerChange: Atualiza respostas para perguntas abertas
 * - handleClosedAnswerChange: Atualiza respostas para perguntas fechadas
 * - handleSubmitApplication: Processa o envio final da candidatura
 * 
 * @navigation
 * - Redireciona para home ('/') se a vaga não for encontrada
 * - Redireciona para página de confirmação após submissão
 * 
 * @validation
 * - Verifica se arquivo é PDF
 * - Requer upload de currículo antes de avançar
 * - Valida respostas antes da submissão
 * 
 * @future-improvements
 * - Implementar integração real com API
 * - Adicionar validação de tamanho máximo do arquivo
 * - Implementar persistência de dados em caso de refresh
 * - Adicionar tratamento de erros mais robusto
 * 
 * @example
 * URL de acesso: /apply/desenvolvedor-frontend
 */
export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const jobSlug = params.jobSlug as string

  const [currentStep, setCurrentStep] = useState(1)
  const [job, setJob] = useState<Job | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [answers, setAnswers] = useState<CandidateAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const jobResult = await getJobBySlugAction(jobSlug);
          if (jobResult.success && jobResult.data) {
            setJob(jobResult.data);
            if (jobResult.data.questions) {
              setAnswers(jobResult.data.questions.map((q) => ({ questionId: q.id, answer: q.type === "closed" ? [] : "" })));
            }
          } else {
            toast({
              title: "Erro",
              description: jobResult.error || "Vaga não encontrada.",
              variant: "destructive",
            });
            router.push("/"); // Redirect if job not found
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar vaga",
            description: "Não foi possível carregar os detalhes da vaga.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchData();
  }, [jobSlug, router]);

  const totalSteps = job?.isReferralJob ? 1 : (job?.questions?.length || 0) > 0 ? 2 : 1

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.type === "application/pdf") {
        setResumeFile(file)
      } else {
        toast({ title: "Erro", description: "Por favor, envie um arquivo PDF.", variant: "destructive" })
      }
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, answer } : a)))
  }

  const handleClosedAnswerChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prevAnswers) => {
      return prevAnswers.map((ans) => {
        if (ans.questionId === questionId) {
          let currentSelection = Array.isArray(ans.answer) ? ans.answer : ans.answer ? [ans.answer] : []
          if (checked) {
            if (!currentSelection.includes(option)) {
              currentSelection.push(option)
            }
          } else {
            currentSelection = currentSelection.filter((item) => item !== option)
          }
          return { ...ans, answer: currentSelection }
        }
        return ans
      })
    })
  }

  const nextStep = () => {
    if (currentStep === 1 && !resumeFile) {
      toast({ title: "Obrigatório", description: "Por favor, anexe seu currículo em PDF.", variant: "default" })
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmitApplication()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitApplication = async () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        if (!job) {
          toast({ title: "Erro", description: "Vaga não encontrada para submissão.", variant: "destructive" });
          return;
        }
        if (!resumeFile) {
          toast({ title: "Erro", description: "Currículo não anexado.", variant: "destructive" });
          return;
        }

        const result = await submitApplicationAction(job.slug, resumeFile, answers);
        if (result.success) {
          router.push(`/public/job/${job.slug}?applied=true`); // Redirect to a confirmation or public job page
        } else {
          toast({
            title: "Erro",
            description: result.error || "Não foi possível enviar sua candidatura. Por favor, tente novamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado ao submeter a candidatura.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  if (isLoading && !job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando vaga...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Vaga não encontrada.</p>
      </div>
    )
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Candidatar-se para: {job.title}</CardTitle>
          <CardDescription>Siga os passos abaixo para completar sua candidatura.</CardDescription>
          <Progress value={progressPercentage} className="mt-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Passo {currentStep} de {totalSteps}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Passo 1: Anexar Currículo (PDF)</h3>
              <div>
                <Label htmlFor="resume" className="block mb-2">
                  Seu currículo (PDF obrigatório)
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-muted-foreground">PDF (MAX. 5MB)</p>
                    </div>
                    <Input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {resumeFile && (
                  <div className="mt-4 p-3 border rounded-md flex items-center justify-between bg-muted">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">{resumeFile.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setResumeFile(null)}>
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && !job.isReferralJob && job.questions && job.questions.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Passo 2: Responder Perguntas</h3>
              {job.questions.map((q, index) => {
                const currentAnswer = answers.find((a) => a.questionId === q.id)
                return (
                  <div key={q.id} className="space-y-1">
                    <Label htmlFor={`question-${q.id}`}>
                      {index + 1}. {q.text}
                    </Label>
                    {q.type === "open" ? (
                      <Textarea
                        id={`question-${q.id}`}
                        value={(currentAnswer?.answer as string) || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <div className="space-y-2 mt-1">
                        {q.options?.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <Input
                              type="checkbox"
                              id={`q-${q.id}-opt-${opt}`}
                              value={opt}
                              checked={(currentAnswer?.answer as string[])?.includes(opt)}
                              onChange={(e) => handleClosedAnswerChange(q.id, opt, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`q-${q.id}-opt-${opt}`} className="font-normal">
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <Button onClick={nextStep} disabled={isLoading}>
            {isLoading ? "Enviando..." : currentStep === totalSteps ? "Enviar Candidatura" : "Próximo"}
            {currentStep < totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground mt-4">Powered by SMARTED TECH SOLUTIONS</p>
    </div>
  )
}
