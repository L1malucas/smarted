
import AsyncSelect from "react-select/async";
import { useState } from "react";
import { ChevronUp, ChevronDown, HelpCircle, CheckCircle2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "../ui/button";
import { useAddressAutocomplete } from "@/shared/hooks/use-address";
import { Job } from "@/shared/types/types/jobs-interface";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";
import { Input } from "postcss";
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";

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
  const [isOpen, setIsOpen] = useState(true);
  const { loadOptions } = useAddressAutocomplete();
  const { toast } = useToast();

  const [fieldStatus, setFieldStatus] = useState({
    title: false,
    description: false,
    department: false,
    location: false,
    salaryRange: false,
  });

  const validateField = (field: keyof typeof fieldStatus, value: any) => {
    let isValid = false;
    switch (field) {
      case "title":
        isValid = !!value && value.trim().length >= 3;
        break;
      case "description":
        isValid = !!value && value.trim().length >= 10;
        break;
      case "department":
        isValid = !!value && value.trim().length >= 3;
        break;
      case "location":
        isValid = !!value && value.trim().length >= 3;
        break;
      case "salaryRange":
        isValid = value?.min > 0 && value?.max > value?.min;
        break;
      default:
        isValid = true;
    }

    if (isValid && !fieldStatus[field]) {
      toast({
        title: "Campo preenchido",
        description: `O campo ${field} foi preenchido corretamente.`,
        className: "bg-green-100 border-green-500 text-green-800",
      });
    }

    setFieldStatus((prev) => ({ ...prev, [field]: isValid }));
    return isValid;
  };

  const handleInputChange = (field: keyof Job, value: any) => {
    onChange(field, value);
    if (field in fieldStatus) {
      validateField(field as keyof typeof fieldStatus, value);
    }
  };

  const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: any) => {
    const newSalaryRange = { ...formData.salaryRange, [field]: value };
    onChange("salaryRange", newSalaryRange);
    validateField("salaryRange", newSalaryRange);
  };

  const getBorderClass = (field: keyof typeof fieldStatus) => {
    if (errors[field]) return "border-red-500";
    return fieldStatus[field] ? "border-green-500" : "border-red-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center">
          Informações Básicas
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Defina pelo menos 3 competências para a vaga.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="relative">
            <Label htmlFor="title">Título da Vaga <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Ex: Engenheiro de Software Backend Pleno"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={getBorderClass("title")}
            />
            {fieldStatus.title && (
              <CheckCircle2 className="absolute right-2 top-8 h-5 w-5 text-green-500" />
            )}
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          <div className="relative">
            <Label htmlFor="description">Descrição Completa da Vaga <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Detalhe as responsabilidades, requisitos, cultura da empresa, benefícios, etc."
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={8}
              className={getBorderClass("description")}
            />
            {fieldStatus.description && (
              <CheckCircle2 className="absolute right-2 top-8 h-5 w-5 text-green-500" />
            )}
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          <div className="relative">
            <Label htmlFor="department">Departamento <span className="text-red-500">*</span></Label>
            <Input
              id="department"
              placeholder="Ex: Tecnologia"
              value={formData.department || ""}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className={getBorderClass("department")}
            />
            {fieldStatus.department && (
              <CheckCircle2 className="absolute right-2 top-8 h-5 w-5 text-green-500" />
            )}
            {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
          </div>
          <div className="relative">
            <Label htmlFor="location">Localização <span className="text-red-500">*</span></Label>
            <AsyncSelect
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions
              placeholder="Digite o nome da cidade..."
              value={formData.location ? { value: formData.location, label: formData.location } : null}
              onChange={(selectedOption) => handleInputChange("location", selectedOption?.value || "")}
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < 3 ? "Digite pelo menos 3 caracteres" : "Nenhuma localização encontrada"
              }
              loadingMessage={() => "Buscando localizações..."}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: getBorderClass("location").replace("border-", ""),
                  "&:hover": {
                    borderColor: getBorderClass("location").replace("border-", ""),
                  },
                }),
              }}
            />
            {fieldStatus.location && (
              <CheckCircle2 className="absolute right-2 top-8 h-5 w-5 text-green-500" />
            )}
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 relative">
            <div>
              <Label htmlFor="salaryMin">Salário Mínimo</Label>
              <Input
                id="salaryMin"
                type="text"
                value={
                  formData.salaryRange?.min !== undefined
                    ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: formData.salaryRange?.currency || "BRL",
                    }).format(formData.salaryRange.min)
                    : "R$ 0,00"
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleSalaryChange("min", Number(value) / 100);
                }}
                className={getBorderClass("salaryRange")}
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Salário Máximo</Label>
              <Input
                id="salaryMax"
                type="text"
                value={
                  formData.salaryRange?.max
                    ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: formData.salaryRange?.currency || "BRL",
                    }).format(Number(formData.salaryRange.max))
                    : "R$ 0,00"
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleSalaryChange("max", Number(value) / 100);
                }}
                className={getBorderClass("salaryRange")}
              />
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={formData.salaryRange?.currency || "BRL"}
                onValueChange={(value) => handleSalaryChange("currency", value)}
              >
                <SelectTrigger id="currency" className={getBorderClass("salaryRange")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fieldStatus.salaryRange && (
              <CheckCircle2 className="absolute right-2 top-8 h-5 w-5 text-green-500" />
            )}
            {errors.salaryRange && <p className="text-sm text-red-500 col-span-3">{errors.salaryRange}</p>}
          </div>
          <div>
            <Label htmlFor="employmentType">Tipo de Contrato</Label>
            <Select
              value={formData.employmentType || ""}
              onValueChange={(value) => handleInputChange("employmentType", value)}
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
              onValueChange={(value) => handleInputChange("experienceLevel", value)}
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
          <div className="flex items-center space-x-2">
            <Switch
              id="isPCDExclusive"
              checked={formData.isPCDExclusive || false}
              onCheckedChange={(checked) => handleInputChange("isPCDExclusive", checked)}
            />
            <Label htmlFor="isPCDExclusive">Vaga exclusiva para Pessoa com Deficiência (PCD)</Label>
          </div>
        </CardContent>
      )}
    </Card>
  );
}