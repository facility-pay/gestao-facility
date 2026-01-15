"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Filter, X } from "lucide-react"

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void
}

export interface FilterValues {
  status?: string
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Pendente" },
  { value: "cancelled", label: "Cancelado" },
  { value: "delivered", label: "Entregue" },
  { value: "processing", label: "Processando" },
]

const PAYMENT_OPTIONS = [
  { value: "all", label: "Todas as formas" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "billet", label: "Boleto" },
  { value: "deposit", label: "Depósito" },
]

export function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = React.useState<FilterValues>({})
  const [isOpen, setIsOpen] = React.useState(false)

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== "all"
  ).length

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select
                value={filters.paymentMethod || "all"}
                onValueChange={(value) => handleFilterChange("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters badges */}
      {filters.status && filters.status !== "all" && (
        <Badge variant="secondary" className="gap-1">
          Status: {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
          <button
            onClick={() => handleFilterChange("status", "all")}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {filters.paymentMethod && filters.paymentMethod !== "all" && (
        <Badge variant="secondary" className="gap-1">
          Pagamento: {PAYMENT_OPTIONS.find((o) => o.value === filters.paymentMethod)?.label}
          <button
            onClick={() => handleFilterChange("paymentMethod", "all")}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {(filters.dateFrom || filters.dateTo) && (
        <Badge variant="secondary" className="gap-1">
          Período: {filters.dateFrom || "..."} - {filters.dateTo || "..."}
          <button
            onClick={() => {
              handleFilterChange("dateFrom", "")
              handleFilterChange("dateTo", "")
            }}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
