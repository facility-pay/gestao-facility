"use client";

import * as React from "react";
import { columns } from "@/components/sales-table/columns";
import { DataTable } from "@/components/sales-table/data-table";
import { Filters, FilterValues } from "@/components/sales-table/filters";
import {
  SaleRecord,
  DbOrderRow,
  mapDbRowToSaleRecord,
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
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface SyncResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  errors: number;
  total: number;
}

export default function ControleVendasPage() {
  const [data, setData] = React.useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterValues>({});
  const [useDatabase, setUseDatabase] = React.useState(true);

  const fetchFromDatabase = React.useCallback(async () => {
    const params = new URLSearchParams();

    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.paymentMethod) {
      params.append("forma_pagamento", filters.paymentMethod);
    }
    if (filters.dateFrom) {
      params.append("date_from", filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append("date_to", filters.dateTo);
    }

    const response = await fetch(`/api/orders?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Falha ao buscar pedidos do banco de dados");
    }

    const result: { data: DbOrderRow[]; total: number } = await response.json();

    if (result.data && result.data.length > 0) {
      return result.data.map(mapDbRowToSaleRecord);
    }
    return [];
  }, [filters]);

  const fetchFromYampi = React.useCallback(async () => {
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
      return result.data.map(mapYampiOrderToSaleRecord);
    }
    return [];
  }, [filters]);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let mappedData: SaleRecord[] = [];

      if (useDatabase) {
        mappedData = await fetchFromDatabase();
        // If database is empty, fall back to Yampi
        if (mappedData.length === 0) {
          mappedData = await fetchFromYampi();
          setUseDatabase(false);
        }
      } else {
        mappedData = await fetchFromYampi();
      }

      setData(mappedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      // Try fallback to Yampi if database fails
      if (useDatabase) {
        try {
          const yampiData = await fetchFromYampi();
          setData(yampiData);
          setUseDatabase(false);
        } catch {
          setError(
            "Erro ao carregar pedidos. Verifique sua conexão e tente novamente."
          );
          setData([]);
        }
      } else {
        setError(
          "Erro ao carregar pedidos. Verifique sua conexão e tente novamente."
        );
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, useDatabase, fetchFromDatabase, fetchFromYampi]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/orders/sync", {
        method: "POST",
      });

      const result: SyncResult = await response.json();

      if (result.success) {
        setSyncMessage(result.message);
        setUseDatabase(true);
        // Refresh data after sync
        await fetchData();
      } else {
        setSyncMessage(`Erro: ${result.message}`);
      }
    } catch (err) {
      console.error("Error syncing:", err);
      setSyncMessage("Erro ao sincronizar. Tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // const handleOrderUpdate = async (id: number, field: string, value: string) => {
  //   try {
  //     const response = await fetch(`/api/orders/${id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ [field]: value }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to update order");
  //     }

  //     // Update local state
  //     setData((prev) =>
  //       prev.map((row) =>
  //         row.id === id ? { ...row, [field]: value } : row
  //       )
  //     );

  //     return true;
  //   } catch (error) {
  //     console.error("Error updating order:", error);
  //     throw error;
  //   }
  // };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Controle de Vendas
          </h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todas as vendas da sua loja
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
          className="shrink-0"
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Yampi
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {syncMessage && (
        <Card
          className={
            syncMessage.startsWith("Erro")
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <CardContent className="pt-6">
            <p
              className={`text-sm ${
                syncMessage.startsWith("Erro")
                  ? "text-red-800"
                  : "text-green-800"
              }`}
            >
              {syncMessage}
            </p>
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
                {!useDatabase && " (carregando diretamente do Yampi)"}
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
