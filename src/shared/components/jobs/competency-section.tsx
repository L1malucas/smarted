import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, HelpCircle, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useState } from "react";
import { Label } from "@/shared/components/ui/label";
import { ICompetency } from "@/domain/models/Competency";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip } from "../ui/tooltip";

interface CompetencySectionProps {
  competencies: ICompetency[];
  onChange: (competencies: ICompetency[]) => void;
  error?: string;
}

export function CompetencySection({ competencies, onChange, error }: CompetencySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const handleCompetencyChange = <K extends keyof ICompetency>(index: number, field: K, value: ICompetency[K]) => {
    const updated = [...competencies];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addCompetency = () => {
    const newCompetency: ICompetency = {
      id: crypto.randomUUID(),
      name: "",
      weight: 3,
    };
    onChange([...competencies, newCompetency]);
  };

  const removeCompetency = (index: number) => {
    if (competencies.length <= 3) {
      return;
    }
    onChange(competencies.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center">
          Competências da Vaga
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
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          {competencies.map((comp, index) => (
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
                      {[1, 2, 3, 4, 5].map(w => (
                        <SelectItem key={w} value={String(w)}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCompetency(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={competencies.length <= 3}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addCompetency}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Competência
          </Button>
        </CardContent>
      )}
    </Card>
  );
}