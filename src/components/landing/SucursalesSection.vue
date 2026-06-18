<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useAlmacenesStore } from '@/stores/almacenes'
import { useAnalytics } from '@/composables/useAnalytics'
import { useCitasStore } from '@/stores/citas'
import api from '@/services/api'

// ── Sucursales ─────────────────────────────────────────────────────────────
const store = useAlmacenesStore()
const citas = useCitasStore()
const { trackPhoneClick, trackEmailClick, trackDirectionsClick, trackSucursalSwitch } = useAnalytics()

const almacenesActivos = computed(() => store.almacenes.filter((a) => a.activo))

const directionsUrl = computed(() => {
  if (!store.selected) return ''
  return `https://www.google.com/maps/dir/?api=1&destination=${store.selected.latitud},${store.selected.longitud}`
})

const horarioEntries = computed(() => {
  if (!store.selected?.horarios) return []
  return Object.entries(store.selected.horarios)
})

// ── Agendar visita / llamada ───────────────────────────────────────────────
type TipoAgenda = 'visita' | 'llamada'
const tipoAgenda = ref<TipoAgenda>('visita')

const llamadaForm = ref({ nombre: '', telefono: '', correo: '' })
const llamadaEnviado = ref(false)
const llamadaLoading = ref(false)

async function enviarLlamada() {
  if (!llamadaForm.value.nombre || !llamadaForm.value.telefono) return
  llamadaLoading.value = true
  try {
    await api.post('/api/public/solicitud-llamada', {
      nombre:   llamadaForm.value.nombre,
      telefono: llamadaForm.value.telefono,
      mensaje:  llamadaForm.value.correo || undefined,
    })
    llamadaEnviado.value = true
  } catch {
    // mantiene el form visible para que el usuario reintente
  } finally {
    llamadaLoading.value = false
  }
}

function resetLlamada() {
  llamadaForm.value = { nombre: '', telefono: '', correo: '' }
  llamadaEnviado.value = false
}

// ── Muestrario ─────────────────────────────────────────────────────────────
const muestrarioForm = ref({ nombre: '', telefono: '', correo: '', muestrario: '' })
const muestrarioEnviado = ref(false)
const muestrarioLoading = ref(false)

const opcionesMuestrario = [
  'Melaminas',
  'Pisos SPC',
]

async function enviarMuestrario() {
  if (!muestrarioForm.value.nombre || !muestrarioForm.value.telefono || !muestrarioForm.value.muestrario) return
  muestrarioLoading.value = true
  try {
    await api.post('/api/public/solicitud-muestrario', {
      nombre:   muestrarioForm.value.nombre,
      telefono: muestrarioForm.value.telefono,
      email:    muestrarioForm.value.correo || undefined,
      mensaje:  muestrarioForm.value.muestrario,
    })
    muestrarioEnviado.value = true
  } catch {
    // mantiene el form visible para que el usuario reintente
  } finally {
    muestrarioLoading.value = false
  }
}

function resetMuestrario() {
  muestrarioForm.value = { nombre: '', telefono: '', correo: '', muestrario: '' }
  muestrarioEnviado.value = false
}

onMounted(() => {
  store.fetchAlmacenes()
})
</script>

<template>
  <section id="sucursales" class="bg-white">

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- ── SUCURSALES ──────────────────────────────────────────────────── -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">

      <!-- Encabezado -->
      <div class="text-center mb-12">
        <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Encuéntranos</p>
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Nuestras Sucursales</h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Visítanos en cualquiera de nuestras sucursales o solicita que un asesor te atienda.
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
          @click="store.fetchAlmacenes(true)"
          class="bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>

      <template v-else-if="store.selected">

        <!-- Selector de sucursales -->
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

        <!-- Layout: imagen izquierda + info derecha -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-16">

          <!-- Imagen de la sucursal (del backend) -->
          <LazyImage
            v-if="store.selected.imagen_url"
            :src="store.selected.imagen_url"
            :alt="store.selected.nombre"
            class="rounded-xl overflow-hidden shadow-md w-full h-full min-h-[360px]"
          />
          <!-- Sin imagen: placeholder -->
          <div v-else class="rounded-xl overflow-hidden bg-gray-100 min-h-[360px] flex items-center justify-center shadow-md">
            <div class="text-center text-gray-300 px-6">
              <svg class="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="font-heading text-sm">Foto de la sucursal</p>
            </div>
          </div>

          <!-- Info de la sucursal -->
          <div class="space-y-5">
            <h3 class="font-heading text-2xl font-bold text-charcoal">{{ store.selected.nombre }}</h3>

            <!-- Dirección -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Ubicación</h4>
                <p class="text-gray-500">{{ store.selected.direccion }}</p>
              </div>
            </div>

            <!-- Teléfonos -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Teléfonos</h4>
                <a :href="`tel:${store.selected.telefono1}`" class="block text-gray-500 hover:text-gold transition-colors"
                  @click="trackPhoneClick(store.selected?.telefono1 ?? '', store.selected?.nombre ?? '')">
                  {{ store.selected.telefono1 }}
                </a>
                <a v-if="store.selected.telefono2" :href="`tel:${store.selected.telefono2}`"
                  class="block text-gray-500 hover:text-gold transition-colors"
                  @click="trackPhoneClick(store.selected?.telefono2 ?? '', store.selected?.nombre ?? '')">
                  {{ store.selected.telefono2 }}
                </a>
              </div>
            </div>

            <!-- Email -->
            <div v-if="store.selected.correo" class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 class="font-heading font-bold text-charcoal">Email</h4>
                <a :href="`mailto:${store.selected.correo}`" class="text-gray-500 hover:text-gold transition-colors"
                  @click="trackEmailClick(store.selected?.correo ?? '', store.selected?.nombre ?? '')">
                  {{ store.selected.correo }}
                </a>
              </div>
            </div>

            <!-- Horarios -->
            <div v-if="horarioEntries.length > 0" class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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

            <!-- Botones de acción -->
            <div class="flex flex-wrap gap-3 pt-2">
              <a
                :href="directionsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-5 py-3 rounded transition-colors duration-200 text-sm"
                @click="trackDirectionsClick(store.selected?.nombre ?? '')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Cómo llegar
              </a>
            </div>
          </div>
        </div>

        <!-- ── Agendar visita / llamada + Muestrario ────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

          <!-- Agendar visita o llamada -->
          <div class="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 class="font-heading text-xl font-bold text-charcoal mb-2">¿Quieres que te contactemos?</h3>
            <p class="text-gray-500 text-sm mb-6">Elige cómo prefieres que te atendamos.</p>

            <!-- Radio: visita o llamada -->
            <div class="flex gap-4 mb-6">
              <label
                class="flex-1 flex items-center gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors"
                :class="tipoAgenda === 'visita' ? 'border-gold bg-gold/5' : 'border-gray-200 bg-white hover:border-gold/50'"
              >
                <input type="radio" name="tipoAgenda" value="visita" v-model="tipoAgenda" class="accent-gold w-4 h-4" />
                <div>
                  <p class="font-heading font-bold text-charcoal text-sm">Visita de vendedor</p>
                  <p class="text-xs text-gray-400">Un asesor va a tu ubicación</p>
                </div>
              </label>

              <label
                class="flex-1 flex items-center gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors"
                :class="tipoAgenda === 'llamada' ? 'border-gold bg-gold/5' : 'border-gray-200 bg-white hover:border-gold/50'"
              >
                <input type="radio" name="tipoAgenda" value="llamada" v-model="tipoAgenda" class="accent-gold w-4 h-4" />
                <div>
                  <p class="font-heading font-bold text-charcoal text-sm">Agenda una llamada</p>
                  <p class="text-xs text-gray-400">Te contactamos por teléfono</p>
                </div>
              </label>
            </div>

            <!-- Visita: abre el modal de citas -->
            <button
              v-if="tipoAgenda === 'visita'"
              @click="citas.modalAbierto = true"
              class="w-full bg-verde hover:bg-verde-light text-gold font-heading font-bold uppercase tracking-wider py-3 rounded-xl transition-colors duration-200"
            >
              Agendar visita de vendedor
            </button>

            <!-- Llamada: formulario inline -->
            <div v-else>
              <div v-if="!llamadaEnviado" class="space-y-3 mt-2">
                <div>
                  <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Nombre *
                  </label>
                  <input
                    v-model="llamadaForm.nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Teléfono *
                  </label>
                  <input
                    v-model="llamadaForm.telefono"
                    type="tel"
                    placeholder="Tu número de teléfono"
                    class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    v-model="llamadaForm.correo"
                    type="email"
                    placeholder="tu@correo.com"
                    class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>
                <button
                  @click="enviarLlamada"
                  :disabled="llamadaLoading || !llamadaForm.nombre || !llamadaForm.telefono"
                  class="w-full bg-verde hover:bg-verde-light disabled:opacity-50 disabled:cursor-not-allowed text-gold font-heading font-bold uppercase tracking-wider py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span v-if="llamadaLoading" class="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  {{ llamadaLoading ? 'Enviando...' : 'Solicitar llamada' }}
                </button>
              </div>

              <div v-else class="text-center py-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="font-heading font-bold text-charcoal mb-1">¡Listo! Te llamamos pronto.</p>
                <p class="text-gray-400 text-xs mb-3">Recibimos tu solicitud, te contactamos a la brevedad.</p>
                <button @click="resetLlamada" class="text-xs font-heading font-semibold text-gold hover:text-gold-dark transition-colors">
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          </div>

          <!-- Muestrario -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 class="font-heading text-xl font-bold text-charcoal mb-1">Adquirir Muestrario</h3>
            <p class="text-gray-500 text-sm mb-6">Llena el formulario y nos ponemos en contacto contigo.</p>

            <div v-if="!muestrarioEnviado" class="space-y-4">
              <div>
                <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Nombre *
                </label>
                <input
                  v-model="muestrarioForm.nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Teléfono *
                </label>
                <input
                  v-model="muestrarioForm.telefono"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Correo electrónico
                </label>
                <input
                  v-model="muestrarioForm.correo"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  ¿Qué muestrario te interesa? *
                </label>
                <select
                  v-model="muestrarioForm.muestrario"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white"
                >
                  <option value="" disabled>Selecciona un muestrario</option>
                  <option v-for="opcion in opcionesMuestrario" :key="opcion" :value="opcion">
                    {{ opcion }}
                  </option>
                </select>
              </div>

              <button
                @click="enviarMuestrario"
                :disabled="muestrarioLoading || !muestrarioForm.nombre || !muestrarioForm.telefono || !muestrarioForm.muestrario"
                class="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-charcoal font-heading font-bold uppercase tracking-wider py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span v-if="muestrarioLoading" class="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></span>
                {{ muestrarioLoading ? 'Enviando...' : 'Solicitar muestrario' }}
              </button>
            </div>

            <div v-else class="text-center py-6">
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 class="font-heading font-bold text-charcoal text-lg mb-1">¡Solicitud enviada!</h4>
              <p class="text-gray-500 text-sm mb-5">Nos pondremos en contacto contigo a la brevedad.</p>
              <button
                @click="resetMuestrario"
                class="text-sm font-heading font-semibold text-gold hover:text-gold-dark transition-colors"
              >
                Solicitar otro muestrario
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>
  </section>
</template>
