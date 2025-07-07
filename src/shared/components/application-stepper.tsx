"use client"


import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { toast, } from "@/shared/components/ui/use-toast"
import { IApplicationStepperProps } from "../types/types/component-props"

/**
 * Componente de navegação em etapas para processos de candidatura/aplicação
 * 
 * @component ApplicationStepper
 * 
 * @param props - Propriedades do componente
 * @param props.steps - Array de objetos contendo as informações de cada etapa
 * @param props.steps[].id - Identificador único da etapa
 * @param props.steps[].title - Título da etapa
 * @param props.steps[].description - Descrição detalhada da etapa
 * @param props.steps[].component - Componente React a ser renderizado no conteúdo da etapa
 * @param props.steps[].isOptional - Flag que indica se a etapa é opcional
 * @param props.onComplete - Callback executado quando todas as etapas são completadas
 * @param props.onStepChange - Callback opcional executado quando há mudança de etapa
 * @param props.onValidateStep - Callback opcional executado para validar a etapa atual antes de avançar. Deve retornar true para sucesso, false para falha.
 * @param props.className - Classes CSS adicionais para estilização
 * 
 * @remarks
 * O componente mantém estado interno para:
 * - currentStep: índice da etapa atual
 * - completedSteps: Set com índices das etapas já completadas
 * - isSubmitting: Flag que indica se o formulário está em processo de submissão ou avanço de etapa.
 * 
 * @example
 * ```tsx
 * <ApplicationStepper
 *   steps={[
 *     { 
 *       id: '1', 
 *       title: 'Dados Pessoais',
 *       description: 'Informações básicas',
 *       component: <DadosPessoaisForm />
 *     },
 *     // ... mais etapas
 *   ]}
 *   onComplete={() => handleSubmitApplication()}
 *   onValidateStep={async (stepIndex) => {
 *     // Lógica de validação para a etapa específica
 *     // Ex: return await validateDadosPessoais();
 *     return true; // ou false
 *   }}
 * />
 * ```
 * 
 * @features
 * - Barra de progresso indicando porcentagem concluída
 * - Navegação visual entre etapas com indicadores de status
 * - Etapas conectadas por linhas de progresso
 * - Títulos e descrições para cada etapa
 * - Card com conteúdo da etapa atual
 * - Botões de navegação (anterior/próximo) com indicadores de carregamento.
 * - Suporte a etapas opcionais
 * - Controle de acessibilidade das etapas
 * 
 * @customization
 * O componente pode ser personalizado através de:
 * - className para estilização do container
 * - Tailwind classes para modificação visual
 * - Componentes shadcn/ui para estilização consistente
 * - Ícones do lucide-react
 * 
 * @accessibility
 * - Botões de navegação com `aria-current="step"` para a etapa atual.
 * - Indicadores de carregamento para feedback visual e para desabilitar interações.
 * 
 * @note
 * A persistência do progresso do usuário (ex: em localStorage) deve ser gerenciada pelo componente pai que utiliza o ApplicationStepper, 
 * pois ele detém o estado completo do formulário de aplicação.
 */
export function ApplicationStepper({ steps, onComplete, onStepChange, onValidateStep, className }: IApplicationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  const nextStep = async () => {
    setIsSubmitting(true);
    try {
      if (onValidateStep) {
        const isValid = await Promise.resolve(onValidateStep(currentStep));
        if (!isValid) {
          toast({
            title: "Erro de Validação",
            description: "Por favor, preencha todos os campos obrigatórios da etapa atual.",
            variant: "destructive",
          });
          return; // Stop if validation fails
        }
      }

      if (currentStep < steps.length - 1) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        goToStep(currentStep + 1);
      } else {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        onComplete();
        toast({
          title: "Candidatura Enviada!",
          description: "Sua candidatura foi enviada com sucesso. Boa sorte!",
          variant: "default",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex);
  const isCurrentStep = (stepIndex: number) => stepIndex === currentStep;
  const isStepAccessible = (stepIndex: number) => stepIndex <= currentStep || isStepCompleted(stepIndex);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progresso da Candidatura</span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isStepAccessible(index) && goToStep(index)}
              disabled={!isStepAccessible(index) || isSubmitting}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                isCurrentStep(index) && "border-blue-600 bg-blue-600 text-white",
                isStepCompleted(index) && !isCurrentStep(index) && "border-green-600 bg-green-600 text-white",
                !isCurrentStep(index) &&
                !isStepCompleted(index) &&
                isStepAccessible(index) &&
                "border-gray-300 hover:border-blue-400",
                !isStepAccessible(index) && "border-gray-200 text-gray-400 cursor-not-allowed",
              )}
              aria-current={isCurrentStep(index) ? "step" : undefined}
            >
              {isStepCompleted(index) ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </button>
            {index < steps.length - 1 && (
              <div className={cn("w-12 h-0.5 mx-2", isStepCompleted(index) ? "bg-green-600" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Titles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center">
            <h3
              className={cn(
                "font-medium text-sm",
                isCurrentStep(index) && "text-blue-600",
                isStepCompleted(index) && "text-green-600",
                !isCurrentStep(index) && !isStepCompleted(index) && "text-gray-500",
              )}
            >
              {step.title}
              {step.isOptional && <span className="text-xs text-gray-400 ml-1">(opcional)</span>}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
              {currentStep + 1}
            </span>
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>{steps[currentStep].component}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={nextStep} disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            currentStep === steps.length - 1 ? "Enviar Candidatura" : "Próximo"
          )}
          {!isSubmitting && currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
