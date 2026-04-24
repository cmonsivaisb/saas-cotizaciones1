"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type StatusOption = {
  value: string
  label: string
}

type SearchFilters = {
  search: string
  status: string
  dateFrom: string
  dateTo: string
}

const defaultStatusOptions: StatusOption[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Con pedidos" },
  { value: "no_orders", label: "Sin pedidos" },
  { value: "with_quotes", label: "Con cotizaciones" },
]

function ClientSearchContent({ 
  totalItems, 
  pageSize = 10, 
  placeholder = "Buscar...", 
  basePath = "/orders",
  statusOptions = defaultStatusOptions,
  showStatus = true,
  showDates = true
}: { 
  totalItems: number, 
  pageSize?: number, 
  placeholder?: string,
  basePath?: string,
  statusOptions?: StatusOption[]
  showStatus?: boolean
  showDates?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const getInitialValue = (key: string) => searchParams.get(key) || ''
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: getInitialValue('search'),
    status: getInitialValue('status'),
    dateFrom: getInitialValue('dateFrom'),
    dateTo: getInitialValue('dateTo'),
  })
  
  const currentPage = parseInt(searchParams.get('page') || '1')
  const totalPages = Math.ceil(totalItems / pageSize)

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
    })
  }, [searchParams])

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    params.set('page', '1')
    
    if (filters.search) params.set('search', filters.search)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    router.push(`${basePath}?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ search: '', status: '', dateFrom: '', dateTo: '' })
    const params = new URLSearchParams()
    params.set('page', '1')
    router.push(`${basePath}?${params.toString()}`)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    params.set('page', page.toString())
    router.push(`${basePath}?${params.toString()}`)
  }

  const hasActiveFilters = filters.status || filters.dateFrom || filters.dateTo

  const showFiltersRow = showStatus || showDates

  return (
    <form onSubmit={handleSearch}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showStatus && statusOptions.length > 0 && (
            <Select value={filters.status} onValueChange={(v: string) => updateFilter('status', v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button type="submit" variant="default">
            <SearchIcon className="h-4 w-4 mr-2" />
            Buscar
          </Button>

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showFiltersRow && (
          <div className="flex flex-col sm:flex-row gap-3">
            {showDates && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Desde:</span>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hasta:</span>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="w-[160px]"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}

export default function ClientSearch(props: { 
  totalItems: number, 
  pageSize?: number, 
  placeholder?: string,
  basePath?: string,
  statusOptions?: StatusOption[]
  showStatus?: boolean
  showDates?: boolean
}) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClientSearchContent {...props} />
    </Suspense>
  )
}