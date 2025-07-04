"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "@/shared/components/ui/use-toast";

export function CandidateButton() {
  const router = useRouter()
  const [tenantSlug, setTenantSlug] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código da empresa.",
        variant: "destructive",
      });
      return;
    }
    router.push(`/${tenantSlug}/jobs`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          Sou Candidato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Acessar Vagas da Empresa</DialogTitle>
          <DialogDescription>
            Insira o código da empresa para visualizar as vagas disponíveis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tenantCode" className="text-right">
              Código da Empresa
            </Label>
            <Input
              id="tenantCode"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              className="col-span-3"
              placeholder="Ex: smarted-tech"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Acessar Vagas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
