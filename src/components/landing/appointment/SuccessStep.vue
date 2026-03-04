<script setup lang="ts">
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()
</script>

<template>
  <div class="text-center py-6">
    <!-- Checkmark -->
    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h3 class="font-heading text-xl font-bold text-charcoal mb-2">
      Tu cita ha sido reservada
    </h3>
    <p class="text-gray-500 text-sm mb-6">
      Te contactaremos para confirmar los detalles de tu visita.
    </p>

    <!-- Summary -->
    <div class="bg-gray-50 rounded-lg p-4 text-left mb-6 max-w-sm mx-auto">
      <p class="font-heading font-bold text-charcoal text-sm">Visita de vendedor</p>
      <p class="text-sm text-gray-500 mt-1">{{ store.fechaFormateada }}</p>
      <p class="text-xs text-gray-400 mt-0.5">30 mins | Gratis</p>
      <p class="text-sm text-gray-500 mt-2">{{ store.formulario.direccion }}</p>
    </div>

    <button
      @click="store.cerrarModal()"
      class="px-8 py-3 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm rounded-md transition-colors"
    >
      Cerrar
    </button>
  </div>
</template>
