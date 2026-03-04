export interface DiaDisponible {
  fecha: string // 'YYYY-MM-DD'
  disponible: boolean
}

export interface HorarioDisponible {
  hora: string // 'HH:mm'
  disponible: boolean
}

export interface DisponibilidadMes {
  anio: number
  mes: number // 1-12
  dias: DiaDisponible[]
}

export interface DisponibilidadDia {
  fecha: string
  horarios: HorarioDisponible[]
}

export interface CrearCitaPayload {
  fecha: string // 'YYYY-MM-DD'
  hora: string // 'HH:mm'
  nombre: string
  telefono: string
  email: string
  direccion: string
}

export interface Cita {
  id: number
  fecha: string
  hora: string
  nombre: string
  telefono: string
  email: string
  direccion: string
  tipo: string
  duracion_minutos: number
  estado: string
  created_at: string
}

export interface CrearCitaResponse {
  message: string
  cita: Cita
}
