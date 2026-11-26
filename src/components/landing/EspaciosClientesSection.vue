<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import api from '@/services/api'

// ── Galería "Espacios de nuestros clientes" ────────────────────────────────
// Contenido subido por Marketing desde el Gestor de Contenido del ERP.
// Si no hay elementos activos (o falla la carga) la sección no se renderiza.
interface EspacioCliente {
  id: number
  titulo: string | null
  descripcion: string | null
  tipo: 'imagen' | 'video'
  image_url: string | null
  blur_placeholder: string | null
  video_url: string | null
}

const DEFAULT_TITULO = 'Espacios de nuestros clientes'
const DEFAULT_SUBTITULO = 'Así lucen los proyectos que nuestros clientes han creado con melaminas Barroca.'

const items = ref<EspacioCliente[]>([])
// Editables en ERP → Gestor de Contenido → Configuración del sitio
const titulo = ref(DEFAULT_TITULO)
const subtitulo = ref(DEFAULT_SUBTITULO)
const activeIndex = ref<number | null>(null)
const active = computed(() => (activeIndex.value === null ? null : items.value[activeIndex.value] ?? null))

async function fetchItems() {
  try {
    const { data } = await api.get('/api/public/espacios-clientes')
    items.value = (data.data ?? []).filter((i: EspacioCliente) => i.image_url || i.video_url)
    titulo.value = data.titulo?.trim() || DEFAULT_TITULO
    subtitulo.value = data.subtitulo?.trim() || DEFAULT_SUBTITULO
  } catch {
    // Sin contenido disponible: la sección simplemente no aparece
  }
}

function videoType(url: string): string {
  return url.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'
}

function open(i: number) { activeIndex.value = i }
function close() { activeIndex.value = null }
function step(delta: number) {
  if (activeIndex.value === null || items.value.length < 2) return
  const n = items.value.length
  activeIndex.value = (activeIndex.value + delta + n) % n
}

function onKey(e: KeyboardEvent) {
  if (activeIndex.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}

watch(activeIndex, (v) => { document.body.style.overflow = v === null ? '' : 'hidden' })

onMounted(() => {
  fetchItems()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="items.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    <div class="text-center mb-10">
      <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">Proyectos reales</p>
      <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">{{ titulo }}</h3>
      <div class="w-16 h-1 bg-gold mx-auto mb-3"></div>
      <p class="text-gray-500 text-sm max-w-xl mx-auto">{{ subtitulo }}</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      <button
        v-for="(item, i) in items"
        :key="item.id"
        type="button"
        class="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        :aria-label="item.titulo || item.descripcion || (item.tipo === 'video' ? 'Ver video' : 'Ver imagen')"
        @click="open(i)"
      >
        <div class="relative aspect-[4/3] overflow-hidden bg-charcoal">
          <LazyImage
            v-if="item.tipo === 'imagen' && item.image_url"
            :src="item.image_url"
            :blur="item.blur_placeholder ?? undefined"
            :alt="item.titulo || item.descripcion || 'Espacio de cliente'"
            class="w-full h-full"
            img-class="group-hover:scale-105"
          />
          <template v-else-if="item.video_url">
            <!-- Primer cuadro del video como portada -->
            <video
              :src="`${item.video_url}#t=0.5`"
              class="w-full h-full object-cover"
              preload="metadata"
              muted
              playsinline
              aria-hidden="true"
              tabindex="-1"
            />
            <div class="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors flex items-center justify-center">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-charcoal ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </template>

          <!-- Pie con título / descripción -->
          <div
            v-if="item.titulo || item.descripcion"
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 sm:px-4 pt-8 pb-3"
          >
            <p v-if="item.titulo" class="font-heading font-bold text-white text-xs sm:text-sm leading-tight">{{ item.titulo }}</p>
            <p v-if="item.descripcion" class="text-white/80 text-[11px] sm:text-xs leading-snug line-clamp-2 mt-0.5">{{ item.descripcion }}</p>
          </div>
        </div>
      </button>
    </div>
  </div>

  <!-- ── Lightbox ─────────────────────────────────────────────────────── -->
  <Transition name="fade">
    <div
      v-if="active"
      class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <button
        type="button"
        class="absolute top-4 right-4 text-white/70 hover:text-white p-2"
        aria-label="Cerrar"
        @click="close"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <template v-if="items.length > 1">
        <button
          type="button"
          class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          aria-label="Anterior"
          @click="step(-1)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          type="button"
          class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          aria-label="Siguiente"
          @click="step(1)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </template>

      <figure class="w-full max-w-4xl flex flex-col items-center">
        <img
          v-if="active.tipo === 'imagen' && active.image_url"
          :key="`img-${active.id}`"
          :src="active.image_url"
          :alt="active.titulo || active.descripcion || 'Espacio de cliente'"
          class="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
        />
        <div v-else-if="active.video_url" :key="`vid-${active.id}`" class="w-full max-h-[75vh] rounded-lg overflow-hidden bg-black">
          <LazyVideo
            :src="active.video_url"
            :type="videoType(active.video_url)"
            preload="auto"
            autoplay
            class="!w-full max-h-[75vh]"
          />
        </div>
        <figcaption v-if="active.titulo || active.descripcion" class="mt-4 text-center max-w-2xl px-8">
          <p v-if="active.titulo" class="font-heading font-bold text-white text-base">{{ active.titulo }}</p>
          <p v-if="active.descripcion" class="text-gray-300 text-sm leading-relaxed mt-1 whitespace-pre-line">{{ active.descripcion }}</p>
        </figcaption>
      </figure>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
