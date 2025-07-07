"use client";

import { useState } from "react";
import { JobList } from "@/shared/components/public-jobs/job-list";
import { JobSearch } from "@/shared/components/public-jobs/job-search";
import { JobStats } from "@/shared/components/public-jobs/job-stats";
import { PageHeader } from "@/shared/components/public-jobs/page-header";
import { usePublicJobs } from "@/shared/hooks/use-public-jobs";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/shared/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export default function PublicJobsPage() {
  const [employmentType, setEmploymentType] = useState<string | undefined>(undefined);
  const [experienceLevel, setExperienceLevel] = useState<string | undefined>(undefined);
  const [isPCDExclusive, setIsPCDExclusive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(10);

  const { jobs, searchTerm, setSearchTerm, loading, stats, totalJobs } = usePublicJobs(
    undefined,
    employmentType,
    experienceLevel,
    isPCDExclusive,
    currentPage,
    jobsPerPage
  );

  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleJobsPerPageChange = (value: string) => {
    setJobsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Oportunidades de Carreira"
        description="Explore todas as vagas disponíveis e encontre a oportunidade perfeita para você"
      />
      <JobSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        employmentType={employmentType}
        onEmploymentTypeChange={setEmploymentType}
        experienceLevel={experienceLevel}
        onExperienceLevelChange={setExperienceLevel}
        isPCDExclusive={isPCDExclusive}
        onIsPCDExclusiveChange={setIsPCDExclusive}
      />
      <JobStats stats={stats} />
      <JobList jobs={jobs} loading={loading} />

      {totalJobs > 0 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-muted-foreground">
            Mostrando {jobs.length} de {totalJobs} vagas
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePageChange(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vagas por página:</span>
            <Select value={String(jobsPerPage)} onValueChange={handleJobsPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}