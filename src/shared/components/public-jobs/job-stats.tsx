import { IJobStatsProps } from "@/shared/types/types/component-props";
import { Card, CardContent } from "../ui/card";

export function JobStats({ stats }: IJobStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Total de Vagas</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.totalJobs}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Vagas por Modelo</div>
          <div className="flex justify-around">
            {Object.entries(stats.models).map(([model, count]) => (
              <div key={model} className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{model.charAt(0).toUpperCase() + model.slice(1)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Vagas Exclusivas</div>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.pcdJobs}</div>
              <div className="text-sm text-gray-600">PCD</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}