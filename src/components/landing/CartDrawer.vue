<script setup lang="ts">
import { useCarritoStore } from '@/stores/carrito'
import { useAnalytics } from '@/composables/useAnalytics'

const carrito = useCarritoStore()
const { trackCartOrder, trackWhatsAppClick } = useAnalytics()

function formatPrice(precio: number): string {
  return precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function generarMensajeWhatsApp(): string {
  let msg = 'Hola, me gustaria cotizar los siguientes productos:\n\n'
  for (const item of carrito.items) {
    msg += `- ${item.producto.nombre} (${item.variante.medida}`
    if (item.variante.color) msg += ` - ${item.variante.color}`
    msg += `) x${item.cantidad}\n`
  }
  msg += `\nTotal estimado: ${formatPrice(carrito.totalPrecio)}`
  return encodeURIComponent(msg)
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="carrito.abierto"
      class="fixed inset-0 bg-black/40 z-50"
      @click="carrito.toggleCarrito()"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="carrito.abierto"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          Carrito ({{ carrito.totalItems }})
        </h2>
        <button
          @click="carrito.toggleCarrito()"
          class="p-2 text-gray-400 hover:text-charcoal transition-colors"
          aria-label="Cerrar carrito"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="carrito.items.length === 0" class="flex-1 flex items-center justify-center p-6">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p class="text-gray-400 font-heading">Tu carrito esta vacio</p>
          <button
            @click="carrito.toggleCarrito()"
            class="mt-4 text-gold-dark hover:text-gold font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            Ver productos
          </button>
        </div>
      </div>

      <!-- Items list -->
      <div v-else class="flex-1 overflow-y-auto p-6 space-y-4">
        <div
          v-for="item in carrito.items"
          :key="item.variante.id"
          class="flex gap-4 bg-gray-50 rounded-lg p-4"
        >
          <div class="flex-1 min-w-0">
            <h3 class="font-heading font-bold text-charcoal text-sm truncate">
              {{ item.producto.nombre }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ item.variante.medida }}
              <span v-if="item.variante.color"> - {{ item.variante.color }}</span>
            </p>
            <p class="text-sm font-semibold text-charcoal mt-1">
              {{ formatPrice(parseFloat(item.variante.precio_base)) }}
            </p>

            <!-- Quantity controls -->
            <div class="flex items-center gap-2 mt-2">
              <button
                @click="carrito.actualizarCantidad(item.variante.id, item.cantidad - 1)"
                class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="text-sm font-semibold text-charcoal w-6 text-center">{{ item.cantidad }}</span>
              <button
                @click="carrito.actualizarCantidad(item.variante.id, item.cantidad + 1)"
                class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remove button -->
          <button
            @click="carrito.removerItem(item.variante.id)"
            class="text-gray-300 hover:text-red-500 transition-colors self-start"
            aria-label="Eliminar del carrito"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="carrito.items.length > 0" class="border-t border-gray-100 p-6 space-y-4">
        <!-- Total -->
        <div class="flex items-center justify-between">
          <span class="font-heading font-bold text-charcoal">Total estimado</span>
          <span class="font-heading text-xl font-bold text-charcoal">
            {{ formatPrice(carrito.totalPrecio) }}
          </span>
        </div>

        <!-- WhatsApp order button -->
        <a
          :href="`https://wa.me/524171601530?text=${generarMensajeWhatsApp()}`"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold text-sm uppercase tracking-wider px-4 py-3 rounded transition-colors duration-200"
          @click="trackCartOrder(carrito.totalItems, carrito.totalPrecio); trackWhatsAppClick('Pedido desde carrito')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Pedir por WhatsApp
        </a>

        <!-- Clear cart -->
        <button
          @click="carrito.vaciarCarrito()"
          class="w-full text-center text-sm text-gray-400 hover:text-red-500 font-heading transition-colors"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
