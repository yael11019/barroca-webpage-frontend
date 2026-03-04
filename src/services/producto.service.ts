import api from './api'
import type { Producto, Variante } from '@/types/producto'

export const productoService = {
  async getAll(): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>('/api/public/productos')
    return data
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
