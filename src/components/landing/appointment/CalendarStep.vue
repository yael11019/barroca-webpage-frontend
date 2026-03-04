<script setup lang="ts">
import { computed } from 'vue'
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const nombreMes = computed(() => {
  return `${NOMBRES_MES[store.mesActual.mes - 1]} ${store.mesActual.anio}`
})

const esMesActual = computed(() => {
  const now = new Date()
  return store.mesActual.anio === now.getFullYear() && store.mesActual.mes === now.getMonth() + 1
})

const diasDelMes = computed(() => {
  const { anio, mes } = store.mesActual
  const totalDias = new Date(anio, mes, 0).getDate()
  // getDay() returns 0=Sunday, we want 0=Monday
  let primerDia = new Date(anio, mes - 1, 1).getDay()
  primerDia = primerDia === 0 ? 6 : primerDia - 1

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const celdas: Array<{
    dia: number | null
    fecha: string | null
    disponible: boolean
    esHoy: boolean
    esPasado: boolean
  }> = []

  // Empty cells for offset
  for (let i = 0; i < primerDia; i++) {
    celdas.push({ dia: null, fecha: null, disponible: false, esHoy: false, esPasado: false })
  }

  for (let d = 1; d <= totalDias; d++) {
    const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const fechaObj = new Date(anio, mes - 1, d)
    const esPasado = fechaObj < hoy
    const esHoy = fechaObj.getTime() === hoy.getTime()

    const diaBackend = store.diasDisponibles.find((dd) => dd.fecha === fecha)
    const disponible = !esPasado && (diaBackend?.disponible ?? false)

    celdas.push({ dia: d, fecha, disponible, esHoy, esPasado })
  }

  return celdas
})
</script>

<template>
  <div>
    <!-- Month navigation -->
    <div class="flex items-center justify-between mb-6">
      <button
        :disabled="esMesActual"
        @click="store.navegarMes(-1)"
        class="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h3 class="font-heading font-bold text-charcoal text-lg">{{ nombreMes }}</h3>
      <button
        @click="store.navegarMes(1)"
        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg class="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loadingMes" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.errorMes" class="text-center py-8">
      <p class="text-red-500 text-sm mb-3">{{ store.errorMes }}</p>
      <button
        @click="store.fetchDisponibilidadMes()"
        class="text-gold hover:text-gold-dark font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Calendar grid -->
    <div v-else>
      <!-- Day headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="dia in DIAS_SEMANA"
          :key="dia"
          class="text-center text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider py-2"
        >
          {{ dia }}
        </div>
      </div>

      <!-- Day cells -->
      <div class="grid grid-cols-7 gap-1">
        <div v-for="(celda, idx) in diasDelMes" :key="idx" class="aspect-square">
          <!-- Empty cell -->
          <div v-if="!celda.dia" class="w-full h-full"></div>

          <!-- Day button -->
          <button
            v-else
            :disabled="!celda.disponible"
            @click="celda.disponible && celda.fecha && store.seleccionarFecha(celda.fecha)"
            :class="[
              'w-full h-full rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center',
              celda.disponible
                ? store.fechaSeleccionada === celda.fecha
                  ? 'bg-gold text-charcoal font-bold'
                  : 'hover:bg-gold/10 text-charcoal cursor-pointer'
                : 'text-gray-300 cursor-not-allowed',
              celda.esHoy && store.fechaSeleccionada !== celda.fecha ? 'ring-2 ring-gold' : '',
            ]"
          >
            {{ celda.dia }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
