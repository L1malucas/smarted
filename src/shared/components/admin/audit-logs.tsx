"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Calendar, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Table } from "lucide-react";
import { format, subDays } from "date-fns";
import { getAccessLogs } from "@/infrastructure/actions/admin-actions";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Button } from "../ui/button";
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { useToast } from "../ui/use-toast";
import { IAuditLog } from "@/domain/models/AuditLog";

// Helper to get start of UTC day
const getUTCStartOfDay = (date: Date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
};

// Helper to get end of UTC day
const getUTCEndOfDay = (date: Date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(true);

  const [startDate, setStartDate] = useState<Date | undefined>(getUTCStartOfDay(subDays(new Date(), 7))); // Default to start of 7 days ago (UTC)
  const [endDate, setEndDate] = useState<Date | undefined>(getUTCEndOfDay(new Date())); // Default to end of today (UTC)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { toast } = useToast();

  const fetchLogs = (page: number = currentPage) => {
    setIsFetching(true);
    startTransition(async () => {
      try {
        // Ensure dates are converted to UTC for the query
        const queryStartDate = startDate ? getUTCStartOfDay(startDate) : getUTCStartOfDay(subDays(new Date(), 7));
        const queryEndDate = endDate ? getUTCEndOfDay(endDate) : getUTCEndOfDay(new Date());

        const result = await getAccessLogs(queryStartDate, queryEndDate, page, itemsPerPage);
        setLogs(result.logs);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } catch (error) {
        // console.error("Failed to fetch audit logs:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os logs de auditoria.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    });
  };

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Auditoria do Sistema</CardTitle>
        <CardDescription>Acompanhe todas as ações importantes realizadas no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex-grow space-y-1">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date ? getUTCStartOfDay(date) : undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-grow space-y-1">
            <Label htmlFor="endDate">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date ? getUTCEndOfDay(date) : undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={() => fetchLogs(1)} disabled={isPending || isFetching}>
            {isPending || isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Aplicar Filtros
          </Button>
        </div>
        <div className="flex justify-end items-center space-x-2 mb-4">
          <Label htmlFor="itemsPerPage">Itens por página:</Label>
          <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isFetching && logs.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground text-center">Nenhum log encontrado com os filtros atuais.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>ID do Recurso</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Sucesso</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.actionType}</TableCell>
                  <TableCell>{log.resourceType}</TableCell>
                  <TableCell>{log.resourceId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.details || "-"}</TableCell>
                  <TableCell>{log.success ? "Sim" : "Não"}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex justify-end items-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending || isFetching}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending || isFetching}
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}