"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getPublicJobDetailsAction } from "@/infrastructure/actions/public-actions";
import Link from "next/link";
import { Job } from "@/shared/types/types/jobs-interface";

export default function PublicJobByHashPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchJobDetails = async (pw?: string) => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await getPublicJobDetailsAction(hash, pw);
        if (result.success && result.job) {
          setJob(result.job);
          setError(null);
          setShowPasswordInput(false);
        } else {
          setError(result.error || "Não foi possível carregar os detalhes da vaga.");
          if (result.error === "Senha incorreta.") {
            setShowPasswordInput(true);
          } else {
            setShowPasswordInput(false);
          }
          setJob(null);
        }
      } catch (err) {
        setError("Ocorreu um erro inesperado ao carregar a vaga.");
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchJobDetails();
  }, [hash]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobDetails(password);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-center">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Erro ao carregar vaga</CardTitle>
          <CardDescription>Não foi possível acessar este recurso.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          {showPasswordInput && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha da Vaga</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Verificando..." : "Acessar com Senha"}
              </Button>
            </form>
          )}
          {!showPasswordInput && (
            <Link href="/public">
              <Button variant="outline">Voltar para Vagas Públicas</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return <div className="text-center py-12">Vaga não encontrada.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Detalhes da Vaga: {job.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Vaga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><Label>Descrição:</Label> {job.description}</p>
          <p><Label>Departamento:</Label> {job.department}</p>
          <p><Label>Localização:</Label> {job.location}</p>
          <p><Label>Status:</Label> {job.status}</p>
          <p><Label>Salário:</Label> {job.salaryRange.min} - {job.salaryRange.max} {job.salaryRange.currency}</p>
          <p><Label>Criada em:</Label> {new Date(job.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>
      {/* Add more job details as needed */}
    </div>
  );
}
