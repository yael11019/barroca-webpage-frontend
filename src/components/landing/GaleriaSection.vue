<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import api from '@/services/api'

// ── Galería del Home (debajo de "Pisos") ───────────────────────────────────
// Imágenes de procesos / contenido de interés y tutoriales de YouTube, subidos
// por Marketing desde el Gestor de Contenido del ERP.
// Si no hay elementos activos (o falla la carga) la sección no se renderiza.
interface GaleriaItem {
  id: number
  titulo: string | null
  descripcion: string | null
  tipo: 'imagen' | 'youtube'
  image_url: string | null
  blur_placeholder: string | null
  embed_url: string | null
  thumbnail_url: string | null
}

const DEFAULT_TITULO = 'Conoce más de Barroca'
const DEFAULT_SUBTITULO = 'Procesos, tutoriales de aplicación y contenido de interés.'

const items = ref<GaleriaItem[]>([])
const titulo = ref(DEFAULT_TITULO)
const subtitulo = ref(DEFAULT_SUBTITULO)
const activeIndex = ref<number | null>(null)
const active = computed(() => (activeIndex.value === null ? null : items.value[activeIndex.value] ?? null))

async function fetchItems() {
  try {
    const { data } = await api.get('/api/public/galeria')
    items.value = (data.data ?? []).filter((i: GaleriaItem) =>
      i.tipo === 'youtube' ? !!i.embed_url : !!i.image_url,
    )
    titulo.value = data.titulo?.trim() || DEFAULT_TITULO
    subtitulo.value = data.subtitulo?.trim() || DEFAULT_SUBTITULO
  } catch {
    // Sin contenido disponible: la sección simplemente no aparece
  }
}

function altText(item: GaleriaItem): string {
  return item.titulo || item.descripcion || (item.tipo === 'youtube' ? 'Video de Barroca' : 'Imagen de Barroca')
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
  <section v-if="items.length > 0" class="py-20 md:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">{{ titulo }}</h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">{{ subtitulo }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          v-for="(item, i) in items"
          :key="item.id"
          type="button"
          class="group text-left rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          :aria-label="item.tipo === 'youtube' ? `Ver video: ${altText(item)}` : `Ver imagen: ${altText(item)}`"
          @click="open(i)"
        >
          <div class="relative aspect-video overflow-hidden bg-charcoal">
            <LazyImage
              v-if="item.thumbnail_url"
              :src="item.thumbnail_url"
              :blur="item.blur_placeholder ?? undefined"
              :alt="altText(item)"
              class="w-full h-full"
              img-class="group-hover:scale-105"
            />
            <div
              v-if="item.tipo === 'youtube'"
              class="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors flex items-center justify-center"
            >
              <div class="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-charcoal ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div v-if="item.titulo || item.descripcion" class="p-4">
            <p v-if="item.titulo" class="font-heading font-bold text-charcoal text-sm leading-tight mb-1">{{ item.titulo }}</p>
            <p v-if="item.descripcion" class="text-gray-500 text-xs leading-relaxed line-clamp-2">{{ item.descripcion }}</p>
          </div>
        </button>
      </div>
    </div>
  </section>

  <!-- ── Lightbox / reproductor ───────────────────────────────────────── -->
  <Transition name="fade">
    <div
      v-if="active"
      class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <button type="button" class="absolute top-4 right-4 text-white/70 hover:text-white p-2" aria-label="Cerrar" @click="close">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <template v-if="items.length > 1">
        <button
          type="button"
          class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
          aria-label="Anterior"
          @click="step(-1)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          type="button"
          class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
          aria-label="Siguiente"
          @click="step(1)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </template>

      <figure class="w-full max-w-4xl flex flex-col items-center px-8 sm:px-12">
        <div v-if="active.tipo === 'youtube' && active.embed_url" :key="`yt-${active.id}`" class="relative w-full rounded-lg overflow-hidden bg-black" style="padding-bottom: 56.25%">
          <iframe
            :src="`${active.embed_url}?autoplay=1&rel=0`"
            :title="altText(active)"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
        <img
          v-else-if="active.image_url"
          :key="`img-${active.id}`"
          :src="active.image_url"
          :alt="altText(active)"
          class="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
        />
        <figcaption v-if="active.titulo || active.descripcion" class="mt-4 text-center max-w-2xl">
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
