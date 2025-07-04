"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { JobActionsMenu } from "./menu-list";
import { getStatusBadge } from "@/shared/lib/job-status-config";
import { JobCardProps } from "@/shared/types/types/component-props";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";


export function JobCard({ job, tenantSlug, onStatusChange, onPublish }: JobCardProps) {
  return (
    <Link
      href={`/${tenantSlug}/jobs/${job.slug}/details`}
      className="hover:text-blue-600 transition-colors duration-200 cursor-pointer block truncate"
    >
      <Card className="flex flex-col hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2">
                {job.title}
              </CardTitle>
              {getStatusBadge(job.status)}
            </div>
            <JobActionsMenu
              job={job}
              tenantSlug={tenantSlug}
              onStatusChange={onStatusChange}
              onPublish={onPublish}
            />
          </div>
          <CardDescription className="line-clamp-2 pt-2 text-sm">
            {job.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{job.candidatesCount} candidatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>Criada em: {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            {job.createdByName && (
              <div className="text-xs opacity-75">
                Por: {job.createdByName}
              </div>
            )}
            {job.lastStatusUpdateByName && (
              <div className="text-xs opacity-75">
                Última alteração por: {job.lastStatusUpdateByName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}