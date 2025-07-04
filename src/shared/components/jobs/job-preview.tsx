import { Job } from "@/shared/types/types/jobs-interface";
import { Badge, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
interface JobPreviewProps {
  formData: Partial<Job>;
}

export function JobPreview({ formData }: JobPreviewProps) {
  return (
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
        <p className="text-sm">Departamento: {formData.department || "Não informado"}</p>
        <p className="text-sm">Localização: {formData.location || "Não informado"}</p>
        {formData.salaryRange && (
          <p className="text-sm">
            Salário: {formData.salaryRange.min} - {formData.salaryRange.max} {formData.salaryRange.currency}
          </p>
        )}
        {formData.employmentType && (
          <p className="text-sm">Tipo: {formData.employmentType.replace('_', ' ').toUpperCase()}</p>
        )}
        {formData.experienceLevel && (
          <p className="text-sm">Nível: {formData.experienceLevel.toUpperCase()}</p>
        )}
        {formData.isPCDExclusive && (
          <Badge variant="destructive" className="bg-blue-100 text-blue-800">
            Vaga Exclusiva PCD
          </Badge>
        )}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Competências:</h4>
          {formData.competencies?.filter(c => c.name).map(c => (
            <div key={c.id} className="text-xs flex justify-between">
              <span>{c.name}</span>
              <span>Peso: {c.weight}</span>
            </div>
          ))}
          {(formData.competencies?.filter(c => c.name).length || 0) === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma competência definida.</p>
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Perguntas:</h4>
          {formData.questions?.filter(q => q.question).map(q => (
            <div key={q.id} className="text-xs">
              <span>{q.question} ({q.type.replace('_', ' ').toUpperCase()}) {q.required && "(Obrigatória)"}</span>
            </div>
          ))}
          {(formData.questions?.filter(q => q.question).length || 0) === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma pergunta definida.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
