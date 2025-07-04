import { Card, CardContent } from "../ui/card";

interface JobStatsProps {
  stats: {
    totalJobs: number;
    totalCandidates: number;
    pcdJobs: number;
    models: Record<string, number>;
  };
}

export function JobStats({ stats }: JobStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Modelo</div>
          <div className="flex justify-around">
            {Object.entries(stats.models).map(([model, count]) => (
              <button key={model} className="text-center hover:opacity-75">
                <div className="text-2xl font-bold text-green-600 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{model}</div>
              </button>
            ))}
          </div >
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Exclusiva</div>
          <div className="flex justify-around">
            <button className="text-center hover:opacity-75">
              <div className="text-2xl font-bold text-green-600 mb-1">1</div>
              <div className="text-sm text-gray-600">PCD</div>
            </button>
            <button className="text-center hover:opacity-75">
              <div className="text-2xl font-bold text-green-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Mulheres</div>
            </button>
          </div >
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600 text-center mb-4">Modelo</div>
          <div className="flex justify-around">
            {Object.entries(stats.models).map(([model, count]) => (
              <button key={model} className="text-center hover:opacity-75">
                <div className="text-2xl font-bold text-green-600 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{model}</div>
              </button>
            ))}
          </div >
        </CardContent>
      </Card>
    </div>
  );
}