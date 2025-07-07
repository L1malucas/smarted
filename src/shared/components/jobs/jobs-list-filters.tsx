
import { jobStatusOptions } from "@/shared/constants/jobs-constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface IJobFilterProps {
  searchTerm: string;
  statusFilter: string;
  viewMode: "card" | "list";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewModeChange: (mode: "card" | "list") => void;
}

export function JobFilter({
  searchTerm,
  statusFilter,
  viewMode,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
}: IJobFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar vagas por título, descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          {jobStatusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onViewModeChange("card")}
          className={viewMode === "card" ? "bg-muted" : ""}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onViewModeChange("list")}
          className={viewMode === "list" ? "bg-muted" : ""}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        </Button>
        {/* <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
        </Button> */}
      </div>
    </div>
  );
}