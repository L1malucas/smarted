import { IJob } from "@/domain/models/Job";
import { Button } from "../ui/button";
import { Briefcase, Calendar, Users, MapPin, Clock, Building, Badge } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { IJobListProps } from "@/shared/types/types/component-props";

export function JobList({ jobs, loading, tenantSlug }: IJobListProps) {
  const router = useRouter();
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Briefcase className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
        <p className="text-gray-600">Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <Card key={job._id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl text-gray-900 hover:text-blue-600 transition-colors">
                  <Button variant="outline" asChild onClick={() => router.push(`/public/${tenantSlug ? `${tenantSlug}/` : ''}jobs/${job.slug}`)}>
                    {job.title}
                  </Button>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {job.department && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.employmentType && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.employmentType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {job.isPCDExclusive && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Exclusiva PCD</Badge>
                )}
                <div className="text-sm text-gray-500">
                  Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 line-clamp-3 leading-relaxed">{job.description}</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Principais competências:</h4>
              <div className="flex flex-wrap gap-2">
                {job.competencies.slice(0, 5).map((comp) => (
                  <Badge key={comp.id} variant="secondary">
                    {comp.name} (Peso: {comp.weight})
                  </Badge>
                ))}
                {job.competencies.length > 5 && (
                  <Badge variant="outline">+{job.competencies.length - 5} mais</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{job.candidatesCount} candidatos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Vaga ativa</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild onClick={() => router.push(`/public/${tenantSlug ? `${tenantSlug}/` : ''}jobs/${job.slug}`)}>
                  Ver Detalhes
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push(`${tenantSlug}/apply/${job.slug}/`)}>
                  Candidatar-se
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
