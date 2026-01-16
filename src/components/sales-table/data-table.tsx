"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, Download, Search, X, Filter } from "lucide-react"
import { SaleRecord } from "@/types/order"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  onDataChange?: (data: TData[]) => void
}

// Sticky column widths (cumulative left positions)
const STICKY_WIDTHS = {
  0: 0,      // Cliente starts at 0
  1: 150,    // CPF starts after Cliente (150px)
}

// Column filter component for multi-select filters
function ColumnFilterPopover<TData>({
  column,
  data,
}: {
  column: Column<TData, unknown>
  data: TData[]
}) {
  const columnId = column.id
  const filterValue = (column.getFilterValue() as string[]) || []

  // Get unique values for this column
  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>()
    data.forEach((row) => {
      const value = (row as Record<string, unknown>)[columnId]
      if (value && value !== "-") {
        values.add(String(value))
      }
    })
    return Array.from(values).sort()
  }, [data, columnId])

  const handleToggle = (value: string) => {
    const newFilter = filterValue.includes(value)
      ? filterValue.filter((v) => v !== value)
      : [...filterValue, value]
    column.setFilterValue(newFilter.length > 0 ? newFilter : undefined)
  }

  const handleClear = () => {
    column.setFilterValue(undefined)
  }

  if (uniqueValues.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            filterValue.length > 0 && "text-primary"
          )}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filtrar por {columnId}</span>
            {filterValue.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 px-2 text-xs">
                Limpar
              </Button>
            )}
          </div>
          <div className="max-h-48 overflow-auto space-y-1">
            {uniqueValues.map((value) => (
              <label
                key={value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
              >
                <Checkbox
                  checked={filterValue.includes(value)}
                  onCheckedChange={() => handleToggle(value)}
                />
                <span className="text-sm truncate">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DataTable<TData extends SaleRecord, TValue>({
  columns,
  data: initialData,
  isLoading,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Update local data when prop changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Function to update data locally
  const updateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setData((old) => {
        const newData = old.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...row,
              [columnId]: value,
            }
          }
          return row
        })
        if (onDataChange) {
          onDataChange(newData)
        }
        return newData
      })
    },
    [onDataChange]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    meta: {
      updateData,
    },
  })

  // Get sticky styles for header/cell
  const getStickyStyles = (columnId: string, columnMeta?: { sticky?: boolean; stickyPosition?: number }) => {
    if (!columnMeta?.sticky) return {}

    const position = columnMeta.stickyPosition ?? 0
    const left = STICKY_WIDTHS[position as keyof typeof STICKY_WIDTHS] ?? 0

    return {
      position: "sticky" as const,
      left: `${left}px`,
      zIndex: 10,
      backgroundColor: "hsl(var(--background))",
      boxShadow: position === 1 ? "2px 0 4px rgba(0,0,0,0.1)" : undefined,
    }
  }

  // Check if a column has multi-select filter type
  const hasMultiSelectFilter = (column: Column<TData, unknown>) => {
    const meta = column.columnDef.meta
    return meta?.filterType === "multi-select"
  }

  // Fixed CSV export - uses raw data values with proper formatting
  const exportToCSV = () => {
    const visibleColumns = table.getVisibleLeafColumns()
    const rows = table.getFilteredRowModel().rows

    // Create header row with readable column names
    const headers = visibleColumns.map((col) => {
      const header = col.columnDef.header
      if (typeof header === "string") return header
      return col.id
    })

    // Create data rows using csvFormatter from column meta
    const csvRows = rows.map((row) =>
      visibleColumns.map((col) => {
        const rawValue = row.original[col.id as keyof SaleRecord]
        const csvFormatter = col.columnDef.meta?.csvFormatter

        let stringValue: string
        if (csvFormatter) {
          stringValue = csvFormatter(rawValue)
        } else if (rawValue === null || rawValue === undefined) {
          stringValue = ""
        } else if (typeof rawValue === "object") {
          stringValue = JSON.stringify(rawValue)
        } else {
          stringValue = String(rawValue)
        }

        return `"${stringValue.replace(/"/g, '""')}"`
      }).join(",")
    )

    const csvContent = [headers.join(","), ...csvRows].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `controle-vendas-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Get active filters count
  const activeFiltersCount = columnFilters.length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar em todas as colunas..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 pr-9"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="text-muted-foreground"
            >
              Limpar filtros ({activeFiltersCount})
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] max-h-[400px] overflow-auto">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table with always-visible horizontal scrollbar */}
      <div
        className={cn(
          "rounded-md border overflow-x-auto",
          "[&::-webkit-scrollbar]:h-3",
          "[&::-webkit-scrollbar]:block",
          "[&::-webkit-scrollbar-track]:bg-muted",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const stickyStyles = getStickyStyles(header.column.id, meta)

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap",
                        meta?.sticky && "bg-background"
                      )}
                      style={stickyStyles}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {hasMultiSelectFilter(header.column) && (
                          <ColumnFilterPopover
                            column={header.column}
                            data={data}
                          />
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    const stickyStyles = getStickyStyles(cell.column.id, meta)

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "whitespace-nowrap",
                          meta?.sticky && "bg-background"
                        )}
                        style={stickyStyles}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} registro(s) encontrado(s)
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Linhas por página</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
