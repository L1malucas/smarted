"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { MoreHorizontal, Edit, Trash2, Send } from "lucide-react";
import { IJobStatus } from "@/domain/models/JobStatus";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ShareDialog } from "../share-dialog";
import { toast } from "@/shared/hooks/use-toast";
import { IJobActionsMenuProps } from "@/shared/types/types/component-props";
import { JOB_STATUS_OPTIONS } from "@/shared/constants/jobs-constants";

export function JobActionsMenu({ job, tenantSlug, onStatusChange, onPublish }: IJobActionsMenuProps) {
  const handleStatusChange = (newStatus: IJobStatus) => {
    onStatusChange(job._id!, newStatus);
    toast({
      title: "Status Atualizado",
      description: `O status da vaga foi alterado para "${newStatus}".`,
    });
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(job._id!);
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
                  {JOB_STATUS_OPTIONS
                    .filter((opt) => opt.value !== "all")
                    .map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value as IJobStatus)}
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
                resourceId={job._id!}
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
