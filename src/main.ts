import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
  createGtag({
    tagId: 'GTM-PGBNG2WJ', // TODO: Reemplazar con tu ID de medición de GA4
    pageTracker: { router },
    initMode: 'manual', // Inicia manual hasta que el usuario acepte cookies
  }),
)

app.mount('#app')
