import Link from "next/link";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { IJobListHeaderProps } from "@/shared/types/types/component-props";

export function JobListHeader({ tenantSlug }: IJobListHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Vagas</h1>
        <p className="text-muted-foreground">Crie, edite e gerencie o status das suas vagas</p>
      </div>
      <Link href={`/${tenantSlug}/jobs/create`}>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </Link>
    </div>
  );
}