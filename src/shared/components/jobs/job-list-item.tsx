"use client";

import Link from "next/link";
import { JobActionsMenu } from "./menu-list";
import { getStatusBadge } from "@/shared/lib/job-status-config";
import { IJobStatus } from "@/domain/models/JobStatus";
import { Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { IJobListItemProps } from "@/shared/types/types/component-props";


export function JobListItem({ job, tenantSlug, onStatusChange, onPublish }: IJobListItemProps) {
  const { toast } = useToast();

  const handleStatusChange = (jobId: string, newStatus: IJobStatus) => {
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
      href={`/${tenantSlug}/jobs/${job._id}/details`}
      className="font-semibold text-lg hover:text-blue-600 transition-colors duration-200 cursor-pointer"
    >
      <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap line-clamp-2 whitespace-normal">
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