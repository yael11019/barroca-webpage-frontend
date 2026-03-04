<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAlmacenesStore } from '@/stores/almacenes'
import { useAnalytics } from '@/composables/useAnalytics'

const store = useAlmacenesStore()
const { trackPhoneClick, trackEmailClick, trackDirectionsClick, trackSucursalSwitch } = useAnalytics()

const almacenesActivos = computed(() => store.almacenes.filter((a) => a.activo))

const mapEmbedUrl = computed(() => {
  if (!store.selected) return ''
  const lat = store.selected.latitud
  const lng = store.selected.longitud
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`
})

const directionsUrl = computed(() => {
  if (!store.selected) return ''
  const lat = store.selected.latitud
  const lng = store.selected.longitud
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
})

const horarioEntries = computed(() => {
  if (!store.selected?.horarios) return []
  return Object.entries(store.selected.horarios)
})

onMounted(() => {
  store.fetchAlmacenes()
})
</script>

<template>
  <section id="contacto" class="py-20 md:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
          Contacto
        </h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-8"></div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Visitanos en cualquiera de nuestras sucursales
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="text-center py-12">
        <div class="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-500">Cargando sucursales...</p>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ store.error }}</p>
        <button
          @click="store.fetchAlmacenes()"
          class="bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>

      <template v-else-if="store.selected">
        <!-- Warehouse selector tabs -->
        <div v-if="almacenesActivos.length > 1" class="flex flex-wrap justify-center gap-3 mb-10">
          <button
            v-for="almacen in almacenesActivos"
            :key="almacen.id"
            :class="[
              'px-5 py-2 rounded-full font-heading text-sm font-semibold uppercase tracking-wider transition-colors duration-200',
              store.selected?.id === almacen.id
                ? 'bg-gold text-charcoal'
                : 'bg-white text-gray-600 hover:bg-gold/10 hover:text-gold-dark border border-gray-200',
            ]"
            @click="store.selectAlmacen(almacen); trackSucursalSwitch(almacen.nombre)"
          >
            {{ almacen.nombre }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <!-- Contact info -->
          <div class="space-y-6">
            <!-- Nombre -->
            <div>
              <h3 class="font-heading text-xl font-bold text-charcoal mb-1">
                {{ store.selected.nombre }}
              </h3>
            </div>

            <!-- Direccion -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Ubicacion</h4>
                <p class="text-gray-500">{{ store.selected.direccion }}</p>
              </div>
            </div>

            <!-- Telefonos -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Telefonos</h4>
                <p class="text-gray-500">
                  <a :href="`tel:${store.selected.telefono1}`" class="hover:text-gold transition-colors" @click="trackPhoneClick(store.selected.telefono1, store.selected.nombre)">
                    {{ store.selected.telefono1 }}
                  </a>
                </p>
                <p v-if="store.selected.telefono2" class="text-gray-500">
                  <a :href="`tel:${store.selected.telefono2}`" class="hover:text-gold transition-colors" @click="trackPhoneClick(store.selected.telefono2 ?? '', store.selected.nombre)">
                    {{ store.selected.telefono2 }}
                  </a>
                </p>
              </div>
            </div>

            <!-- Email -->
            <div v-if="store.selected.correo" class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Email</h4>
                <p class="text-gray-500">
                  <a :href="`mailto:${store.selected.correo}`" class="hover:text-gold transition-colors" @click="trackEmailClick(store.selected.correo ?? '', store.selected.nombre)">
                    {{ store.selected.correo }}
                  </a>
                </p>
              </div>
            </div>

            <!-- Horarios -->
            <div v-if="horarioEntries.length > 0" class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Horario</h4>
                <p v-for="[dia, hora] in horarioEntries" :key="dia" class="text-gray-500 text-sm">
                  <span class="font-medium text-charcoal">{{ dia }}:</span> {{ hora }}
                </p>
              </div>
            </div>

            <!-- Como llegar button -->
            <a
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors duration-200 mt-4"
              @click="trackDirectionsClick(store.selected?.nombre ?? '')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Como llegar
            </a>
          </div>

          <!-- Map -->
          <div class="bg-gray-100 rounded-lg overflow-hidden min-h-[400px] shadow-md">
            <iframe
              v-if="mapEmbedUrl"
              :src="mapEmbedUrl"
              class="w-full h-full min-h-[400px]"
              style="border: 0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              :title="`Ubicacion de ${store.selected.nombre}`"
            ></iframe>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
