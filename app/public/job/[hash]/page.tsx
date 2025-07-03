"use client";

import { useParams } from "next/navigation";

export default function PublicJobByHashPage() {
  const params = useParams();
  const hash = params.hash as string;

  return (
    <div className="space-y-8 text-center">
      <h1 className="text-3xl font-bold">Detalhes da Vaga (Compartilhada)</h1>
      <p className="text-lg">Hash da Vaga: {hash}</p>
      <p className="text-muted-foreground">Esta página exibirá os detalhes de uma vaga específica compartilhada via hash.</p>
      <p className="text-muted-foreground">A implementação de verificação de senha e carregamento de dados da vaga será feita aqui.</p>
    </div>
  );
}