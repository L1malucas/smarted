"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { ShareDialog } from "@/components/share-dialog";
import type { Job, JobStatus } from "@/types/jobs-interface";
import { jobStatusOptions } from "@/lib/jobs-constants";

interface JobActionsMenuProps {
  job: Job;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export function JobActionsMenu({ job, tenantSlug, onStatusChange, onPublish }: JobActionsMenuProps) {
  const { toast } = useToast();

  const handleStatusChange = (newStatus: JobStatus) => {
    onStatusChange(job._id, newStatus);
    toast({
      title: "Status Atualizado",
      description: `O status da vaga foi alterado para "${newStatus}".`,
    });
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(job._id);
      toast({
        title: "Vaga Publicada",
        description: "A vaga foi publicada com sucesso.",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Alterar Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {jobStatusOptions
                    .filter((opt) => opt.value !== "all")
                    .map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value as JobStatus)}
                        disabled={opt.value === job.status}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${tenantSlug}/jobs/${job.slug}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Vaga
                </Link>
              </DropdownMenuItem>
              {job.status === "draft" && (
                <DropdownMenuItem
                  onClick={handlePublish}
                  className="flex items-center"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publicar Vaga
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <ShareDialog
                title={`Compartilhar Vaga: ${job.title}`}
                resourceType="job"
                resourceId={job._id}
                resourceName={job.title}
                tenantSlug={tenantSlug}
                jobSlug={job.slug}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Vaga
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>Mais opções</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
