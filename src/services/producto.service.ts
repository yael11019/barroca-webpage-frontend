import api from './api'
import type { ProductoCatalogo, Producto, Variante } from '@/types/producto'

export const productoService = {
  async getAll(): Promise<ProductoCatalogo[]> {
    const { data } = await api.get<any[]>('/api/public/productos')
    return (data ?? []).map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo ?? item.categoria ?? null,
      subcategoria: item.subcategoria ?? null,
      colores: item.colores ?? [],
    }))
  },

  async getById(id: number): Promise<Producto> {
    const { data } = await api.get<Producto>(`/api/productos/${id}`)
    return data
  },

  async getVariantes(productoId: number): Promise<Variante[]> {
    const { data } = await api.get<Variante[]>(`/api/productos/${productoId}/variantes`)
    return data
  },
}
