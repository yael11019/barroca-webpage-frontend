<script setup lang="ts">
import { ref } from 'vue'
import type { Producto, Variante } from '@/types/producto'
import { useCarritoStore } from '@/stores/carrito'
import { useAnalytics } from '@/composables/useAnalytics'

const props = defineProps<{
  producto: Producto
}>()

const carrito = useCarritoStore()
const { trackAddToCart, startProductEngagement, endProductEngagement } = useAnalytics()
const selectedVariante = ref<Variante | null>(
  props.producto.variantes?.length ? props.producto.variantes[0] ?? null : null,
)

function formatPrice(precio: string): string {
  const num = parseFloat(precio)
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function agregarAlCarrito() {
  if (!selectedVariante.value) return
  carrito.agregarItem(props.producto, selectedVariante.value)
  trackAddToCart(props.producto.nombre, selectedVariante.value.medida, selectedVariante.value.precio_base)
}
</script>

<template>
  <div
    class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
    @mouseenter="startProductEngagement(producto.nombre)"
    @mouseleave="endProductEngagement()"
  >
    <div class="p-6 flex-1">
      <span class="inline-block bg-gold/10 text-gold-dark text-xs font-heading font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
        {{ producto.categoria }}
      </span>
      <h3 class="font-heading text-lg font-bold text-charcoal mb-2 group-hover:text-gold-dark transition-colors">
        {{ producto.nombre }}
      </h3>
      <p v-if="producto.descripcion" class="text-gray-500 text-sm mb-4 line-clamp-2">
        {{ producto.descripcion }}
      </p>

      <div v-if="producto.variantes && producto.variantes.length > 0" class="mt-4 pt-4 border-t border-gray-100">
        <!-- Variant selector -->
        <label class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2 block">
          Variante
        </label>
        <select
          v-model="selectedVariante"
          class="w-full border border-gray-200 rounded px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold mb-3"
        >
          <option
            v-for="variante in producto.variantes"
            :key="variante.id"
            :value="variante"
          >
            {{ variante.medida }}
            <template v-if="variante.color"> - {{ variante.color }}</template>
            &mdash; {{ formatPrice(variante.precio_base) }}
          </option>
        </select>

        <!-- Price -->
        <p v-if="selectedVariante" class="text-lg font-bold text-charcoal mb-1">
          {{ formatPrice(selectedVariante.precio_base) }}
        </p>
      </div>
    </div>

    <!-- Add to cart button -->
    <div class="px-6 pb-6">
      <button
        v-if="producto.variantes && producto.variantes.length > 0"
        @click="agregarAlCarrito"
        class="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold text-sm uppercase tracking-wider px-4 py-3 rounded transition-colors duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        Agregar al carrito
      </button>
    </div>
  </div>
</template>
