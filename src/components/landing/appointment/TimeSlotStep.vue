<script setup lang="ts">
import { computed } from 'vue'
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const fechaLabel = computed(() => {
  if (!store.fechaSeleccionada) return ''
  const [anio, mes, dia] = store.fechaSeleccionada.split('-').map(Number)
  return `${dia} de ${NOMBRES_MES[mes! - 1]} ${anio}`
})
</script>

<template>
  <div>
    <!-- Selected date header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-400">Fecha seleccionada</p>
        <p class="font-heading font-bold text-charcoal">{{ fechaLabel }}</p>
      </div>
      <button
        @click="store.modificarFechaHora()"
        class="text-gold hover:text-gold-dark font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
      >
        Cambiar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loadingHorarios" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.errorHorarios" class="text-center py-8">
      <p class="text-red-500 text-sm mb-3">{{ store.errorHorarios }}</p>
      <button
        @click="store.fechaSeleccionada && store.seleccionarFecha(store.fechaSeleccionada)"
        class="text-gold hover:text-gold-dark font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Time slots grid -->
    <div v-else>
      <p class="text-sm text-gray-400 mb-4">Selecciona un horario</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        <button
          v-for="slot in store.horariosDisponibles"
          :key="slot.hora"
          :disabled="!slot.disponible"
          @click="slot.disponible && store.seleccionarHora(slot.hora)"
          :class="[
            'px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-150',
            slot.disponible
              ? store.horaSeleccionada === slot.hora
                ? 'bg-gold text-charcoal border-gold font-bold'
                : 'border-gray-200 text-charcoal hover:border-gold hover:bg-gold/10 cursor-pointer'
              : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed',
          ]"
        >
          {{ slot.hora }}
        </button>
      </div>

      <!-- Continue button -->
      <button
        :disabled="!store.horaSeleccionada"
        @click="store.continuarAFormulario()"
        class="w-full bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm py-3 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  </div>
</template>
