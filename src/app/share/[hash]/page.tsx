"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getShareableLinkDetailsAction } from "@/infrastructure/actions/share-actions";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { toast } from "@/shared/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { IJob } from "@/domain/models/Job";
import { ICandidate } from "@/domain/models/Candidate";

export default function SharePage() {
  const params = useParams();
  const hash = params.hash as string;

  const [linkDetails, setLinkDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const fetchLinkDetails = async (pw?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getShareableLinkDetailsAction(hash, pw);
      if (result.success && result.data) {
        setLinkDetails(result.data);
        setShowPasswordInput(false);
      } else {
        if (result.error === "Este link requer uma senha.") {
          setShowPasswordInput(true);
        } else {
          setError(result.error || "Erro ao carregar o link.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hash) {
      fetchLinkDetails();
    }
  }, [hash]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLinkDetails(password);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-700">Carregando link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Erro</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (showPasswordInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Link Protegido</h1>
          <p className="text-center text-gray-600 mb-6">Por favor, insira a senha para acessar este link.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Acessar"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (!linkDetails || !linkDetails.link || !linkDetails.resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Erro</h1>
        <p>Detalhes do link ou recurso não disponíveis.</p>
      </div>
    );
  }

  const { link, resource } = linkDetails;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Recurso Compartilhado: {link.resourceName}</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Detalhes do Link</h2>
          <p><strong>Tipo de Recurso:</strong> {link.resourceType}</p>
          <p><strong>Criado por:</strong> {link.createdByUserName}</p>
          <p><strong>Criado em:</strong> {new Date(link.createdAt).toLocaleDateString()}</p>
          {link.expiresAt && (
            <p><strong>Expira em:</strong> {new Date(link.expiresAt).toLocaleDateString()}</p>
          )}
          {link.maxViews && link.maxViews > 0 && (
            <p><strong>Visualizações:</strong> {link.viewsCount} / {link.maxViews}</p>
          )}
          {link.passwordHash && <p><strong>Protegido por Senha:</strong> Sim</p>}
          <p><strong>Status:</strong> {link.isActive ? "Ativo" : "Inativo"}</p>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Conteúdo do Recurso</h2>
          {/* Render content based on resourceType */}
          {link.resourceType === "job" && (
            <div>
              <h3 className="text-2xl font-bold mb-2">Vaga: {resource.title}</h3>
              <p className="text-gray-700 whitespace-pre-line">{resource.description}</p>
              {/* Add more job details as needed */}
            </div>
          )}
          {link.resourceType === "candidate_report" && (
            <div>
              <h3 className="text-2xl font-bold mb-2">Relatório do Candidato: {resource.name}</h3>
              <p className="text-gray-700">Email: {resource.email}</p>
              {/* Add more candidate details as needed */}
            </div>
          )}
          {link.resourceType === "dashboard" && (
            <div>
              <h3 className="text-2xl font-bold mb-2">Dashboard</h3>
              <p className="text-gray-700">{resource.message}</p>
              {/* Integrate actual dashboard component here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
