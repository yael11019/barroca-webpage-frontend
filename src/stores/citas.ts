import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { citaService } from '@/services/cita.service'
import type {
  DiaDisponible,
  HorarioDisponible,
  CrearCitaPayload,
  Cita,
} from '@/types/cita'

export type PasoCita = 'calendario' | 'horario' | 'formulario' | 'confirmacion' | 'exito'

export const useCitasStore = defineStore('citas', () => {
  // ── UI ─────────────────────────────────────────────────────
  const modalAbierto = ref(false)
  const paso = ref<PasoCita>('calendario')

  // ── Calendario ─────────────────────────────────────────────
  const mesActual = ref({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 })
  const diasDisponibles = ref<DiaDisponible[]>([])
  const loadingMes = ref(false)
  const errorMes = ref<string | null>(null)

  // ── Horarios ───────────────────────────────────────────────
  const horariosDisponibles = ref<HorarioDisponible[]>([])
  const loadingHorarios = ref(false)
  const errorHorarios = ref<string | null>(null)

  // ── Selección ──────────────────────────────────────────────
  const fechaSeleccionada = ref<string | null>(null)
  const horaSeleccionada = ref<string | null>(null)

  // ── Formulario ─────────────────────────────────────────────
  const formulario = ref({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  })

  // ── Reserva ────────────────────────────────────────────────
  const loadingReserva = ref(false)
  const errorReserva = ref<string | null>(null)
  const citaCreada = ref<Cita | null>(null)

  // ── Computed ───────────────────────────────────────────────
  const fechaFormateada = computed(() => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return ''
    const [anio, mes, dia] = fechaSeleccionada.value.split('-').map(Number)
    const fecha = new Date(anio!, mes! - 1, dia)
    const formatter = new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${formatter.format(fecha)}, ${horaSeleccionada.value}`
  })

  const puedeConfirmar = computed(() => {
    const f = formulario.value
    return (
      f.nombre.trim() !== '' &&
      f.telefono.trim() !== '' &&
      f.email.trim() !== '' &&
      f.direccion.trim() !== ''
    )
  })

  // ── Acciones ───────────────────────────────────────────────
  function abrirModal() {
    modalAbierto.value = true
    paso.value = 'calendario'
    const now = new Date()
    mesActual.value = { anio: now.getFullYear(), mes: now.getMonth() + 1 }
    fetchDisponibilidadMes()
  }

  function cerrarModal() {
    modalAbierto.value = false
    resetState()
  }

  function resetState() {
    paso.value = 'calendario'
    fechaSeleccionada.value = null
    horaSeleccionada.value = null
    formulario.value = { nombre: '', telefono: '', email: '', direccion: '' }
    citaCreada.value = null
    errorReserva.value = null
  }

  async function fetchDisponibilidadMes() {
    loadingMes.value = true
    errorMes.value = null
    try {
      const result = await citaService.getDisponibilidadMes(
        mesActual.value.anio,
        mesActual.value.mes,
      )
      diasDisponibles.value = result.dias
    } catch (e) {
      errorMes.value = 'Error al cargar disponibilidad.'
      console.error('Failed to fetch month availability:', e)
    } finally {
      loadingMes.value = false
    }
  }

  function navegarMes(delta: number) {
    let { anio, mes } = mesActual.value
    mes += delta
    if (mes > 12) {
      mes = 1
      anio++
    }
    if (mes < 1) {
      mes = 12
      anio--
    }
    mesActual.value = { anio, mes }
    fetchDisponibilidadMes()
  }

  async function seleccionarFecha(fecha: string) {
    fechaSeleccionada.value = fecha
    horaSeleccionada.value = null
    paso.value = 'horario'
    loadingHorarios.value = true
    errorHorarios.value = null
    try {
      const result = await citaService.getDisponibilidadDia(fecha)
      horariosDisponibles.value = result.horarios
    } catch (e) {
      errorHorarios.value = 'Error al cargar horarios.'
      console.error('Failed to fetch day availability:', e)
    } finally {
      loadingHorarios.value = false
    }
  }

  function seleccionarHora(hora: string) {
    horaSeleccionada.value = hora
  }

  function continuarAFormulario() {
    if (fechaSeleccionada.value && horaSeleccionada.value) {
      paso.value = 'formulario'
    }
  }

  function continuarAConfirmacion() {
    if (puedeConfirmar.value) {
      paso.value = 'confirmacion'
    }
  }

  function modificarFechaHora() {
    paso.value = 'calendario'
  }

  async function reservar() {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return
    loadingReserva.value = true
    errorReserva.value = null
    try {
      const payload: CrearCitaPayload = {
        fecha: fechaSeleccionada.value,
        hora: horaSeleccionada.value,
        ...formulario.value,
      }
      const result = await citaService.crear(payload)
      citaCreada.value = result.cita
      paso.value = 'exito'
    } catch (e) {
      errorReserva.value = 'Error al reservar. Intenta de nuevo.'
      console.error('Failed to create appointment:', e)
    } finally {
      loadingReserva.value = false
    }
  }

  return {
    modalAbierto,
    paso,
    mesActual,
    diasDisponibles,
    loadingMes,
    errorMes,
    horariosDisponibles,
    loadingHorarios,
    errorHorarios,
    fechaSeleccionada,
    horaSeleccionada,
    formulario,
    loadingReserva,
    errorReserva,
    citaCreada,
    fechaFormateada,
    puedeConfirmar,
    abrirModal,
    cerrarModal,
    fetchDisponibilidadMes,
    navegarMes,
    seleccionarFecha,
    seleccionarHora,
    continuarAFormulario,
    continuarAConfirmacion,
    modificarFechaHora,
    reservar,
  }
})
