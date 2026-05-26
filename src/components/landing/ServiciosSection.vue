<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Mexico from '@svg-maps/mexico'
import api from '@/services/api'

const SERVICIO_API_KEY: Record<string, 'corte' | 'enchapado' | 'afilado' | 'otro'> = {
  cortes:     'corte',
  cubrecantos:'enchapado',
  afilado:    'afilado',
  envio:      'otro',
  asesoria:   'otro',
}

// ── Videos de servicios ────────────────────────────────────────────────────
interface ServiceVideo {
  id: number
  servicio: string
  titulo: string
  descripcion: string
  tipo: 'local' | 'youtube'
  youtube_url: string | null
  embed_url: string | null
  video_url: string | null
  thumbnail_url: string | null
  order: number
}

function getEmbedUrl(video: ServiceVideo): string | null {
  if (video.embed_url) return video.embed_url
  if (!video.youtube_url) return null
  const m = video.youtube_url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

const videos = ref<ServiceVideo[]>([])
const videosLoading = ref(false)
const videoModal = ref<ServiceVideo | null>(null)

async function fetchVideos() {
  if (videosLoading.value) return
  videosLoading.value = true
  try {
    const { data } = await api.get('/api/public/service-videos')
    videos.value = data.data ?? []
  } catch {
    // Sin videos disponibles, la sección simplemente no aparece
  } finally {
    videosLoading.value = false
  }
}

// ── Servicios ──────────────────────────────────────────────────────────────
// tipo: 'estandar'  = disponible para todos
//       'exclusivo' = exclusivo de Melaminas Barroca
const servicios = [
  {
    id: 'envio',
    nombre: 'Envío',
    descripcion: 'Entregamos tu pedido directo donde lo necesites. Servicio disponible exclusivamente en compras realizadas con nosotros.',
    tipo: 'estandar',
    etiqueta: 'Solo en compra con nosotros',
    imagen: '',
    iconColor: 'from-blue-100 to-blue-50',
  },
  {
    id: 'afilado',
    nombre: 'Afilado de Discos',
    descripcion: 'Servicio de afilado profesional de discos de corte. Disponible para todos a través de nuestro aliado Afilados del Bajío.',
    tipo: 'estandar',
    etiqueta: 'Servicio para todos',
    imagen: '',
    iconColor: 'from-stone-100 to-stone-50',
  },
  {
    id: 'cubrecantos',
    nombre: 'Enchapado de Cubrecantos',
    descripcion: 'Servicio de enchapado de cubrecantos con acabado perfecto para tus tableros. Exclusivo de Melaminas Barroca.',
    tipo: 'exclusivo',
    etiqueta: 'Exclusivo Barroca',
    imagen: '',
    iconColor: 'from-amber-100 to-amber-50',
  },
  {
    id: 'cortes',
    nombre: 'Cortes a Medida',
    descripcion: 'Cortes precisos según tus especificaciones. Servicio exclusivo de Melaminas Barroca para proyectos a la medida.',
    tipo: 'exclusivo',
    etiqueta: 'Exclusivo Barroca',
    imagen: '',
    iconColor: 'from-emerald-50 to-teal-50',
  },
  {
    id: 'asesoria',
    nombre: 'Asesoría Personalizada',
    descripcion: 'Solicita una visita a tu negocio. Nuestro equipo va a tu espacio para asesorarte en la elección de materiales. Disponible para cualquier persona.',
    tipo: 'estandar',
    etiqueta: 'Disponible',
    imagen: '',
    iconColor: 'from-purple-50 to-violet-50',
  },
]

// ── Tiempos de entrega ─────────────────────────────────────────────────────
// TODO: actualizar con tiempos reales de logística
const tiempos = [
  {
    zona: 'Zona Metropolitana',
    detalle: 'CDMX y Estado de México',
    tiempo: '1 – 2 días hábiles',
    icono: 'rapido',
  },
  {
    zona: 'Zona Centro',
    detalle: 'Puebla, Morelos, Hidalgo, Querétaro, Guanajuato, Tlaxcala',
    tiempo: '2 – 3 días hábiles',
    icono: 'normal',
  },
  {
    zona: 'Zona Norte',
    detalle: 'Chihuahua, Sonora, Coahuila, Nuevo León, Tamaulipas y más',
    tiempo: '4 – 5 días hábiles',
    icono: 'largo',
  },
  {
    zona: 'Zona Sur / Sureste',
    detalle: 'Oaxaca, Chiapas, Veracruz, Tabasco, Yucatán y más',
    tiempo: '4 – 6 días hábiles',
    icono: 'largo',
  },
]

// ── Mapa (misma cobertura que Distribuidores) ─────────────────────────────
const estadosCobertura = ['cmx', 'mex', 'pue', 'mor', 'hid', 'que', 'gua', 'tla']

function fillEstado(id: string): string {
  return estadosCobertura.includes(id) ? '#FFD225' : '#D1D5DB'
}

// ── Servicios próximamente ─────────────────────────────────────────────────
const proximamente = [
  { nombre: 'Renta de Herramienta', icono: 'herramienta' },
  { nombre: 'Catálogo Digital 3D', icono: 'catalogo' },
  { nombre: 'Seguimiento de Pedido', icono: 'tracking' },
]

onMounted(fetchVideos)

// ── Modal cotización ───────────────────────────────────────────────────────
const modalOpen = ref(false)
const servicioSeleccionado = ref('')
const servicioIdSeleccionado = ref('')

function abrirCotizacion(id: string, nombre: string) {
  servicioIdSeleccionado.value = id
  servicioSeleccionado.value = nombre
  modalOpen.value = true
}

const formEnviado = ref(false)
const formLoading = ref(false)
const formError = ref<string | null>(null)
const form = {
  nombre: ref(''),
  correo: ref(''),
  telefono: ref(''),
  mensaje: ref(''),
}

async function submitForm() {
  formLoading.value = true
  formError.value = null
  try {
    await api.post('/api/public/cotizacion-servicio', {
      nombre:      form.nombre.value,
      telefono:    form.telefono.value,
      email:       form.correo.value || undefined,
      servicio:    SERVICIO_API_KEY[servicioIdSeleccionado.value] ?? 'otro',
      descripcion: form.mensaje.value || undefined,
    })
    formEnviado.value = true
    setTimeout(() => {
      modalOpen.value = false
      formEnviado.value = false
      form.nombre.value = ''
      form.correo.value = ''
      form.telefono.value = ''
      form.mensaje.value = ''
    }, 2500)
  } catch {
    formError.value = 'No se pudo enviar la solicitud. Intenta de nuevo.'
  } finally {
    formLoading.value = false
  }
}
</script>

<template>
  <section id="servicios" class="bg-gray-50">

    <!-- ── Encabezado ──────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12 text-center">
      <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Lo que hacemos</p>
      <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Nuestros Servicios</h2>
      <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
      <p class="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
        Ofrecemos una línea completa de soluciones en materiales para construcción e interiores.
        Desde la venta de productos hasta asesoría especializada y proyectos a la medida.
      </p>
    </div>

    <!-- ── Grid de servicios ───────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="s in servicios"
          :key="s.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
        >
          <!-- Imagen / placeholder -->
          <div :class="`relative h-44 bg-gradient-to-br ${s.iconColor} flex items-center justify-center`">
            <div class="flex flex-col items-center gap-2 opacity-40">

              <!-- Ícono envío -->
              <svg v-if="s.id === 'envio'" class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
              <!-- Ícono afilado de discos -->
              <svg v-else-if="s.id === 'afilado'" class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <!-- Ícono cubrecantos -->
              <svg v-else-if="s.id === 'cubrecantos'" class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
              </svg>
              <!-- Ícono cortes a medida -->
              <svg v-else-if="s.id === 'cortes'" class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/>
              </svg>
              <!-- Ícono asesoría -->
              <svg v-else class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>

              <span class="text-xs font-heading font-semibold uppercase tracking-widest">Imagen próximamente</span>
            </div>

            <!-- Badge tipo -->
            <div class="absolute top-3 right-3">
              <span
                :class="[
                  'text-xs font-heading font-bold px-2.5 py-1 rounded-full',
                  s.tipo === 'exclusivo' ? 'bg-gold text-charcoal' : 'bg-verde text-white',
                ]"
              >
                {{ s.etiqueta }}
              </span>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-5 flex flex-col flex-1">
            <h3 class="font-heading font-bold text-charcoal text-base mb-2">{{ s.nombre }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed flex-1">{{ s.descripcion }}</p>

            <!-- CTA según tipo -->
            <div class="mt-4 flex items-center justify-between gap-2">
              <span
                v-if="s.tipo === 'exclusivo'"
                class="flex items-center gap-1.5 text-gold text-xs font-heading font-semibold"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                Exclusivo Barroca
              </span>
              <span
                v-else
                class="flex items-center gap-1.5 text-verde text-xs font-heading font-semibold"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Servicio disponible
              </span>
              <button
                @click="abrirCotizacion(s.id, s.nombre)"
                class="text-xs font-heading font-semibold text-charcoal border border-charcoal/30 hover:border-gold hover:text-gold px-3 py-1 rounded-full transition-colors"
              >
                Cotizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Videos de servicios ───────────────────────────────────────────── -->
    <div v-if="videosLoading || videos.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="text-center mb-10">
        <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">En acción</p>
        <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Mira cómo trabajamos</h3>
        <div class="w-16 h-1 bg-gold mx-auto"></div>
      </div>

      <!-- Skeleton carga -->
      <div v-if="videosLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-gray-100 rounded-xl animate-pulse aspect-video"></div>
      </div>

      <!-- Grid de videos -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          v-for="video in videos"
          :key="video.id"
          @click="videoModal = video"
          class="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 bg-charcoal text-left"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-video overflow-hidden">
            <LazyImage
              v-if="video.thumbnail_url"
              :src="video.thumbnail_url"
              :alt="video.titulo"
              class="w-full h-full"
              img-class="group-hover:scale-105"
            />
            <div v-else class="w-full h-full bg-charcoal/80 flex items-center justify-center">
              <svg class="w-12 h-12 text-gold/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <!-- Overlay con play -->
            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div class="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-charcoal ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          <!-- Info -->
          <div class="p-4">
            <p class="font-heading font-bold text-white text-sm leading-tight mb-1">{{ video.titulo }}</p>
            <p v-if="video.descripcion" class="text-gray-400 text-xs leading-relaxed line-clamp-2">{{ video.descripcion }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- ── Tiempos de entrega ───────────────────────────────────────────── -->
    <div class="bg-charcoal">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="text-center mb-10">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">Logística</p>
          <h3 class="font-heading text-2xl md:text-3xl font-bold text-white mb-1">Tiempos de Entrega</h3>
          <p class="text-gray-400 text-sm mt-2">
            Estimaciones en días hábiles a partir de la confirmación de pago.
            <!-- TODO: actualizar con tiempos reales de operaciones -->
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="t in tiempos"
            :key="t.zona"
            class="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
          >
            <!-- Ícono de velocidad -->
            <div class="mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="t.icono === 'rapido' ? 'bg-gold' : t.icono === 'normal' ? 'bg-gold/60' : 'bg-white/20'"
              >
                <svg class="w-5 h-5" :class="t.icono === 'largo' ? 'text-white' : 'text-charcoal'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="t.icono === 'rapido'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            <p class="font-heading font-bold text-white text-sm mb-1">{{ t.zona }}</p>
            <p class="text-gold font-heading font-bold text-lg mb-2">{{ t.tiempo }}</p>
            <p class="text-gray-400 text-xs leading-relaxed">{{ t.detalle }}</p>
          </div>
        </div>

        <p class="text-center text-gray-500 text-xs mt-8">
          * Los tiempos pueden variar en temporadas de alta demanda o por condiciones de logística fuera de nuestro control.
        </p>
      </div>
    </div>

    <!-- ── Mapa de cobertura (mismo que distribuidores) ────────────────── -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div class="text-center mb-10">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">Dónde llegamos</p>
          <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Zona de Cobertura</h3>
          <div class="w-16 h-1 bg-gold mx-auto mb-4"></div>
          <p class="text-gray-500 text-sm max-w-lg mx-auto">
            Actualmente contamos con cobertura directa en la zona centro del país.
            Estamos expandiendo nuestra red de distribución a nivel nacional.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-10 items-center">

          <!-- Mapa SVG -->
          <div class="flex-1 min-w-0">
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <svg
                :viewBox="Mexico.viewBox"
                class="w-full max-w-xl mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  v-for="state in Mexico.locations"
                  :key="state.id"
                  :d="state.path"
                  :fill="fillEstado(state.id)"
                  stroke="white"
                  stroke-width="1"
                  stroke-linejoin="round"
                >
                  <title>{{ state.name }}</title>
                </path>
              </svg>
            </div>
          </div>

          <!-- Info de cobertura -->
          <div class="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div class="flex items-start gap-3">
              <span class="w-5 h-5 rounded bg-gold flex-shrink-0 mt-0.5"></span>
              <div>
                <p class="font-heading font-bold text-charcoal text-sm">Cobertura actual</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  CDMX, Estado de México, Puebla, Morelos, Hidalgo, Querétaro, Guanajuato y Tlaxcala.
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-5 h-5 rounded bg-gray-300 flex-shrink-0 mt-0.5"></span>
              <div>
                <p class="font-heading font-bold text-charcoal text-sm">En expansión</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  Jalisco, Nuevo León, Veracruz y más próximamente.
                  Consulta disponibilidad para tu estado.
                </p>
              </div>
            </div>
            <div class="pt-2">
              <a
                href="https://wa.me/524171601530?text=Hola%2C%20me%20gustar%C3%ADa%20consultar%20la%20disponibilidad%20de%20sus%20servicios%20en%20mi%20zona."
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-heading font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Próximamente ────────────────────────────────────────────────── -->
    <div class="bg-gray-50 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="text-center mb-8">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">En desarrollo</p>
          <h3 class="font-heading text-xl md:text-2xl font-bold text-charcoal">+ Servicios que vienen</h3>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="p in proximamente"
            :key="p.nombre"
            class="flex items-center gap-2.5 bg-white border border-dashed border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-400"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-heading font-semibold">{{ p.nombre }}</span>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- ── Modal de video ────────────────────────────────────────────────── -->
  <Transition name="fade">
    <div v-if="videoModal" class="fixed inset-0 bg-black/80 z-[60]" @click="videoModal = null" />
  </Transition>
  <Transition name="modal">
    <div
      v-if="videoModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="videoModal = null"
    >
      <div class="bg-charcoal rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p class="font-heading font-bold text-white text-sm truncate">{{ videoModal.titulo }}</p>
          <button @click="videoModal = null" class="text-white/50 hover:text-white transition-colors p-1 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="relative w-full" style="padding-bottom: 56.25%">
          <!-- Video local (.mov / .mp4) -->
          <LazyVideo
            v-if="videoModal.tipo === 'local' && videoModal.video_url"
            :src="videoModal.video_url"
            :poster="videoModal.thumbnail_url ?? undefined"
            autoplay
            class="absolute inset-0 !w-full !h-full"
          />
          <!-- Video de YouTube -->
          <iframe
            v-else-if="getEmbedUrl(videoModal)"
            :src="`${getEmbedUrl(videoModal)}?autoplay=1&rel=0`"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <div v-else class="absolute inset-0 flex items-center justify-center bg-black/60">
            <p class="text-white/60 text-sm font-heading">Video no disponible</p>
          </div>
        </div>
        <div v-if="videoModal.descripcion" class="px-5 py-4">
          <p class="text-gray-400 text-sm leading-relaxed">{{ videoModal.descripcion }}</p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── Modal cotización ────────────────────────────────────────────────── -->
  <Transition name="fade">
    <div v-if="modalOpen" class="fixed inset-0 bg-black/50 z-[60]" @click="modalOpen = false" />
  </Transition>

  <Transition name="modal">
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="modalOpen = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="font-heading text-base font-bold text-charcoal">Solicitar cotización</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ servicioSeleccionado }}</p>
          </div>
          <button @click="modalOpen = false" class="p-2 text-gray-400 hover:text-charcoal transition-colors">
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
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Nombre *</label>
            <input v-model="form.nombre.value" type="text" required placeholder="Tu nombre completo"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Correo *</label>
              <input v-model="form.correo.value" type="email" required placeholder="correo@ejemplo.com"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
            </div>
            <div>
              <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Teléfono</label>
              <input v-model="form.telefono.value" type="tel" placeholder="+52 55 0000 0000"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-1">Descripción del proyecto *</label>
            <textarea v-model="form.mensaje.value" required rows="3"
              placeholder="Cuéntanos las dimensiones, materiales de interés y zona de instalación…"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gold transition-colors resize-none"/>
          </div>
          <p v-if="formError" class="text-red-500 text-xs text-center">{{ formError }}</p>
          <button type="submit" :disabled="formLoading"
            class="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-charcoal font-heading font-bold py-3 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider flex items-center justify-center gap-2">
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
</style>
