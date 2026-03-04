import api from './api'
import type { Almacen } from '@/types/almacen'

export const almacenService = {
  async getAll(): Promise<Almacen[]> {
    const { data } = await api.get<Almacen[]>('/api/public/almacenes')
    return data
  },
}
