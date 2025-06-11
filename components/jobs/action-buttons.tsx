import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { JobStatus } from "@/types/jobs-interface";

interface ActionButtonsProps {
  onSubmit: (status: JobStatus) => void;
  disabled: boolean;
}

export function ActionButtons({ onSubmit, disabled }: ActionButtonsProps) {
  return (
    <div className="space-y-2">
      <Button
        onClick={() => onSubmit("aberta")}
        className="w-full"
        disabled={disabled}
      >
        Publicar Vaga
      </Button>
      <Button
        onClick={() => onSubmit("draft")}
        variant="outline"
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        Salvar como Rascunho
      </Button>
    </div>
  );
}