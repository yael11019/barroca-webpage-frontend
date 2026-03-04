export type Horarios = Record<string, string>

export interface Almacen {
  id: number
  nombre: string
  direccion: string
  telefono1: string
  telefono2: string | null
  correo: string | null
  latitud: string
  longitud: string
  horarios: Horarios
  activo: boolean
}
