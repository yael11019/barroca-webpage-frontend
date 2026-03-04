<script setup lang="ts">
import { ref } from 'vue'
import { useNewsletterStore } from '@/stores/newsletter'
import { useAnalytics } from '@/composables/useAnalytics'

const store = useNewsletterStore()
const { trackNewsletterSubscription } = useAnalytics()
const email = ref('')

function handleSubmit() {
  if (!email.value.trim()) return
  store.subscribe(email.value.trim()).then(() => {
    if (store.success) {
      trackNewsletterSubscription(email.value)
      email.value = ''
    }
  })
}
</script>

<template>
  <section class="py-16 md:py-20 bg-charcoal">
    <div class="max-w-xl mx-auto px-4 sm:px-6 text-center">
      <h2 class="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
        Mantente al dia
      </h2>
      <p class="text-gray-400 mb-8">
        Recibe novedades, ofertas especiales y actualizaciones de inventario directamente en tu correo.
      </p>

      <!-- Success state -->
      <div v-if="store.success" class="flex items-center justify-center gap-3 text-green-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-heading font-semibold">Gracias por suscribirte</span>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Tu correo electronico"
            class="flex-1 px-4 py-3 rounded-md bg-charcoal-light border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
          />
          <button
            type="submit"
            :disabled="store.loading"
            class="px-6 py-3 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <div
              v-if="store.loading"
              class="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin"
            ></div>
            Suscribirse
          </button>
        </div>
        <p v-if="store.error" class="text-red-400 text-sm">{{ store.error }}</p>
      </form>
    </div>
  </section>
</template>
