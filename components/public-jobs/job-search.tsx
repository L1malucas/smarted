import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface JobSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function JobSearch({ searchTerm, onSearchChange }: JobSearchProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por cargo, tecnologia, área..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}