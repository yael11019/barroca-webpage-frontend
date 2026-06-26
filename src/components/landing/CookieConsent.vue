<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { addGtag } from 'vue-gtag'
import { useRoute } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import { initMetaPixel } from '@/utils/metaPixel'

const STORAGE_KEY = 'cookie_consent'
const visible = ref(false)
const { trackScreenView } = useAnalytics()
const route = useRoute()

// Inicializa GA4 y registra la vista de la pantalla actual. Se llama una vez
// que hay consentimiento, porque los eventos enviados antes de addGtag() se
// descartan (GA arranca en modo manual) — incluido el page_view que dispara
// router.afterEach al cargar la app.
function iniciarAnalytics() {
  addGtag()
  trackScreenView((route.name as string | undefined) ?? route.path)
  // Meta Pixel: se inicializa aquí (no en el HTML) para respetar el mismo
  // consentimiento de cookies que GA4. Dispara su primer PageView al iniciar.
  initMetaPixel()
}

onMounted(() => {
  const consent = localStorage.getItem(STORAGE_KEY)
  if (consent === 'accepted') {
    iniciarAnalytics()
  } else if (!consent) {
    visible.value = true
  }
})

function accept() {
  localStorage.setItem(STORAGE_KEY, 'accepted')
  visible.value = false
  iniciarAnalytics()
}

function dismiss() {
  visible.value = false
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-5 left-5 right-5 z-[9999] bg-charcoal text-white p-5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
    >
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-300 text-center sm:text-left">
          Usamos cookies para mejorar tu experiencia y medir el interes en nuestros productos de madera.
          Al continuar, aceptas nuestra
          <RouterLink to="/privacidad" class="text-gold hover:text-gold-dark underline transition-colors">
            politica de privacidad</RouterLink>.
        </p>
        <div class="flex gap-3 flex-shrink-0">
          <button
            @click="dismiss"
            class="px-4 py-2.5 text-sm font-heading font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
          <button
            @click="accept"
            class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-heading font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
