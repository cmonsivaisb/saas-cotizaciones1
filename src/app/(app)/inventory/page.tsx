import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Package,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getProducts() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const products = await prisma.item.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function InventoryPage() {
  const products = await getProducts()
  const lowStockProducts = products.filter((p: any) => p.stockQuantity <= p.minimumStock)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Inventario</h1>
          <p className="text-primary-500 mt-1">
            Gestiona tus productos y controla el stock
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/inventory/new">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-warning-200 bg-warning-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning-900 mb-1">
                  {lowStockProducts.length} producto{lowStockProducts.length > 1 ? 's' : ''} con stock bajo
                </h3>
                <p className="text-sm text-warning-700">
                  Considera reabastecer estos productos pronto para evitar desabastos.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-warning-200 text-warning-700 hover:bg-warning-100" asChild>
                <Link href="/inventory">
                  Ver productos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por nombre, SKU o categoría..."
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay productos en inventario</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Comienza agregando tus productos para gestionar tu inventario.
            </p>
            <Button asChild className="gap-2">
              <Link href="/inventory/new">
                <Plus className="h-4 w-4" />
                Agregar primer producto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const isLowStock = product.stockQuantity <= product.minimumStock
  const stockPercentage = (product.stockQuantity / product.minimumStock) * 100
  
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 group ${isLowStock ? 'border-warning-200' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 text-primary-900">{product.name}</CardTitle>
            <CardDescription className="text-xs font-mono text-primary-500">
              SKU: {product.sku}
            </CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/inventory/${product.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-500">Precio</span>
          <div className="flex items-center gap-1 text-xl font-bold text-primary-900">
            <DollarSign className="h-4 w-4" />
            {product.salePrice.toLocaleString('es-MX')}
          </div>
        </div>
 
        {/* Stock */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-500">Stock</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${isLowStock ? 'text-warning-600' : 'text-success-600'}`}>
                {product.stockQuantity}
              </span>
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-warning-600" />
              )}
            </div>
          </div>
          <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isLowStock ? 'bg-warning-500' : 'bg-success-500'}`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-primary-500">
            <span>Mínimo: {product.minimumStock}</span>
            <span>{isLowStock ? 'Bajo stock' : 'Stock OK'}</span>
          </div>
        </div>
 
        {/* Category */}
        {product.category && (
          <div className="pt-2 border-t-2 border-primary-200">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-900">
              {product.category}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
