<script setup lang="ts">
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()
</script>

<template>
  <div>
    <!-- Date/time summary -->
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <p class="font-heading font-bold text-charcoal">Visita de vendedor</p>
        <p class="text-sm text-gray-500">{{ store.fechaFormateada }}</p>
        <p class="text-xs text-gray-400 mt-0.5">30 mins | Gratis</p>
      </div>
      <button
        @click="store.modificarFechaHora()"
        class="text-gold hover:text-gold-dark font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
      >
        Modificar
      </button>
    </div>

    <!-- Form -->
    <div class="space-y-4">
      <div>
        <label class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-1.5 block">
          Direccion (donde se realizara la visita)
        </label>
        <textarea
          v-model="store.formulario.direccion"
          rows="2"
          placeholder="Calle, numero, colonia, ciudad..."
          class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
        ></textarea>
      </div>

      <div>
        <label class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-1.5 block">
          Nombre completo
        </label>
        <input
          v-model="store.formulario.nombre"
          type="text"
          placeholder="Tu nombre"
          class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
      </div>

      <div>
        <label class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-1.5 block">
          Telefono
        </label>
        <input
          v-model="store.formulario.telefono"
          type="tel"
          placeholder="+52 417 123 4567"
          class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
      </div>

      <div>
        <label class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-1.5 block">
          Correo electronico
        </label>
        <input
          v-model="store.formulario.email"
          type="email"
          placeholder="tu@correo.com"
          class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
      </div>
    </div>

    <!-- Continue button -->
    <button
      :disabled="!store.puedeConfirmar"
      @click="store.continuarAConfirmacion()"
      class="w-full mt-6 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm py-3 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Continuar
    </button>
  </div>
</template>
