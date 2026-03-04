<script setup lang="ts">
import { useCitasStore } from '@/stores/citas'

const store = useCitasStore()
</script>

<template>
  <section class="py-20 md:py-28 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
          Agenda tu visita o llamada
        </h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-8"></div>
      </div>

      <div class="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <!-- Icon -->
        <div class="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <h3 class="font-heading text-xl font-bold text-charcoal mb-1">
          Visita de vendedor
        </h3>
        <p class="text-gray-400 text-sm mb-4">
          30 mins
          <span class="mx-2">|</span>
          Gratis
        </p>
        <p class="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
          Contactanos para que uno de nuestros vendedores te visiten, o agenda una llamada para que nuestras
          telefonistas pueda apoyarte.
        </p>

        <button
          @click="store.abrirModal()"
          class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-md transition-colors duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Reservar
        </button>
      </div>
    </div>
  </section>
</template>
