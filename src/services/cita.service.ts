import api from './api'
import type {
  DisponibilidadMes,
  DisponibilidadDia,
  CrearCitaPayload,
  CrearCitaResponse,
} from '@/types/cita'

export const citaService = {
  async getDisponibilidadMes(anio: number, mes: number): Promise<DisponibilidadMes> {
    const { data } = await api.get<DisponibilidadMes>(
      `/api/public/citas/disponibilidad/${anio}/${mes}`,
    )
    return data
  },

  async getDisponibilidadDia(fecha: string): Promise<DisponibilidadDia> {
    const { data } = await api.get<DisponibilidadDia>(
      `/api/public/citas/disponibilidad/dia/${fecha}`,
    )
    return data
  },

  async crear(payload: CrearCitaPayload): Promise<CrearCitaResponse> {
    const { data } = await api.post<CrearCitaResponse>('/api/public/citas', payload)
    return data
  },
}
