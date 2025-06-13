import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface JobSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function JobSearch({ searchTerm, onSearchChange }: JobSearchProps) {
  return (
    <Card className="border-none">
      <CardContent className="p-6">
        <div className="relative">
          <Search
            className={`absolute transition-all duration-300 h-5 w-5 text-gray-400
          ${searchTerm.length > 0 ? 'right-3 cursor-pointer hover:text-gray-600' : 'left-3'} 
          top-1/2 transform -translate-y-1/2`}
            onClick={() => searchTerm.length > 0 && onSearchChange(searchTerm)}
          />
          <Input
            placeholder="Buscar por cargo, tecnologia, área..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchChange(searchTerm)}
            className={`h-12 text-lg transition-all duration-300 ${searchTerm.length > 0 ? 'pr-10 pl-4' : 'pl-10'
              }`}
          />
        </div>
        {searchTerm.length > 0 && (
          <div className="text-sm text-gray-400 mt-2 animate-pulse">
            Buscando resultados...
          </div>
        )}
      </CardContent>
    </Card>
  );
}