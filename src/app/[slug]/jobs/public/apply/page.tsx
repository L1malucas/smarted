"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { UploadCloud, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ApplicationStepper } from "@/shared/components/application-stepper"
import { Card } from "@/shared/components/ui/card"
import { Textarea } from "@/shared/components/ui/textarea"
import { toast } from "@/shared/hooks/use-toast"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { IJob } from "@/domain/models/Job"
import { submitApplicationAction } from "@/infrastructure/actions/candidate-actions";

// Mock job data (REMOVER QUANDO INTEGRAR COM A API REAL)
const mockJobData: IJob = {
  _id: new ObjectId().toHexString(),
  slug: "desenvolvedor-frontend-senior",
  title: "Desenvolvedor Frontend Sênior",
  description: "Buscamos um desenvolvedor frontend experiente...",
  competencies: [],
  questions: [
    { id: "q1", text: "Descreva sua experiência com React e TypeScript", type: "open" },
    {
      id: "q2",
      text: "Você tem experiência com testes automatizados?",
      type: "closed",
      options: ["Sim, bastante", "Sim, pouca", "Não, mas tenho interesse", "Não"],
    },
    { id: "q3", text: "Qual sua pretensão salarial?", type: "open" },
    { id: "q4", text: "Você está disponível para trabalho remoto?", type: "closed", options: ["Sim, totalmente remoto", "Sim, híbrido", "Prefiro presencial"] },
  ],
  isPCDExclusive: false,
  isReferralJob: false,
  status: "aberta",
  candidatesCount: 23,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system",
  criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
}

interface CandidateAnswer {
  questionId: string;
  answer: string | string[];
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.slug as string
  const jobSlug = params.jobSlug as string

  const [job, setJob] = useState<IJob | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [answers, setAnswers] = useState<CandidateAnswer[]>([])
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      try {
        // Simular busca da vaga
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (jobSlug === mockJobData.slug) {
          setJob(mockJobData)
          if (mockJobData.questions) {
            setAnswers(
              mockJobData.questions.map((q) => ({
                questionId: q.id,
                answer: q.type === "closed" ? [] : "",
              })),
            )
          }
        } else {
          toast({ title: "Erro", description: "Vaga não encontrada.", variant: "destructive" })
          router.push(`/public/${tenantSlug}/jobs`)
        }
      } catch (error: any) {
        toast({ title: "Erro", description: error.message || "Erro ao carregar a vaga.", variant: "destructive" });
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobSlug, router, tenantSlug])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) {
          // 5MB limit
          setResumeFile(file)
          toast({ title: "Sucesso", description: "Currículo anexado com sucesso!" })
        } else {
          toast({ title: "Erro", description: "O arquivo deve ter no máximo 5MB.", variant: "destructive" })
        }
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
          let currentSelection = Array.isArray(ans.answer) ? ans.answer : []
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

  const handleSubmitApplication = async () => {
    setIsSubmitting(true)
    try {
      if (!job || !resumeFile) {
        throw new Error("Dados de candidatura incompletos. Vaga ou currículo ausente.");
      }

      const formData = new FormData();
      formData.append("jobId", job._id.toHexString());
      formData.append("candidateEmail", personalInfo.email);
      formData.append("resume", resumeFile);
      formData.append("answers", JSON.stringify(answers));

      const result = await submitApplicationAction(formData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Sua candidatura foi enviada com sucesso!",
          variant: "default",
        });
        router.push(`/public/${tenantSlug}/jobs/${jobSlug}/success`);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Ocorreu um erro ao enviar sua candidatura. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado ao processar sua candidatura.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando processo de candidatura...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h2>
        <Button asChild>
          <Link href={`/public/${tenantSlug}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às vagas
          </Link>
        </Button>
      </div>
    )
  }

  // Step 1: Personal Information
  const PersonalInfoStep = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Seu nome completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="seu@email.com"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={personalInfo.phone}
          onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="(11) 99999-9999"
        />
      </div>
    </div>
  )

  // Step 2: Resume Upload
  const ResumeUploadStep = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="resume" className="block mb-2">
          Seu currículo (PDF obrigatório) *
        </Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="resume-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 5MB)</p>
            </div>
            <Input id="resume-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        </div>
        {resumeFile && (
          <div className="mt-4 p-4 border rounded-md flex items-center justify-between bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="text-sm font-medium text-green-800">{resumeFile.name}</span>
                <p className="text-xs text-green-600">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setResumeFile(null)}>
              Remover
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  // Step 3: Questions
  const QuestionsStep = (
    <div className="space-y-6">
      {job.questions && job.questions.length > 0 ? (
        job.questions.map((q, index) => {
          const currentAnswer = answers.find((a) => a.questionId === q.id)
          return (
            <div key={q.id} className="space-y-3">
              <Label htmlFor={`question-${q.id}`} className="text-base font-medium">
                {index + 1}. {q.text}
              </Label>
              {q.type === "open" ? (
                <Textarea
                  id={`question-${q.id}`}
                  value={(currentAnswer?.answer as string) || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={4}
                  placeholder="Digite sua resposta aqui..."
                  className="resize-none"
                />
              ) : (
                <div className="space-y-3">
                  {q.options?.map((opt) => (
                    <div key={opt} className="flex items-center space-x-3">
                      <Checkbox
                        id={`q-${q.id}-opt-${opt}`}
                        checked={(currentAnswer?.answer as string[])?.includes(opt) || false}
                        onCheckedChange={(checked) => handleClosedAnswerChange(q.id, opt, checked as boolean)}
                      />
                      <Label htmlFor={`q-${q.id}-opt-${opt}`} className="font-normal cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Esta vaga não possui perguntas específicas.</p>
          <p className="text-sm">Você pode prosseguir para o envio da candidatura.</p>
        </div>
      )}
    </div>
  )

  const steps = [
    {
      id: "personal-info",
      title: "Informações Pessoais",
      description: "Dados básicos para contato",
      component: PersonalInfoStep,
    },
    {
      id: "resume-upload",
      title: "Currículo",
      description: "Upload do seu currículo em PDF",
      component: ResumeUploadStep,
    },
    {
      id: "questions",
      title: "Perguntas",
      description: "Responda às perguntas da vaga",
      component: QuestionsStep,
      isOptional: !job.questions || job.questions.length === 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/public/${tenantSlug}/jobs`} className="hover:text-blue-600">
            Vagas
          </Link>
          <span>/</span>
          <Link href={`/public/${tenantSlug}/jobs/${jobSlug}`} className="hover:text-blue-600">
            {job.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Candidatar-se</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidatar-se para:</h1>
          <h2 className="text-2xl text-blue-600 font-semibold">{job.title}</h2>
        </div>
      </div>

      {/* Application Stepper */}
      <ApplicationStepper steps={steps} onComplete={handleSubmitApplication} className="max-w-4xl mx-auto" />

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold">Enviando candidatura...</h3>
                <p className="text-gray-600">Por favor, aguarde enquanto processamos sua candidatura.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}