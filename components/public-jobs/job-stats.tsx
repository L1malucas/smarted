import { Card, CardContent } from "@/components/ui/card";

interface JobStatsProps {
  stats: {
    totalJobs: number;
    totalCandidates: number;
    pcdJobs: number;
  };
}

export function JobStats({ stats }: JobStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalJobs}</div>
          <div className="text-gray-600">Vagas Abertas</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalCandidates}</div>
          <div className="text-gray-600">Candidatos</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.pcdJobs}</div>
          <div className="text-gray-600">Vagas PCD</div>
        </CardContent>
      </Card>
    </div>
  );
}