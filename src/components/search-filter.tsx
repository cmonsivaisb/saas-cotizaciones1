"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface SearchFilterProps {
  onSearch: (search: string) => void
  onPageChange: (page: number) => void
  placeholder?: string
  totalItems: number
  pageSize?: number
  currentPage: number
}

export default function SearchFilter({ 
  onSearch, 
  onPageChange,
  placeholder = "Buscar...", 
  totalItems,
  pageSize = 10,
  currentPage = 1
}: SearchFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    onSearch(value)
  }, [onSearch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get('search')
    if (searchParam) {
      setSearch(searchParam)
    }
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}