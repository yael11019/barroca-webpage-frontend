<script setup lang="ts">
import { onMounted, computed, ref, reactive } from 'vue'
import Mexico from '@svg-maps/mexico'
import { useAnalytics } from '@/composables/useAnalytics'
import { useConfigStore } from '@/stores/config'
import api from '@/services/api'

const configStore = useConfigStore()
const { trackDirectionsClick, trackWhatsAppClick } = useAnalytics()

// ── Distribuidores: datos del backend ──────────────────────────────────────
interface DistribuidorAPI {
  nombre_dueno: string
  nombre_comercio: string
  domicilio: string
  estado: string
  telefono: string
  correo: string
  is_active: boolean
}

interface Distribuidor {
  id: number
  nombre: string         // nombre_comercio
  dueno: string          // nombre_dueno
  ciudad: string         // domicilio
  estadoId: string | null // id del SVG (o null si el nombre no mapea)
  estadoNombre: string
  telefono: string
  correo: string
}

// Normaliza: minúsculas, sin acentos, sin espacios extra
function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// nombre normalizado del estado → id del SVG (@svg-maps/mexico)
const ESTADO_NOMBRE_A_ID: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const l of Mexico.locations as { id: string; name: string }[]) {
    map[normalizar(l.name)] = l.id
  }
  // Alias para nombres que el backend manda distinto al mapa
  return {
    ...map,
    'ciudad de mexico': 'cmx',
    'cdmx': 'cmx',
    'distrito federal': 'cmx',
    'df': 'cmx',
    'estado de mexico': 'mex',
    'edomex': 'mex',
    'michoacan de ocampo': 'mic',
    'coahuila de zaragoza': 'coa',
    'veracruz de ignacio de la llave': 'ver',
    'nuevo leon': 'nle',
  }
})()

function estadoNombreAId(nombre: string): string | null {
  return ESTADO_NOMBRE_A_ID[normalizar(nombre)] ?? null
}

const distribuidores = ref<Distribuidor[]>([])
const distribuidoresLoading = ref(false)

async function fetchDistribuidores() {
  distribuidoresLoading.value = true
  try {
    const { data } = await api.get('/api/public/distribuidores')
    distribuidores.value = (data.data ?? [])
      .filter((d: DistribuidorAPI) => d.is_active)
      .map((d: DistribuidorAPI, i: number): Distribuidor => ({
        id: i + 1,
        nombre: d.nombre_comercio,
        dueno: d.nombre_dueno,
        ciudad: d.domicilio,
        estadoId: estadoNombreAId(d.estado),
        estadoNombre: d.estado,
        telefono: d.telefono,
        correo: d.correo,
      }))
  } catch {
    distribuidores.value = []
  } finally {
    distribuidoresLoading.value = false
  }
}

// ── Distribuidores: mapa + estado ──────────────────────────────────────────
// La cobertura se deriva de los estados que realmente tienen distribuidores
const estadosConCobertura = computed(() => [
  ...new Set(distribuidores.value.map(d => d.estadoId).filter((id): id is string => !!id)),
])

// Estados sin distribuidor físico pero a los que sí hacemos envíos.
// Salen resaltados en el mapa y, al seleccionarlos, muestran un mensaje de envíos.
const ZONAS_ENVIO_IDS = ['que', 'gua'] // Querétaro, Guanajuato

const estadoSeleccionado = ref<string | null>(null)
const estadoEnvioSeleccionado = ref<string | null>(null)
const estadoSinCoberturaSeleccionado = ref<string | null>(null)
const hoveredState = ref<string | null>(null)

function toggleEstado(id: string) {
  if (estadosConCobertura.value.includes(id)) {
    estadoEnvioSeleccionado.value = null
    estadoSinCoberturaSeleccionado.value = null
    estadoSeleccionado.value = estadoSeleccionado.value === id ? null : id
  } else if (ZONAS_ENVIO_IDS.includes(id)) {
    estadoSeleccionado.value = null
    estadoSinCoberturaSeleccionado.value = null
    estadoEnvioSeleccionado.value = estadoEnvioSeleccionado.value === id ? null : id
  } else {
    estadoSeleccionado.value = null
    estadoEnvioSeleccionado.value = null
    estadoSinCoberturaSeleccionado.value = estadoSinCoberturaSeleccionado.value === id ? null : id
  }
}

function fillEstado(id: string): string {
  if (estadoSeleccionado.value === id) return '#E6BD1F'
  if (estadoEnvioSeleccionado.value === id) return '#0c221f'
  if (estadoSinCoberturaSeleccionado.value === id) return '#B0B4BB'
  if (estadosConCobertura.value.includes(id)) return '#FFD225'
  if (ZONAS_ENVIO_IDS.includes(id)) return '#153830'
  if (hoveredState.value === id) return '#C0C4CB'
  return '#D1D5DB'
}

const badgeName = computed(() => {
  const id = hoveredState.value ?? estadoSeleccionado.value ?? estadoEnvioSeleccionado.value
  if (!id) return null
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === id)?.name ?? null
})

// ── Zoom + Pan ─────────────────────────────────────────────────────────────
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPan = ref({ x: 0, y: 0 })

function zoomIn() { zoomLevel.value = Math.min(4, +(zoomLevel.value + 0.4).toFixed(1)) }
function zoomOut() {
  zoomLevel.value = Math.max(0.8, +(zoomLevel.value - 0.4).toFixed(1))
  if (zoomLevel.value <= 1) { panX.value = 0; panY.value = 0 }
}
function resetZoom() { zoomLevel.value = 1; panX.value = 0; panY.value = 0 }

function getClientPos(e: MouseEvent | TouchEvent) {
  if ('touches' in e) return e.touches[0] ?? { clientX: 0, clientY: 0 }
  return e
}
function startPan(e: MouseEvent | TouchEvent) {
  if (zoomLevel.value <= 1) return
  isPanning.value = true
  const p = getClientPos(e)
  lastPan.value = { x: p.clientX, y: p.clientY }
}
function doPan(e: MouseEvent | TouchEvent) {
  if (!isPanning.value) return
  e.preventDefault()
  const p = getClientPos(e)
  panX.value += p.clientX - lastPan.value.x
  panY.value += p.clientY - lastPan.value.y
  lastPan.value = { x: p.clientX, y: p.clientY }
}
function endPan() { isPanning.value = false }

// ── Distribuidores: filtrado por estado ────────────────────────────────────
const distribuidoresFiltrados = computed(() =>
  estadoSeleccionado.value
    ? distribuidores.value.filter(d => d.estadoId === estadoSeleccionado.value)
    : distribuidores.value,
)

// URL de búsqueda en Google Maps a partir de la dirección + estado
function distribuidorMapsUrl(dist: Distribuidor): string {
  const query = encodeURIComponent([dist.ciudad, dist.estadoNombre].filter(Boolean).join(', '))
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

const nombreEstado = computed(() => {
  if (!estadoSeleccionado.value) return 'Todos los estados'
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === estadoSeleccionado.value)?.name ?? estadoSeleccionado.value
})

const nombreEstadoSinCobertura = computed(() => {
  if (!estadoSinCoberturaSeleccionado.value) return ''
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === estadoSinCoberturaSeleccionado.value)?.name ?? estadoSinCoberturaSeleccionado.value
})

const nombreEstadoEnvio = computed(() => {
  if (!estadoEnvioSeleccionado.value) return ''
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === estadoEnvioSeleccionado.value)?.name ?? estadoEnvioSeleccionado.value
})

// Enlace de WhatsApp para cotizar envíos a la zona seleccionada
const whatsappEnvioUrl = computed(() => {
  const zona = nombreEstadoEnvio.value
  const texto = `Hola, me interesa información sobre envíos de Barroca${zona ? ` a ${zona}` : ''}.`
  return `https://wa.me/524433396659?text=${encodeURIComponent(texto)}`
})

// ── Modal: Solicitud de distribuidor ───────────────────────────────────────
const modalOpen = ref(false)
const formEnviado = ref(false)
const formLoading = ref(false)
const formError = ref<string | null>(null)
const modalEsPrimerDistrib = ref(false)

const form = reactive({
  nombre: '', empresa: '', negocio: '', correo: '', telefono: '', direccion: '',
})

async function submitForm() {
  formLoading.value = true
  formError.value = null
  try {
    await api.post('/api/public/solicitud-distribuidor', {
      nombre_contacto: form.nombre,
      empresa:         form.empresa || undefined,
      telefono:        form.telefono,
      email:           form.correo || undefined,
      ciudad:          form.direccion || undefined,
      tipo_negocio:    form.negocio || undefined,
    })
    formEnviado.value = true
    setTimeout(() => {
      modalOpen.value = false
      formEnviado.value = false
      modalEsPrimerDistrib.value = false
      Object.assign(form, { nombre: '', empresa: '', negocio: '', correo: '', telefono: '', direccion: '' })
    }, 2500)
  } catch {
    formError.value = 'No se pudo enviar la solicitud. Intenta de nuevo.'
  } finally {
    formLoading.value = false
  }
}

function cerrarModal() { modalOpen.value = false; formEnviado.value = false; modalEsPrimerDistrib.value = false }
function abrirModalPrimerDistrib() { modalEsPrimerDistrib.value = true; modalOpen.value = true }

onMounted(() => {
  fetchDistribuidores()
})
</script>

<template>
  <section id="distribuidores" class="bg-white">

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- ── DISTRIBUIDORES ──────────────────────────────────────────────── -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="bg-gray-50 border-y border-gray-100">

      <!-- Hero divisor con imagen de distribución -->
      <div class="relative bg-charcoal overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/60 z-10" />
        <LazyImage
          v-if="configStore.distribucion[0]"
          :src="configStore.distribucion[0].image_url"
          :blur="configStore.distribucion[0].blur_placeholder"
          alt="Red de distribución Barroca"
          class="absolute inset-0 w-full h-full"
        />
        <div v-else class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 800 360" fill="none" preserveAspectRatio="xMidYMid slice">
            <rect width="800" height="360" fill="#3D3D3D"/>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#555" stroke-width="1"/>
            </pattern>
            <rect width="800" height="360" fill="url(#grid)"/>
          </svg>
        </div>
        <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Red de distribución</p>
          <h2 class="font-heading text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
            Encuentra Barroca cerca de ti
          </h2>
          <p class="text-gray-300 text-lg max-w-2xl mx-auto">
            Selecciona un estado para ver los distribuidores autorizados en tu zona.
          </p>
        </div>
      </div>

      <!-- Mapa + lista -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">

        <!-- Layout: mapa arriba en móvil, lista a un lado en desktop -->
        <div class="flex flex-col-reverse lg:flex-row gap-8 items-start">

          <!-- Lista de distribuidores -->
          <div class="w-full lg:w-72 flex-shrink-0">
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-heading font-bold text-charcoal text-sm uppercase tracking-wider leading-tight">
                  {{ estadoEnvioSeleccionado ? nombreEstadoEnvio : estadoSinCoberturaSeleccionado ? nombreEstadoSinCobertura : nombreEstado }}
                </h4>
                <button
                  v-if="estadoSeleccionado || estadoEnvioSeleccionado || estadoSinCoberturaSeleccionado"
                  @click="estadoSeleccionado = null; estadoEnvioSeleccionado = null; estadoSinCoberturaSeleccionado = null"
                  class="text-xs text-gold hover:text-gold-dark font-semibold transition-colors whitespace-nowrap ml-2"
                >
                  Ver todos
                </button>
              </div>

              <!-- Cargando distribuidores -->
              <div v-if="distribuidoresLoading" class="py-8 text-center">
                <div class="inline-block w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                <p class="text-gray-400 text-xs mt-3">Cargando distribuidores...</p>
              </div>

              <!-- Zona con envíos (sin distribuidor físico) -->
              <div v-else-if="estadoEnvioSeleccionado" class="py-8 text-center">
                <div class="w-12 h-12 bg-verde/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-verde" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v5a1 1 0 01-1 1h-1m-4 0H9"/>
                  </svg>
                </div>
                <p class="font-heading font-bold text-charcoal text-sm mb-1">Hacemos envíos a {{ nombreEstadoEnvio }}</p>
                <p class="text-gray-500 text-xs mb-5">
                  Aún no tenemos un distribuidor físico en esta zona, pero contamos con envíos directos. Contáctanos para cotizar tu pedido.
                </p>
                <a
                  :href="whatsappEnvioUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="trackWhatsAppClick(`Envíos ${nombreEstadoEnvio}`)"
                  class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold px-4 py-2 rounded-lg transition-colors text-xs uppercase tracking-wider"
                >
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.477zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Solicitar información
                </a>
              </div>

              <!-- Estado sin cobertura -->
              <div v-else-if="estadoSinCoberturaSeleccionado" class="py-8 text-center">
                <svg class="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p class="text-gray-500 text-sm mb-1">Aún no hay distribuidores en este estado.</p>
                <p class="text-gray-400 text-xs mb-5">¿Te interesa ser el primero?</p>
                <button
                  @click="abrirModalPrimerDistrib"
                  class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold px-4 py-2 rounded-lg transition-colors text-xs uppercase tracking-wider"
                >
                  Quiero ser el primero
                </button>
              </div>

              <div v-else-if="distribuidoresFiltrados.length === 0" class="py-8 text-center">
                <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p class="text-gray-400 text-sm">Sin distribuidores en este estado.</p>
              </div>

              <div v-else class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                <div
                  v-for="dist in distribuidoresFiltrados"
                  :key="dist.id"
                  class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gold/50 transition-colors"
                >
                  <p class="font-heading font-bold text-charcoal text-sm mb-0.5">{{ dist.nombre }}</p>
                  <p v-if="dist.dueno" class="text-gray-500 text-xs">{{ dist.dueno }}</p>
                  <a
                    :href="distribuidorMapsUrl(dist)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group/addr flex items-start gap-1.5 text-gray-400 hover:text-gold text-xs mb-2 transition-colors"
                    @click="trackDirectionsClick(dist.nombre)"
                  >
                    <svg class="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="underline-offset-2 group-hover/addr:underline">{{ dist.ciudad }}</span>
                  </a>
                  <div class="space-y-1">
                    <a :href="`tel:${dist.telefono}`" class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold transition-colors">
                      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {{ dist.telefono }}
                    </a>
                    <a :href="`mailto:${dist.correo}`" class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold transition-colors">
                      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      {{ dist.correo }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mapa SVG -->
          <div class="flex flex-1 flex-col w-full min-w-0">

            <!-- Controles de zoom + badge flotante -->
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="flex-1 h-7 flex items-center">
                <Transition name="badge">
                  <div
                    v-if="badgeName"
                    class="inline-flex items-center gap-1.5 bg-charcoal text-white text-xs font-heading font-semibold px-3 py-1.5 rounded-full shadow"
                  >
                    <span class="w-2 h-2 rounded-full bg-gold inline-block"></span>
                    {{ badgeName }}
                  </div>
                </Transition>
              </div>

              <div class="flex items-center gap-1">
                <button
                  @click="zoomOut"
                  :disabled="zoomLevel <= 0.8"
                  class="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-charcoal hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Alejar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                </button>
                <span class="text-xs text-gray-400 font-heading w-10 text-center">
                  {{ Math.round(zoomLevel * 100) }}%
                </span>
                <button
                  @click="zoomIn"
                  :disabled="zoomLevel >= 4"
                  class="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-charcoal hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Acercar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
                <button
                  v-if="zoomLevel !== 1 || panX !== 0 || panY !== 0"
                  @click="resetZoom"
                  class="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors ml-1"
                  aria-label="Restablecer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Leyenda -->
            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 px-1 text-xs">
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-sm bg-gold inline-block"></span>
                <span class="text-gray-500">Con distribuidor</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-sm bg-verde inline-block"></span>
                <span class="text-gray-500">Con envíos</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-sm bg-gray-300 inline-block"></span>
                <span class="text-gray-500">Sin cobertura</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-sm bg-[#E6BD1F] inline-block"></span>
                <span class="text-gray-500">Seleccionado</span>
              </span>
            </div>

            <!-- Contenedor del mapa con zoom/pan -->
            <div
              class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
              :style="{ cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default' }"
              @mousedown="startPan"
              @mousemove="doPan"
              @mouseup="endPan"
              @mouseleave="endPan"
              @touchstart.passive="startPan"
              @touchmove="doPan"
              @touchend="endPan"
            >
              <div
                :style="{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.2s ease',
                }"
              >
                <svg
                  :viewBox="Mexico.viewBox"
                  class="w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    v-for="state in Mexico.locations"
                    :key="state.id"
                    :id="`state-${state.id}`"
                    :d="state.path"
                    :fill="fillEstado(state.id)"
                    stroke="white"
                    stroke-width="1"
                    stroke-linejoin="round"
                    class="cursor-pointer"
                    style="transition: fill 0.15s"
                    @click="toggleEstado(state.id)"
                    @mouseenter="hoveredState = state.id"
                    @mouseleave="hoveredState = null"
                  >
                    <title>{{ state.name }}</title>
                  </path>
                </svg>
              </div>
            </div>

            <p class="text-center text-xs text-gray-400 mt-2">
              {{ zoomLevel > 1 ? 'Arrastra para mover el mapa' : 'Toca un estado amarillo para filtrar' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- ── CTA: ¿Quieres ser distribuidor? ──────────────────────────────── -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="bg-charcoal">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h3 class="font-heading text-2xl md:text-3xl font-bold text-gold mb-3">¿Quieres ser distribuidor?</h3>
        <p class="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto">
          Únete a nuestra red de distribuidores y ofrece a tus clientes los mejores materiales del mercado. Cuéntanos de tu negocio y te damos toda la información.
        </p>
        <button
          @click="modalOpen = true"
          class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold px-8 py-4 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Solicitar información
        </button>
      </div>
    </div>

  </section>

  <!-- ── Modal: Solicitud de distribuidor ─────────────────────────────────── -->
  <Transition name="fade">
    <div v-if="modalOpen" class="fixed inset-0 bg-black/50 z-[60]" @click="cerrarModal" />
  </Transition>

  <Transition name="modal">
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-heading text-lg font-bold text-charcoal">
            {{ modalEsPrimerDistrib ? `Sé el primer distribuidor en ${nombreEstadoSinCobertura}` : 'Solicitud de distribuidor' }}
          </h2>
          <button @click="cerrarModal" class="p-2 text-gray-400 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="formEnviado" class="px-6 py-12 text-center">
          <div class="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="font-heading font-bold text-charcoal text-xl mb-2">¡Solicitud enviada!</h3>
          <p class="text-gray-500 text-sm">Nos pondremos en contacto contigo a la brevedad.</p>
        </div>

        <form v-else @submit.prevent="submitForm" class="px-6 py-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Nombre *</label>
              <input v-model="form.nombre" type="text" required placeholder="Tu nombre completo"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
            </div>
            <div>
              <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Teléfono *</label>
              <input v-model="form.telefono" type="tel" required placeholder="+52 55 0000 0000"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Correo *</label>
            <input v-model="form.correo" type="email" required placeholder="correo@ejemplo.com"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
          </div>
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Empresa</label>
            <input v-model="form.empresa" type="text" placeholder="Nombre de tu empresa (opcional)"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
          </div>
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Giro / Negocio *</label>
            <input v-model="form.negocio" type="text" required placeholder="Ej. Marmolería, Constructora, Ferretería…"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
          </div>
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Dirección *</label>
            <input v-model="form.direccion" type="text" required placeholder="Ciudad, Estado"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
          </div>
          <p v-if="formError" class="text-red-500 text-xs text-center">{{ formError }}</p>
          <button type="submit" :disabled="formLoading"
            class="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-charcoal font-heading font-bold py-3 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider mt-2 flex items-center justify-center gap-2">
            <span v-if="formLoading" class="w-4 h-4 border-2 border-charcoal/40 border-t-charcoal rounded-full animate-spin"/>
            {{ formLoading ? 'Enviando...' : 'Enviar solicitud' }}
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.badge-enter-active, .badge-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.badge-enter-from, .badge-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
