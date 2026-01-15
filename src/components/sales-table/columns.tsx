"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SaleRecord } from "@/types/order"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatCPFCNPJ, formatPhone } from "@/lib/utils"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<SaleRecord>[] = [
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => (
      <span className="max-w-[150px] truncate block font-medium" title={row.getValue("cliente")}>
        {row.getValue("cliente")}
      </span>
    ),
  },
  {
    accessorKey: "cpfCnpj",
    header: "CPF/CNPJ",
    cell: ({ row }) => formatCPFCNPJ(row.getValue("cpfCnpj")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary"

      const lowerStatus = status?.toLowerCase() || ""
      if (lowerStatus.includes("pago") || lowerStatus.includes("aprovado") || lowerStatus.includes("entregue")) {
        variant = "success"
      } else if (lowerStatus.includes("cancelado") || lowerStatus.includes("recusado")) {
        variant = "destructive"
      } else if (lowerStatus.includes("pendente") || lowerStatus.includes("aguardando")) {
        variant = "warning"
      }

      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("orderNumber")}</span>,
  },
  {
    accessorKey: "data",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue("data")),
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => formatPhone(row.getValue("telefone")),
  },
  {
    accessorKey: "enderecoEntrega",
    header: "Endereço",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block" title={row.getValue("enderecoEntrega") || "-"}>
        {row.getValue("enderecoEntrega") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "formaPagamento",
    header: "Forma de Pag.",
    cell: ({ row }) => {
      const method = row.getValue("formaPagamento") as string | null
      if (!method) return "-"
      const labels: Record<string, string> = {
        pix: "PIX",
        credit_card: "Cartão",
        billet: "Boleto",
        deposit: "Depósito"
      }
      return <Badge variant="secondary">{labels[method] || method}</Badge>
    },
  },
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
    cell: ({ row }) => formatCurrency(row.getValue("valorBruto")),
  },
  {
    accessorKey: "modelo",
    header: "Modelo",
    cell: ({ row }) => (
      <span className="max-w-[120px] truncate block" title={row.getValue("modelo") || "-"}>
        {row.getValue("modelo") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "quantidade",
    header: "Quant.",
    cell: ({ row }) => row.getValue("quantidade"),
  },
  {
    accessorKey: "plano",
    header: "Plano",
    cell: ({ row }) => row.getValue("plano") || "-",
  },
  {
    accessorKey: "primeiroContato",
    header: "1º Contato",
    cell: ({ row }) => formatDate(row.getValue("primeiroContato")),
  },
  {
    accessorKey: "cadPortal",
    header: "Cad. Portal",
    cell: ({ row }) => row.getValue("cadPortal") || "-",
  },
  {
    accessorKey: "cadPagseguro",
    header: "Cad. Pagseguro",
    cell: ({ row }) => row.getValue("cadPagseguro") || "-",
  },
  {
    accessorKey: "dataAceite",
    header: "Data do Aceite",
    cell: ({ row }) => formatDate(row.getValue("dataAceite")),
  },
  {
    accessorKey: "maquina",
    header: "Máquina",
    cell: ({ row }) => row.getValue("maquina") || "-",
  },
  {
    accessorKey: "linkCupom",
    header: "Link/Cupom",
    cell: ({ row }) => row.getValue("linkCupom") || "-",
  },
  {
    accessorKey: "maqDeRua",
    header: "Máq. de Rua",
    cell: ({ row }) => row.getValue("maqDeRua") || "-",
  },
  {
    accessorKey: "dataVenda",
    header: "Data da Venda",
    cell: ({ row }) => formatDate(row.getValue("dataVenda")),
  },
  {
    accessorKey: "dataEnvioPOS",
    header: "Envio POS",
    cell: ({ row }) => formatDate(row.getValue("dataEnvioPOS")),
  },
  {
    accessorKey: "formaPagPOS",
    header: "Pag. POS",
    cell: ({ row }) => row.getValue("formaPagPOS") || "-",
  },
  {
    accessorKey: "manualCliente",
    header: "Manual",
    cell: ({ row }) => row.getValue("manualCliente") || "-",
  },
  {
    accessorKey: "dataEnvioManual",
    header: "Envio Manual",
    cell: ({ row }) => formatDate(row.getValue("dataEnvioManual")),
  },
  {
    accessorKey: "valorLiquido",
    header: "Valor Líquido",
    cell: ({ row }) => formatCurrency(row.getValue("valorLiquido")),
  },
  {
    accessorKey: "custoOpPagarme",
    header: "Custo Pagarme",
    cell: ({ row }) => formatCurrency(row.getValue("custoOpPagarme")),
  },
  {
    accessorKey: "custoPOS",
    header: "Custo POS",
    cell: ({ row }) => formatCurrency(row.getValue("custoPOS")),
  },
  {
    accessorKey: "comissaoAfiliado",
    header: "Comissão",
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
    cell: ({ row }) => {
      const lucro = row.getValue("lucro") as number
      return (
        <span className={lucro > 0 ? "text-green-600 font-medium" : lucro < 0 ? "text-red-600 font-medium" : ""}>
          {formatCurrency(lucro)}
        </span>
      )
    },
  },
]
