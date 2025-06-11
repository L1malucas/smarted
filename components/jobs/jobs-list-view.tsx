import { JobStatus, Job } from "@/types/jobs-interface";
import { JobCard } from '@/components/job-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobStatusOptions } from "@/lib/jobs-constants";

interface JobListProps {
  jobs: Job[];
  tenantSlug: string;
  viewMode: 'card' | 'list';
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export function JobList({ jobs, tenantSlug, viewMode, onStatusChange }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 col-span-full">
        <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros atuais.</p>
      </div>
    );
  }

  if (viewMode === 'card') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} tenantSlug={tenantSlug} onStatusChange={onStatusChange} />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Vagas</CardTitle>
        <CardDescription>Visualização em lista de todas as vagas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job._id} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <Link href={`/${tenantSlug}/jobs/${job.slug}/details`} className="font-medium hover:text-blue-500">
                  {job.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {job.candidatesCount} candidatos • Criada em{" "}
                    {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={job.status}
                  onValueChange={(newStatus) => onStatusChange(job._id, newStatus as JobStatus)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStatusOptions.filter(opt => opt.value !== "all").map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} disabled={opt.value === job.status}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${tenantSlug}/jobs/${job.slug}/details`}>Ver Detalhes</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}