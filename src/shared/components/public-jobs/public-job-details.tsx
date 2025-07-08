import { useState, useTransition } from "react";
import { IJob } from "@/domain/models/Job";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Users, Briefcase, MapPin, Clock, Building } from "lucide-react";
import { getStatusBadge } from "@/shared/lib/job-status-config";
import { submitApplicationAction } from "@/infrastructure/actions/candidate-actions";
import { toast } from "@/shared/hooks/use-toast";
import { z } from "zod";

interface IPublicJobDetailsProps {
  job: IJob;
}

export function PublicJobDetails({ job }: IPublicJobDetailsProps) {
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string | string[] | File | null>>({});
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleAnswerChange = (questionId: string, value: string, type: string) => {
    setAnswers((prev) => {
      if (type === "multiple_choice") {
        const existing = (prev[questionId] as string[]) || [];
        const newValues = existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value];
        return { ...prev, [questionId]: newValues };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnswers(prev => ({ ...prev, [questionId]: e.target.files![0] }));
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = () => {
    startTransition(async () => {
      if (!resumeFile) {
        toast({ title: "Erro de Validação", description: "Por favor, anexe seu currículo.", variant: "destructive" });
        return;
      }

      const formData = new FormData();
      formData.append("jobId", job._id!.toString());
      formData.append("candidateEmail", candidateEmail);
      formData.append("resume", resumeFile);

      const answersForBackend: Record<string, string | string[]> = {};
      for (const qId in answers) {
        const answer = answers[qId];
        if (answer instanceof File) {
          formData.append(`question_file_${qId}`, answer);
        } else if (answer) {
          answersForBackend[qId] = answer;
        }
      }
      formData.append("answers", JSON.stringify(answersForBackend) as string);

      try {
        const result = await submitApplicationAction(formData);
        if (result.success) {
          toast({
            title: "Sucesso!",
            description: "Sua candidatura foi enviada. Boa sorte!",
          });
          setAnswers({});
          setCandidateEmail('');
          setResumeFile(null);
        } else {
          toast({
            title: "Erro ao Enviar",
            description: result.error,
            variant: "destructive",
          });
          console.log("Erro ao enviar candidatura:", result);

        }
      } catch (error) {
        toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    });
  };

  const areAllRequiredQuestionsAnswered = () => {
    if (!job.questions) return true;
    return job.questions.every((q) => {
      if (q.required) {
        const answer = answers[q.id];
        if (q.type === "multiple_choice") {
          return Array.isArray(answer) && answer.length > 0;
        } else if (q.type === 'file_upload') {
          return answer instanceof File;
        } else {
          return typeof answer === "string" && answer.trim() !== "";
        }
      }
      return true;
    });
  };

  const isValidEmail = (email: string) => {
    try {
      z.string().email("E-mail inválido.").parse(email);
      return true;
    } catch (error) {
      return false;
    }
  };

  const hasRequiredQuestions = job.questions && job.questions.some(q => q.required);
  const isContactSectionEnabled = hasRequiredQuestions ? areAllRequiredQuestionsAnswered() : true;
  const isSubmitButtonEnabled = isContactSectionEnabled && isValidEmail(candidateEmail) && resumeFile !== null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">{job.title}</h1>
      <div className="flex items-center justify-center gap-2 mt-1">
        {getStatusBadge(job.status)}
        <span className="text-sm text-muted-foreground">
          Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descrição da Vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{job.description}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Criada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.candidatesCount} candidatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID: {job._id?.toString()}</span>
            </div>
            {job.department && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.department}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.location}</span>
              </div>
            )}
            {job.employmentType && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.employmentType.replace('_', ' ').toUpperCase()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {job.competencies && job.competencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competências Necessárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.competencies.map((comp) => (
                <Badge key={comp.id} variant="secondary">
                  {comp.name} (Peso: {comp.weight})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {job.questions && job.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responda às Perguntas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={`question-${q.id}`}>{q.question}{q.required && <span className="text-destructive">*</span>}</Label>
                {q.type === "text" && (
                  <Textarea
                    id={`question-${q.id}`}
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                    required={q.required}
                  />
                )}
                {["multiple_choice", "single_choice"].includes(q.type) && q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type={q.type === "single_choice" ? "radio" : "checkbox"}
                          id={`option-${q.id}-${index}`}
                          name={`question-${q.id}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                          checked={q.type === "single_choice" ? answers[q.id] === option : (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(option))}
                        />
                        <Label htmlFor={`option-${q.id}-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "file_upload" && (
                  <Input
                    id={`question-${q.id}`}
                    type="file"
                    onChange={(e) => handleQuestionFileChange(e, q.id)}
                    required={q.required}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className={!isContactSectionEnabled ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle>Informações de Contato e Currículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateEmail">Seu E-mail</Label>
            <Input
              id="candidateEmail"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="seu.email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeUpload">Upload do seu Currículo (PDF)</Label>
            <Input
              id="resumeUpload"
              type="file"
              accept=".pdf"
              onChange={handleResumeFileChange}
              required
            />
          </div>
          <Button onClick={handleSubmitApplication} className="w-full" disabled={isPending || !isSubmitButtonEnabled}>
            {isPending ? "Enviando..." : "Enviar Candidatura"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}