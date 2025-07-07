
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "../ui/card";
import { IJobSearchProps } from "@/shared/types/types/component-props";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

export function JobSearch({
  searchTerm,
  onSearchChange,
  employmentType,
  onEmploymentTypeChange,
  experienceLevel,
  onExperienceLevelChange,
  isPCDExclusive,
  onIsPCDExclusiveChange,
}: IJobSearchProps) {
  return (
    <Card className="border-none">
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <Search
            className={`absolute transition-all duration-300 h-5 w-5 text-gray-400
          ${searchTerm.length > 0 ? 'right-3 cursor-pointer hover:text-gray-600' : 'left-3'} 
          top-1/2 transform -translate-y-1/2`}
            onClick={() => searchTerm.length > 0 && onSearchChange(searchTerm)}
          />
          <Input
            placeholder="Buscar por cargo, tecnologia, área..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchChange(searchTerm)}
            className={`h-12 text-lg transition-all duration-300 ${searchTerm.length > 0 ? 'pr-10 pl-4' : 'pl-10'
              }`}
          />
        </div>
        {searchTerm.length > 0 && (
          <div className="text-sm text-gray-400 mt-2 animate-pulse">
            Buscando resultados...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="employmentType">Tipo de Contrato</Label>
            <Select
              value={employmentType || ""}
              onValueChange={(value) => onEmploymentTypeChange && onEmploymentTypeChange(value || undefined)}
            >
              <SelectTrigger id="employmentType">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
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
              value={experienceLevel || ""}
              onValueChange={(value) => onExperienceLevelChange && onExperienceLevelChange(value === "all" ? undefined : value)}
            >
              <SelectTrigger id="experienceLevel">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="junior">Júnior</SelectItem>
                <SelectItem value="mid">Pleno</SelectItem>
                <SelectItem value="senior">Sênior</SelectItem>
                <SelectItem value="lead">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="isPCDExclusive"
              checked={isPCDExclusive || false}
              onCheckedChange={(checked) => onIsPCDExclusiveChange && onIsPCDExclusiveChange(checked || undefined)}
            />
            <Label htmlFor="isPCDExclusive">Vagas Exclusivas para PCD</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}