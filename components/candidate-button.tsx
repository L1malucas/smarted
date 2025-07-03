"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

/**
 * Componente que renderiza um botão para acesso de candidatos às vagas disponíveis.
 * 
 * @component
 * @example
 * ```tsx
 * <CandidateButton />
 * ```
 * 
 * @remarks
 * Este componente utiliza o padrão de Dialog (modal) para coletar o código/slug da empresa.
 * Após submissão do formulário, redireciona o usuário para a página de vagas da empresa específica.
 * 
 * @state
 * - tenantSlug: string - Armazena o código/slug da empresa inserido pelo usuário
 * - isOpen: boolean - Controla a visibilidade do modal de acesso
 * 
 * @dependencies
 * - next/router - Para navegação programática entre páginas
 * - Componentes UI: Dialog, Button, Label, Input - Importados da biblioteca de UI
 * 
 * @flow
 * 1. Usuário clica no botão "Sou Candidato"
 * 2. Modal se abre para inserção do código da empresa
 * 3. Após submissão, redireciona para /{tenantSlug}/jobs
 * 
 * @modification
 * Para modificar o comportamento:
 * - Altere o handleSubmit para adicionar validações ou lógica adicional
 * - Modifique o padrão de URL em router.push para alterar o redirecionamento
 * - Ajuste os textos e labels conforme necessidade
 */
export function CandidateButton() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/public")
    console.log(`Redirecionando para a página /public/job"`);
  }

  return (
    <Button variant="outline" className="w-full mt-2" onClick={handleSubmit}>
      Sou Candidato
    </Button>
  )
}
