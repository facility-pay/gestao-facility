"use client";

import * as React from "react";
import { columns } from "@/components/sales-table/columns";
import { DataTable } from "@/components/sales-table/data-table";
import { Filters, FilterValues } from "@/components/sales-table/filters";
import {
  SaleRecord,
  YampiOrdersResponse,
  mapYampiOrderToSaleRecord,
} from "@/types/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ControleVendasPage() {
  const [data, setData] = React.useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterValues>({});

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append("status_id", filters.status);
      }
      if (filters.paymentMethod) {
        params.append("payment_method", filters.paymentMethod);
      }
      if (filters.dateFrom) {
        params.append("date_from", filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append("date_to", filters.dateTo);
      }

      const response = await fetch(`/api/yampi/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Falha ao buscar pedidos");
      }

      const result: YampiOrdersResponse = await response.json();

      if (result.data) {
        const mappedData = result.data.map(mapYampiOrderToSaleRecord);
        setData(mappedData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Erro ao carregar pedidos. Verifique sua conexão e tente novamente."
      );
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Controle de Vendas
        </h1>
        <p className="text-muted-foreground">
          Gerencie e acompanhe todas as vendas da sua loja
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Lista completa de pedidos com filtros avançados
              </CardDescription>
            </div>
            <Filters onFilterChange={handleFilterChange} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
