<script setup lang="ts">
import { ref } from 'vue'
import { useCarritoStore } from '@/stores/carrito'

const menuOpen = ref(false)
const carrito = useCarritoStore()

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Productos', href: '#productos' },
  { label: 'Contacto', href: '#contacto' },
]
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <a href="#inicio" class="flex-shrink-0">
          <img
            src="/img/barroca-logo-amarillo.jpeg"
            alt="Barroca"
            class="h-10 md:h-14 w-auto"
          />
        </a>

        <nav class="hidden md:flex items-center space-x-8">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="font-heading text-sm font-semibold uppercase tracking-wider text-charcoal hover:text-gold transition-colors duration-200"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex items-center gap-2">
          <!-- Cart button -->
          <button
            @click="carrito.toggleCarrito()"
            class="relative p-2 text-charcoal hover:text-gold transition-colors"
            aria-label="Abrir carrito"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span
              v-if="carrito.totalItems > 0"
              class="absolute -top-0.5 -right-0.5 bg-gold text-charcoal text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ carrito.totalItems > 99 ? '99+' : carrito.totalItems }}
            </span>
          </button>

          <!-- Mobile hamburger -->
          <button
            class="md:hidden p-2 text-charcoal"
            @click="menuOpen = !menuOpen"
            :aria-label="menuOpen ? 'Cerrar menu' : 'Abrir menu'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!menuOpen"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav
        v-show="menuOpen"
        class="md:hidden pb-4 border-t border-gray-100"
      >
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="block py-3 font-heading text-sm font-semibold uppercase tracking-wider text-charcoal hover:text-gold transition-colors"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </header>
</template>
