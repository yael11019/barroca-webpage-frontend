<script setup lang="ts">
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()
</script>

<template>
  <div>
    <!-- Service summary card -->
    <div class="bg-gray-50 rounded-lg p-5 mb-6">
      <div class="flex items-start justify-between mb-3">
        <h3 class="font-heading font-bold text-charcoal text-lg">Visita de vendedor</h3>
        <button
          @click="store.modificarFechaHora()"
          class="text-gold hover:text-gold-dark font-heading font-semibold text-xs uppercase tracking-wider transition-colors"
        >
          Modificar
        </button>
      </div>
      <p class="font-heading font-semibold text-charcoal">{{ store.fechaFormateada }}</p>
      <p class="text-sm text-gray-400 mt-1">30 mins <span class="mx-1">|</span> Gratis</p>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-1">
          Miembro del personal
        </p>
        <p class="text-sm font-medium text-charcoal">Agente de Ventas</p>
      </div>

      <p class="text-sm text-gray-500 mt-3">
        El servicio se proporcionara en tu ubicacion
      </p>
    </div>

    <!-- User details -->
    <div class="space-y-3 mb-6">
      <div>
        <p class="text-xs text-gray-400 font-heading uppercase tracking-wider">Direccion</p>
        <p class="text-sm text-charcoal">{{ store.formulario.direccion }}</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs text-gray-400 font-heading uppercase tracking-wider">Nombre</p>
          <p class="text-sm text-charcoal">{{ store.formulario.nombre }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-heading uppercase tracking-wider">Telefono</p>
          <p class="text-sm text-charcoal">{{ store.formulario.telefono }}</p>
        </div>
      </div>
      <div>
        <p class="text-xs text-gray-400 font-heading uppercase tracking-wider">Email</p>
        <p class="text-sm text-charcoal">{{ store.formulario.email }}</p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="store.errorReserva" class="text-red-500 text-sm mb-4">{{ store.errorReserva }}</p>

    <!-- Reserve button -->
    <button
      :disabled="store.loadingReserva"
      @click="store.reservar()"
      class="w-full bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <div
        v-if="store.loadingReserva"
        class="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin"
      ></div>
      Reservar
    </button>
  </div>
</template>
