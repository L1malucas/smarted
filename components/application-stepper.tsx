"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description: string
  component: React.ReactNode
  isOptional?: boolean
}

interface ApplicationStepperProps {
  steps: Step[]
  onComplete: () => void
  onStepChange?: (stepIndex: number) => void
  className?: string
}

export function ApplicationStepper({ steps, onComplete, onStepChange, className }: ApplicationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const progress = ((currentStep + 1) / steps.length) * 100

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      goToStep(currentStep + 1)
    } else {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex)
  const isCurrentStep = (stepIndex: number) => stepIndex === currentStep
  const isStepAccessible = (stepIndex: number) => stepIndex <= currentStep || isStepCompleted(stepIndex)

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
              disabled={!isStepAccessible(index)}
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
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={nextStep} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          {currentStep === steps.length - 1 ? "Enviar Candidatura" : "Próximo"}
          {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
