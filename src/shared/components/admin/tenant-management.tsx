"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { createTenant } from "@/infrastructure/actions/tenant-actions";
import { toast } from "@/shared/hooks/use-toast";

export default function TenantManagement() {
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [brazilianState, setBrazilianState] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createTenant({
        name: tenantName,
        slug: tenantSlug,
        cnpj,
        email,
        officialWebsite,
        brazilianState,
        responsibleName,
      });

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Tenant '${tenantName}' criado com sucesso.`,
          variant: "default",
        });
        setTenantName("");
        setTenantSlug("");
        setCnpj("");
        setEmail("");
        setOfficialWebsite("");
        setBrazilianState("");
        setResponsibleName("");
      } else {
        toast({
          title: "Erro ao criar Tenant",
          description: result.error || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Tenants</CardTitle>
        <CardDescription>Crie e gerencie tenants para sua aplicação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Nome do Tenant</Label>
            <Input
              id="tenantName"
              type="text"
              placeholder="Nome da Empresa"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Slug do Tenant</Label>
            <Input
              id="tenantSlug"
              type="text"
              placeholder="nome-da-empresa" 
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/^-*|-*$/g, ''))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="officialWebsite">Site Oficial</Label>
            <Input
              id="officialWebsite"
              type="url"
              placeholder="https://www.empresa.com"
              value={officialWebsite}
              onChange={(e) => setOfficialWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brazilianState">Estado (UF)</Label>
            <Input
              id="brazilianState"
              type="text"
              placeholder="SP"
              value={brazilianState}
              onChange={(e) => setBrazilianState(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibleName">Nome do Responsável</Label>
            <Input
              id="responsibleName"
              type="text"
              placeholder="Nome Completo do Responsável"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar Novo Tenant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}