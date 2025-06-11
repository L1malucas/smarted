import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job } from "@/types/jobs-interface";

interface JobBasicInfoProps {
  formData: Partial<Job>;
  onChange: (field: keyof Job, value: any) => void;
  errors: {
    title?: string;
    description?: string;
    department?: string;
    location?: string;
    salaryRange?: string;
  };
}

export function JobBasicInfo({ formData, onChange, errors }: JobBasicInfoProps) {
  const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: any) => {
    onChange("salaryRange", { ...formData.salaryRange, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Título da Vaga <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="Ex: Engenheiro de Software Backend Pleno"
            value={formData.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>
        <div>
          <Label htmlFor="description">Descrição Completa da Vaga <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Detalhe as responsabilidades, requisitos, cultura da empresa, benefícios, etc."
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            rows={8}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>
        <div>
          <Label htmlFor="department">Departamento <span className="text-red-500">*</span></Label>
          <Input
            id="department"
            placeholder="Ex: Tecnologia"
            value={formData.department || ""}
            onChange={(e) => onChange("department", e.target.value)}
            className={errors.department ? "border-red-500" : ""}
          />
          {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
        </div>
        <div>
          <Label htmlFor="location">Localização <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            placeholder="Ex: São Paulo, SP"
            value={formData.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="salaryMin">Salário Mínimo</Label>
            <Input
              id="salaryMin"
              type="number"
              value={formData.salaryRange?.min || 0}
              onChange={(e) => handleSalaryChange("min", Number(e.target.value))}
              className={errors.salaryRange ? "border-red-500" : ""}
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Salário Máximo</Label>
            <Input
              id="salaryMax"
              type="number"
              value={formData.salaryRange?.max || 0}
              onChange={(e) => handleSalaryChange("max", Number(e.target.value))}
              className={errors.salaryRange ? "border-red-500" : ""}
            />
          </div>
          <div>
            <Label htmlFor="currency">Moeda</Label>
            <Select
              value={formData.salaryRange?.currency || "BRL"}
              onValueChange={(value) => handleSalaryChange("currency", value)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.salaryRange && <p className="text-sm text-red-500 col-span-3">{errors.salaryRange}</p>}
        </div>
        <div>
          <Label htmlFor="employmentType">Tipo de Contrato</Label>
          <Select
            value={formData.employmentType || ""}
            onValueChange={(value) => onChange("employmentType", value)}
          >
            <SelectTrigger id="employmentType">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Tempo Integral</SelectItem>
              <SelectItem value="part_time">Meio Período</SelectItem>
              <SelectItem value="contract">Contrato</SelectItem>
              <SelectItem value="internship">Estágio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="experienceLevel">Nível de Experiência</Label>
          <Select
            value={formData.experienceLevel || ""}
            onValueChange={(value) => onChange("experienceLevel", value)}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Júnior</SelectItem>
              <SelectItem value="mid">Pleno</SelectItem>
              <SelectItem value="senior">Sênior</SelectItem>
              <SelectItem value="lead">Líder</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="closingDate">Data de Encerramento</Label>
          <Input
            id="closingDate"
            type="date"
            value={formData.closingDate ? formData.closingDate.toISOString().split('T')[0] : ""}
            onChange={(e) => onChange("closingDate", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isPCDExclusive"
            checked={formData.isPCDExclusive || false}
            onCheckedChange={(checked) => onChange("isPCDExclusive", checked)}
          />
          <Label htmlFor="isPCDExclusive">Vaga exclusiva para Pessoa com Deficiência (PCD)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isReferralJob"
            checked={formData.isReferralJob || false}
            onCheckedChange={(checked) => onChange("isReferralJob", checked)}
          />
          <Label htmlFor="isReferralJob">Permitir candidatura simplificada por indicação</Label>
        </div>
      </CardContent>
    </Card>
  );
}