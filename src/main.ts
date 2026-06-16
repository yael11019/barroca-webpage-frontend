import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'

import App from './App.vue'
import router from './router'
import LazyImage from '@/components/LazyImage.vue'
import LazyVideo from '@/components/LazyVideo.vue'

const app = createApp(App)

app.component('LazyImage', LazyImage)
app.component('LazyVideo', LazyVideo)

app.use(createPinia())
app.use(router)
// ID de medición de GA4 (formato G-XXXXXXXXXX). Se configura por variable de
// entorno para no exponerlo en el código y poder usar IDs distintos por entorno.
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

if (gaMeasurementId) {
  app.use(
    createGtag({
      tagId: gaMeasurementId,
      // El page_view por cambio de ruta se envía manualmente en router.afterEach
      // (composables/useAnalytics → trackScreenView) para conservar los títulos
      // en español de cada sección. Por eso no usamos el pageTracker integrado.
      initMode: 'manual', // Inicia manual hasta que el usuario acepte cookies
    }),
  )
} else if (import.meta.env.DEV) {
  console.warn('[analytics] VITE_GA_MEASUREMENT_ID no está definido; GA4 deshabilitado.')
}

app.mount('#app')
