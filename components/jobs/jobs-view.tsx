"use client";

import { useState, useEffect } from "react";
import type { Job, JobStatus } from "@/types/jobs-interface";
import { JobCard } from "./job-card";
import { JobListItem } from "./job-list-item";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";

interface JobViewProps {
  jobs: Job[];
  tenantSlug: string;
  viewMode: "card" | "list";
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onPublish?: (jobId: string) => void;
}

export function JobView({
  jobs,
  tenantSlug,
  viewMode: initialViewMode,
  onStatusChange,
  onPublish
}: JobViewProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">(initialViewMode);

  // Persist view mode in localStorage
  useEffect(() => {
    const storedViewMode = localStorage.getItem("jobListViewMode");
    if (storedViewMode === "card" || storedViewMode === "list") {
      setViewMode(storedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jobListViewMode", viewMode);
  }, [viewMode]);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 col-span-full">
        <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros atuais.</p>
      </div>
    );
  }

  if (viewMode === "card") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            tenantSlug={tenantSlug}
            onStatusChange={onStatusChange}
            onPublish={onPublish}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (<>
        <JobListItem
          key={job._id}
          job={job}
          tenantSlug={tenantSlug}
          onStatusChange={onStatusChange}
          onPublish={onPublish}
        />
        <DropdownMenuSeparator />
      </>
      ))}
    </div>
  );
}