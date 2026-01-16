"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SaleRecord } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  formatCPFCNPJ,
  formatPhone,
} from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableCell } from "./editable-cell";

// Column metadata for sticky columns and filtering
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    sticky?: boolean;
    stickyPosition?: number;
    filterType?:
      | "text"
      | "select"
      | "multi-select"
      | "date-range"
      | "number-range";
    filterOptions?: { label: string; value: string }[];
    csvFormatter?: (value: unknown) => string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

// Status variant helper
const getStatusVariant = (
  status: string
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning" => {
  const lowerStatus = status?.toLowerCase() || "";
  if (
    lowerStatus.includes("pago") ||
    lowerStatus.includes("aprovado") ||
    lowerStatus.includes("entregue")
  ) {
    return "success";
  } else if (
    lowerStatus.includes("cancelado") ||
    lowerStatus.includes("recusado")
  ) {
    return "destructive";
  } else if (
    lowerStatus.includes("pendente") ||
    lowerStatus.includes("aguardando")
  ) {
    return "warning";
  }
  return "secondary";
};

export const columns: ColumnDef<SaleRecord>[] = [
  // STICKY COLUMNS
  {
    accessorKey: "cliente",
    header: "Cliente",
    meta: {
      sticky: true,
      stickyPosition: 0,
      filterType: "text",
      csvFormatter: (value) => String(value || ""),
    },
    cell: ({ row }) => (
      <span
        className="max-w-[150px] truncate block font-medium"
        title={row.getValue("cliente")}
      >
        {row.getValue("cliente")}
      </span>
    ),
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    meta: {
      sticky: true,
      stickyPosition: 1,
      filterType: "text",
      csvFormatter: (value) => formatCPFCNPJ(value as string | null),
    },
    cell: ({ row, table }) => {
      const cpf = row.original.cpf;
      const updateData = table.options.meta?.updateData;

      return (
        <EditableCell
          value={cpf}
          orderId={row.original.id}
          field="cpf"
          onSave={async (id, field, value) => {
            if (updateData) {
              updateData(row.index, field, value);
            }
            return true;
          }}
          formatFn={formatCPFCNPJ}
        />
      );
    },
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
    meta: {
      filterType: "text",
      csvFormatter: (value) => formatCPFCNPJ(value as string | null),
    },
    cell: ({ row, table }) => {
      const cnpj = row.original.cnpj;
      const updateData = table.options.meta?.updateData;

      return (
        <EditableCell
          value={cnpj}
          orderId={row.original.id}
          field="cnpj"
          onSave={async (id, field, value) => {
            if (updateData) {
              updateData(row.index, field, value);
            }
            return true;
          }}
          formatFn={formatCPFCNPJ}
        />
      );
    },
  },

  // PRIMARY INFO
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterType: "multi-select",
      csvFormatter: (value) => String(value || ""),
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const value = row.getValue(id) as string;
      return filterValue.includes(value);
    },
  },
  {
    accessorKey: "dataVenda",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Data da Venda
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: {
      filterType: "date-range",
      csvFormatter: (value) => formatDate(value as string),
    },
    cell: ({ row }) => formatDate(row.getValue("dataVenda")),
  },
  {
    accessorKey: "plano",
    header: "Plano",
    meta: {
      filterType: "multi-select",
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => {
      const plano = row.getValue("plano") as string;
      return plano && plano !== "-" ? (
        <Badge variant="outline">{plano}</Badge>
      ) : (
        "-"
      );
    },
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const value = row.getValue(id) as string;
      return filterValue.includes(value);
    },
  },
  {
    accessorKey: "modelo",
    header: "Modelo",
    meta: {
      filterType: "multi-select",
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => (
      <span
        className="max-w-[150px] truncate block"
        title={row.getValue("modelo") || "-"}
      >
        {row.getValue("modelo") || "-"}
      </span>
    ),
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const value = row.getValue(id) as string;
      return filterValue.includes(value);
    },
  },

  // FINANCIAL
  {
    accessorKey: "valorBruto",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Valor Bruto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: {
      filterType: "number-range",
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => formatCurrency(row.getValue("valorBruto")),
  },
  {
    accessorKey: "valorLiquido",
    header: "Valor Líquido",
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => formatCurrency(row.getValue("valorLiquido")),
  },
  {
    accessorKey: "formaPagamento",
    header: "Forma de Pag.",
    meta: {
      filterType: "multi-select",
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => {
      const method = row.getValue("formaPagamento") as string | null;
      if (!method) return "-";
      return <Badge variant="secondary">{method}</Badge>;
    },
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const value = row.getValue(id) as string;
      return filterValue.includes(value);
    },
  },

  // PRODUCT DETAILS
  {
    accessorKey: "linkCupom",
    header: "Produto",
    meta: {
      filterType: "text",
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => (
      <span
        className="max-w-[200px] truncate block"
        title={row.getValue("linkCupom") || "-"}
      >
        {row.getValue("linkCupom") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "quantidade",
    header: "Quant.",
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => row.getValue("quantidade"),
  },

  // OPERATIONAL
  {
    accessorKey: "primeiroContato",
    header: "1º Contato",
    meta: {
      csvFormatter: (value) => formatDate(value as string),
    },
    cell: ({ row }) => formatDate(row.getValue("primeiroContato")),
  },
  {
    accessorKey: "cadPortal",
    header: "Cad. Portal",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("cadPortal") || "-",
  },
  {
    accessorKey: "cadPagseguro",
    header: "Cad. Pagseguro",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("cadPagseguro") || "-",
  },
  {
    accessorKey: "dataAceite",
    header: "Data do Aceite",
    meta: {
      csvFormatter: (value) => formatDate(value as string),
    },
    cell: ({ row }) => formatDate(row.getValue("dataAceite")),
  },
  {
    accessorKey: "maquina",
    header: "Máquina",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("maquina") || "-",
  },
  {
    accessorKey: "maqDeRua",
    header: "Máq. de Rua",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("maqDeRua") || "-",
  },
  {
    accessorKey: "dataEnvioPOS",
    header: "Envio POS",
    meta: {
      csvFormatter: (value) => formatDate(value as string),
    },
    cell: ({ row }) => formatDate(row.getValue("dataEnvioPOS")),
  },
  {
    accessorKey: "formaPagPOS",
    header: "Pag. POS",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("formaPagPOS") || "-",
  },
  {
    accessorKey: "manualCliente",
    header: "Manual",
    meta: {
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => row.getValue("manualCliente") || "-",
  },
  {
    accessorKey: "dataEnvioManual",
    header: "Envio Manual",
    meta: {
      csvFormatter: (value) => formatDate(value as string),
    },
    cell: ({ row }) => formatDate(row.getValue("dataEnvioManual")),
  },

  // COSTS & PROFIT
  {
    accessorKey: "custoOpPagarme",
    header: "Custo Pagarme",
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => formatCurrency(row.getValue("custoOpPagarme")),
  },
  {
    accessorKey: "custoPOS",
    header: "Custo POS",
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => formatCurrency(row.getValue("custoPOS")),
  },
  {
    accessorKey: "comissaoAfiliado",
    header: "Comissão",
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => formatCurrency(row.getValue("comissaoAfiliado")),
  },
  {
    accessorKey: "lucro",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Lucro
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: {
      csvFormatter: (value) => String(value || 0),
    },
    cell: ({ row }) => {
      const lucro = row.getValue("lucro") as number;
      return (
        <span
          className={
            lucro > 0
              ? "text-green-600 font-medium"
              : lucro < 0
              ? "text-red-600 font-medium"
              : ""
          }
        >
          {formatCurrency(lucro)}
        </span>
      );
    },
  },

  // CONTACT
  {
    accessorKey: "telefone",
    header: "Telefone",
    meta: {
      filterType: "text",
      csvFormatter: (value) => formatPhone(value as string | null),
    },
    cell: ({ row }) => formatPhone(row.getValue("telefone")),
  },
  {
    accessorKey: "enderecoEntrega",
    header: "Endereço",
    meta: {
      filterType: "text",
      csvFormatter: (value) => String(value || "-"),
    },
    cell: ({ row }) => (
      <span
        className="max-w-[200px] truncate block"
        title={row.getValue("enderecoEntrega") || "-"}
      >
        {row.getValue("enderecoEntrega") || "-"}
      </span>
    ),
  },

  // Hidden but included for reference
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        # Pedido
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: {
      csvFormatter: (value) => String(value || ""),
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("orderNumber")}</span>
    ),
  },
];
