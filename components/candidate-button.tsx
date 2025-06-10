"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  const [tenantSlug, setTenantSlug] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantSlug) {
      router.push(`/${tenantSlug}/jobs/public`)
      setIsOpen(false)
    }
  }

  // Add this at the top of the component
  const [tenants] = useState([
    { id: 1, name: "Renova Soluções em Tecnologia", slug: "smarted-tenant" },
    { id: 2, name: "Opal Bytes", slug: "smarted-tenant" },
    { id: 3, name: "SmartEd Soluções Tecnológicas", slug: "smarted-tenant" },
    { id: 4, name: "Empresa XYZ", slug: "smarted-tenant" },
    { id: 5, name: "Empresa XYZ", slug: "smarted-tenant" },
    // Add more tenants as needed
  ])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          Sou Candidato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecione uma Empresa</DialogTitle>
          <DialogDescription>Escolha a empresa para visualizar as vagas disponíveis.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {tenants.map((tenant) => (
            <Button
              key={tenant.id}
              variant="outline"
              className="w-full justify-start"
              onClick={(e) => {
                setTenantSlug(tenant.slug)
                handleSubmit(e as React.FormEvent)
              }}
            >
              {tenant.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
