<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import Mexico from '@svg-maps/mexico'

// ── Modal ──────────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const formEnviado = ref(false)

const form = reactive({
  nombre: '', empresa: '', negocio: '', correo: '', telefono: '', direccion: '',
})

function submitForm() {
  formEnviado.value = true
  setTimeout(() => {
    modalOpen.value = false
    formEnviado.value = false
    modalEsPrimerDistrib.value = false
    Object.assign(form, { nombre: '', empresa: '', negocio: '', correo: '', telefono: '', direccion: '' })
  }, 2500)
}

function cerrarModal() { modalOpen.value = false; formEnviado.value = false; modalEsPrimerDistrib.value = false }

function abrirModalPrimerDistrib() { modalEsPrimerDistrib.value = true; modalOpen.value = true }

// ── Estados con cobertura ──────────────────────────────────────────────────
const estadosConCobertura = ['cmx', 'mex', 'pue', 'mor', 'hid', 'que', 'gua', 'tla']

const estadoSeleccionado = ref<string | null>(null)
const estadoSinCoberturaSeleccionado = ref<string | null>(null)
const hoveredState = ref<string | null>(null)
const modalEsPrimerDistrib = ref(false)

function toggleEstado(id: string) {
  if (estadosConCobertura.includes(id)) {
    estadoSinCoberturaSeleccionado.value = null
    estadoSeleccionado.value = estadoSeleccionado.value === id ? null : id
  } else {
    estadoSeleccionado.value = null
    estadoSinCoberturaSeleccionado.value = estadoSinCoberturaSeleccionado.value === id ? null : id
  }
}

function fillEstado(id: string): string {
  if (estadoSeleccionado.value === id) return '#E6BD1F'
  if (estadoSinCoberturaSeleccionado.value === id) return '#B0B4BB'
  if (estadosConCobertura.includes(id)) return '#FFD225'
  if (hoveredState.value === id) return '#C0C4CB'
  return '#D1D5DB'
}

// Badge: muestra el estado hover o el seleccionado
const badgeName = computed(() => {
  const id = hoveredState.value ?? estadoSeleccionado.value
  if (!id) return null
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === id)?.name ?? null
})


// ── Zoom + Pan ─────────────────────────────────────────────────────────────
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPan = ref({ x: 0, y: 0 })

function zoomIn() {
  zoomLevel.value = Math.min(4, +(zoomLevel.value + 0.4).toFixed(1))
}
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

// ── Distribuidores ─────────────────────────────────────────────────────────
const distribuidores = [
  { id: 1, nombre: 'Mármoles del Centro',    estadoId: 'cmx', ciudad: 'Benito Juárez, CDMX',            telefono: '+52 55 1234 5678', correo: 'marmoles.centro@ejemplo.com' },
  { id: 2, nombre: 'Piedra & Estilo',         estadoId: 'cmx', ciudad: 'Miguel Hidalgo, CDMX',           telefono: '+52 55 8765 4321', correo: 'piedraestilo@ejemplo.com' },
  { id: 3, nombre: 'Cantera Toluca',           estadoId: 'mex', ciudad: 'Toluca',                         telefono: '+52 72 2345 6789', correo: 'cantera.toluca@ejemplo.com' },
  { id: 4, nombre: 'Ecatepec Materiales',      estadoId: 'mex', ciudad: 'Ecatepec',                       telefono: '+52 55 3456 7890', correo: 'ecatepec.mat@ejemplo.com' },
  { id: 5, nombre: 'Revestimientos Poblanos',  estadoId: 'pue', ciudad: 'Puebla de Zaragoza',             telefono: '+52 22 4567 8901', correo: 'rev.poblanos@ejemplo.com' },
  { id: 6, nombre: 'Bajío Piedra Natural',     estadoId: 'gua', ciudad: 'León, Guanajuato',               telefono: '+52 47 5678 9012', correo: 'bajio.piedra@ejemplo.com' },
  { id: 7, nombre: 'Querétaro Mármol',         estadoId: 'que', ciudad: 'Santiago de Querétaro',          telefono: '+52 44 6789 0123', correo: 'qro.marmol@ejemplo.com' },
  { id: 8, nombre: 'Sur de Morelos',           estadoId: 'mor', ciudad: 'Cuernavaca',                     telefono: '+52 77 7890 1234', correo: 'surmorelos@ejemplo.com' },
  { id: 9, nombre: 'Hidalgo Canteras',         estadoId: 'hid', ciudad: 'Pachuca',                        telefono: '+52 77 8901 2345', correo: 'hidalgo.cant@ejemplo.com' },
  { id: 10, nombre: 'Tlaxcala Materiales',     estadoId: 'tla', ciudad: 'Tlaxcala de Xicohténcatl',       telefono: '+52 24 9012 3456', correo: 'tlax.mat@ejemplo.com' },
]

const distribuidoresFiltrados = computed(() =>
  estadoSeleccionado.value
    ? distribuidores.filter(d => d.estadoId === estadoSeleccionado.value)
    : distribuidores,
)

const nombreEstado = computed(() => {
  if (!estadoSeleccionado.value) return 'Todos los estados'
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === estadoSeleccionado.value)?.name ?? estadoSeleccionado.value
})

const nombreEstadoSinCobertura = computed(() => {
  if (!estadoSinCoberturaSeleccionado.value) return ''
  return Mexico.locations.find((l: { id: string; name: string }) => l.id === estadoSinCoberturaSeleccionado.value)?.name ?? estadoSinCoberturaSeleccionado.value
})

// Chips: nombre legible de cada estado con cobertura
const chipsCobertura = estadosConCobertura.map(id => ({
  id,
  name: Mexico.locations.find((l: { id: string; name: string }) => l.id === id)?.name ?? id,
}))
</script>

<template>
  <section id="distribuidores" class="bg-white">

    <!-- ── Hero ───────────────────────────────────────────────────────── -->
    <div class="relative bg-charcoal overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/60 z-10" />
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 800 360" fill="none" preserveAspectRatio="xMidYMid slice">
          <rect width="800" height="360" fill="#3D3D3D"/>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#555" stroke-width="1"/>
          </pattern>
          <rect width="800" height="360" fill="url(#grid)"/>
          <circle cx="400" cy="140" r="48" stroke="#FFD225" stroke-width="3" fill="none"/>
          <path d="M 374 140 L 400 114 L 426 140 L 426 178 L 374 178 Z" stroke="#FFD225" stroke-width="3" fill="none"/>
          <rect x="388" y="152" width="24" height="26" stroke="#FFD225" stroke-width="2" fill="none"/>
          <text x="400" y="232" text-anchor="middle" fill="#FFD225" font-family="Montserrat,sans-serif" font-size="12" font-weight="600" letter-spacing="3">IMAGEN PRÓXIMAMENTE</text>
        </svg>
      </div>
      <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Red de distribución</p>
        <h2 class="font-heading text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
          Lleva Barroca a tu negocio
        </h2>
        <p class="text-gray-300 text-lg mb-8 max-w-xl">
          Únete a nuestra red de distribuidores y ofrece a tus clientes materiales de la más alta calidad.
        </p>
        <button
          @click="modalOpen = true"
          class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold px-6 py-3 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Solicitar información
        </button>
      </div>
    </div>

    <!-- ── Cobertura ───────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">

      <div class="text-center mb-10">
        <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Cobertura Nacional</h3>
        <div class="w-16 h-1 bg-gold mx-auto mb-4"></div>
        <p class="text-gray-500 max-w-xl mx-auto text-sm">
          Selecciona un estado para ver los distribuidores disponibles en esa zona.
        </p>
      </div>

      <!-- ── MÓVIL: chips de estados ──────────────────────────────────── -->
      <div class="md:hidden mb-6">
        <p class="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-3">Estados con cobertura</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="chip in chipsCobertura"
            :key="chip.id"
            @click="toggleEstado(chip.id)"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-heading font-semibold border transition-all duration-150',
              estadoSeleccionado === chip.id
                ? 'bg-gold border-gold-dark text-charcoal shadow-sm'
                : 'bg-white border-gray-200 text-charcoal hover:border-gold hover:text-gold',
            ]"
          >
            {{ chip.name }}
          </button>
        </div>
        <button
          v-if="estadoSeleccionado"
          @click="estadoSeleccionado = null"
          class="mt-3 text-xs text-gold hover:text-gold-dark font-semibold transition-colors"
        >
          ✕ Limpiar filtro
        </button>
      </div>

      <!-- ── Layout lista + mapa ─────────────────────────────────────── -->
      <div class="flex flex-col lg:flex-row gap-8 items-start">

        <!-- Lista de distribuidores -->
        <div class="w-full lg:w-72 flex-shrink-0">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-heading font-bold text-charcoal text-sm uppercase tracking-wider leading-tight">
                {{ estadoSinCoberturaSeleccionado ? nombreEstadoSinCobertura : nombreEstado }}
              </h4>
              <button
                v-if="estadoSeleccionado || estadoSinCoberturaSeleccionado"
                @click="estadoSeleccionado = null; estadoSinCoberturaSeleccionado = null"
                class="text-xs text-gold hover:text-gold-dark font-semibold transition-colors whitespace-nowrap ml-2"
              >
                Ver todos
              </button>
            </div>

            <!-- Estado sin cobertura -->
            <div v-if="estadoSinCoberturaSeleccionado" class="py-8 text-center">
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
                class="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:border-gold/50 transition-colors"
              >
                <p class="font-heading font-bold text-charcoal text-sm mb-0.5">{{ dist.nombre }}</p>
                <p class="text-gray-400 text-xs mb-2">{{ dist.ciudad }}</p>
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

        <!-- Mapa SVG (solo desktop) -->
        <div class="hidden md:flex flex-1 flex-col min-w-0">

          <!-- Controles de zoom + badge flotante -->
          <div class="flex items-center justify-between mb-2 px-1">

            <!-- Badge nombre de estado -->
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

            <!-- Botones zoom -->
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
          <div class="flex items-center gap-5 mb-3 px-1 text-xs">
            <span class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 rounded-sm bg-gold inline-block"></span>
              <span class="text-gray-500">Con cobertura</span>
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
            class="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
            style="cursor: grab"
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
                <!-- Estado paths -->
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
            {{ zoomLevel > 1 ? 'Arrastra para mover el mapa' : 'Haz clic en un estado amarillo para filtrar' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Datos de contacto ────────────────────────────────────────────── -->
    <div class="bg-gray-50 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <p class="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">Teléfono</p>
            <a href="tel:+525512345678" class="text-gray-500 hover:text-gold transition-colors">+52 55 1234 5678</a>
          </div>
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">Correo</p>
            <a href="mailto:distribuidores@barroca.mx" class="text-gray-500 hover:text-gold transition-colors">distribuidores@barroca.mx</a>
          </div>
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">Horario</p>
            <p class="text-gray-500">Lun – Vie, 9:00 – 18:00</p>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- ── Modal ──────────────────────────────────────────────────────────── -->
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
          <button type="submit"
            class="w-full bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold py-3 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider mt-2">
            Enviar solicitud
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
