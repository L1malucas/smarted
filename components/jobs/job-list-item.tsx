"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Users, Calendar, Edit, Trash2, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { getStatusBadge } from "@/utils/job-status-config";
import { JobActionsMenu } from "./menu-list";

interface JobListItemProps {
  job: Job;
  tenantSlug: string;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export function JobListItem({ job, tenantSlug, onStatusChange, onPublish }: JobListItemProps) {
  const { toast } = useToast();

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    onStatusChange(jobId, newStatus);
    toast({
      title: "Status Atualizado",
      description: `O status da vaga foi alterado para "${newStatus}".`,
    });
  };

  const handlePublish = (jobId: string) => {
    if (onPublish) {
      onPublish(jobId);
      toast({
        title: "Vaga Publicada",
        description: "A vaga foi publicada com sucesso.",
      });
    }
  };

  return (
    <Link
      href={`/${tenantSlug}/jobs/${job.slug}/details`}
      className="font-semibold text-lg hover:text-blue-600 transition-colors duration-200 cursor-pointer truncate"
    >
      <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {job.title}
                {getStatusBadge(job.status)}
                <JobActionsMenu
                  job={job}
                  tenantSlug={tenantSlug}
                  onStatusChange={onStatusChange}
                  onPublish={onPublish}
                />
              </div>
              <CardDescription className="line-clamp-2 text-sm">
                {job.description}
              </CardDescription>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{job.candidatesCount} candidatos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>Criada em: {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                {job.createdByName && (
                  <div className="opacity-75">Por: {job.createdByName}</div>
                )}
                {job.lastStatusUpdateByName && (
                  <div className="opacity-75">Última alteração por: {job.lastStatusUpdateByName}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>

  );
}