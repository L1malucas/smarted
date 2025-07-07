import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, HelpCircle, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "postcss";
import { useState } from "react";
import { Tooltip, Label } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { IJobQuestion } from "@/domain/models/JobQuestion";
import { IQuestionSectionProps } from "@/shared/types/types/component-props";

export function QuestionSection({ questions, onChange, error }: IQuestionSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleQuestionChange = (index: number, field: keyof IJobQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "type" && !["multiple_choice", "single_choice"].includes(value)) {
      delete updated[index].options;
    } else if (field === "type" && ["multiple_choice", "single_choice"].includes(value) && !updated[index].options) {
      updated[index].options = [""];
    }
    onChange(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options![oIndex] = value;
      onChange(updated);
    }
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options!.push("");
      onChange(updated);
    }
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options && updated[qIndex].options!.length > 2) {
      updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== oIndex);
      onChange(updated);
    }
  };

  const addQuestion = () => {
    onChange([...questions, { id: crypto.randomUUID(), question: "", type: "text", required: false, order: questions.length }]);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center">
          Perguntas para Candidatos
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Crie perguntas para os candidatos. Serão puladas se a vaga for por indicação.</p>
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
          {questions.map((q, qIndex) => (
            <div key={q.id} className="p-3 border rounded-md space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-grow">
                  <Label htmlFor={`q-question-${qIndex}`}>Texto da Pergunta</Label>
                  <Textarea
                    id={`q-question-${qIndex}`}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                    placeholder="Ex: Descreva sua experiência com..."
                  />
                </div>
                <div className="w-40">
                  <Label htmlFor={`q-type-${qIndex}`}>Tipo</Label>
                  <Select
                    value={q.type}
                    onValueChange={(val) => handleQuestionChange(qIndex, "type", val)}
                  >
                    <SelectTrigger id={`q-type-${qIndex}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="single_choice">Escolha Única</SelectItem>
                      <SelectItem value="file_upload">Upload de Arquivo</SelectItem>
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
              {["multiple_choice", "single_choice"].includes(q.type) && (
                <div className="space-y-2 pl-4">
                  <Label>Opções de Resposta:</Label>
                  {q.options?.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Opção ${oIndex + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(qIndex, oIndex)}
                        disabled={(q.options?.length || 0) <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                    Adicionar Opção
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`q-required-${qIndex}`}
                  checked={q.required}
                  onCheckedChange={(checked) => handleQuestionChange(qIndex, "required", checked)}
                />
                <Label htmlFor={`q-required-${qIndex}`}>Pergunta Obrigatória</Label>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Pergunta
          </Button>
        </CardContent>
      )}
    </Card>
  );
}