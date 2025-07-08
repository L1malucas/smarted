"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IUser } from "@/domain/models/User"; 
import { toast } from "@/shared/components/ui/use-toast";
import { getCandidateDetailsAction } from "@/infrastructure/actions/candidate-actions";

export default function CandidateDetailsPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const result = await getCandidateDetailsAction(candidateId);
          if (result.success && result.data) {
            setCandidate(result.data);
          } else {
            toast({
              title: "Erro",
              description: result.error || "Candidato não encontrado.",
              variant: "destructive",
            });
            setCandidate(null);
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar candidato",
            description: "Não foi possível carregar os detalhes do candidato.",
            variant: "destructive",
          });
          setCandidate(null);
        } finally {
          setIsLoading(false);
        }
      });
    };
    fetchData();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!candidate) {
    return <div className="text-center py-12">Candidato não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${tenantSlug}/jobs`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Candidato: {candidate.name}</h1>
          <p className="text-muted-foreground">Informações detalhadas sobre o candidato.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="break-words"><Label>Nome:</Label> {candidate.name}</p>
          <p className="break-words"><Label>Email:</Label> {candidate.email}</p>
          <p className="break-words"><Label>CPF:</Label> {candidate.cpf}</p>
          <p className="break-words"><Label>Status:</Label> {candidate.status === 'active' ? 'Ativo' : 'Inativo'}</p>
          <p className="break-words"><Label>Cargos:</Label> {candidate.roles.join(", ")}</p>
          <p className="break-words"><Label>Criado em:</Label> {new Date(candidate.createdAt).toLocaleDateString()}</p>
          <p className="break-words"><Label>Última Atualização:</Label> {new Date(candidate.updatedAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      {/* Add more sections for candidate details like analysis, history, etc. */}
    </div>
  );
}
