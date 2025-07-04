import { Badge } from "lucide-react";
import { JobStatus } from "../types/types/jobs-interface";

export const statusConfig = {
  aberta: { variant: "default", label: "Aberta", className: "bg-sky-500 hover:bg-sky-600" },
  recrutamento: { variant: "default", label: "Recrutamento", className: "bg-blue-500 hover:bg-blue-600" },
  triagem: { variant: "default", label: "Triagem", className: "bg-indigo-500 hover:bg-indigo-600" },
  avaliação: { variant: "default", label: " Avaliação", className: "bg-purple-500 hover:bg-purple-600" },
  contato: { variant: "default", label: "Contato", className: "bg-pink-500 hover:bg-pink-600" },
  "vaga fechada": { variant: "destructive", label: "Fechada", className: "bg-slate-700 hover:bg-slate-800" },
  draft: { variant: "secondary", label: "Rascunho", className: "bg-gray-500 hover:bg-gray-600" },
} as const;

export const getStatusBadge = (status: JobStatus) => {
  const config = statusConfig[status] || { variant: "outline", label: status, className: "" };
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  );
};
