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

export function CandidateButton() {
  const [tenantSlug, setTenantSlug] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantSlug) {
      router.push(`/${tenantSlug}/jobs`)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          Sou Candidato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acesso para Candidatos</DialogTitle>
          <DialogDescription>Informe o código da empresa para acessar as vagas disponíveis.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-slug">Código da Empresa</Label>
              <Input
                id="tenant-slug"
                placeholder="Ex: empresa-abc"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Acessar Vagas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
