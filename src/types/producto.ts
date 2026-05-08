// Tipo del catálogo público (API /api/public/productos)
export interface ImagenCatalogo {
  url: string
  blur?: string
  legend: 'ai_render' | 'accesorios_por_separado' | null
}

export interface ColorCatalogo {
  nombre: string
  imagenes: ImagenCatalogo[]
}

export interface ProductoCatalogo {
  id: number
  nombre: string
  tipo: string | null
  subcategoria: string | null
  colores: ColorCatalogo[]
}

// Tipos legacy (carrito / admin)
export interface Variante {
  id: number
  producto_id: number
  medida: string
  color: string | null
  sku: string
  barcode: string
  precio_base: string
}

export interface Producto {
  id: number
  nombre: string
  categoria: string
  descripcion: string | null
  activo: boolean
  variantes: Variante[]
}
