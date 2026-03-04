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
