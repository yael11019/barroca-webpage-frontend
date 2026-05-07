<script setup lang="ts">
import { onMounted, ref, computed, watch, reactive } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useNavigation } from '@/composables/useNavigation'
import { useAnalytics } from '@/composables/useAnalytics'
import type { ProductoCatalogo, ColorCatalogo } from '@/types/producto'
import { imageUrl } from '@/utils/imageUrl'
import api from '@/services/api'
import type { ImagenCatalogo } from '@/types/producto'

// ── Leyendas de imágenes ──────────────────────────────────────────────────────
const LEYENDAS: Record<string, string> = {
  ai_render: 'Imagen ilustrativa generada con inteligencia artificial',
  accesorios_por_separado: 'Los accesorios mostrados se venden por separado',
}

function getLeyenda(img: ImagenCatalogo | undefined): string | null {
  return img?.legend ? (LEYENDAS[img.legend] ?? null) : null
}

// ── Fichas Técnicas ───────────────────────────────────────────────────────────
interface FichaTecnica {
  id: number
  titulo: string
  descripcion?: string
  categoria: string
  download_url: string
  order: number
}

const fichasOpen = ref(false)
const fichasCategoria = ref('')
const fichasData = ref<FichaTecnica[]>([])
const fichasLoading = ref(false)
const fichasCache = reactive<Record<string, FichaTecnica[]>>({})

async function openFichas(producto: ProductoCatalogo) {
  const cat = (producto.tipo ?? 'general').toLowerCase().replace(/\s+/g, '_')
  fichasCategoria.value = producto.tipo ?? ''
  fichasOpen.value = true

  if (fichasCache[cat]) {
    fichasData.value = fichasCache[cat]
    return
  }

  fichasLoading.value = true
  fichasData.value = []
  try {
    const { data } = await api.get('/api/public/fichas-tecnicas', { params: { categoria: cat } })
    fichasCache[cat] = data.data ?? []
    fichasData.value = fichasCache[cat] ?? []
  } catch {
    fichasData.value = []
  } finally {
    fichasLoading.value = false
  }
}

const store = useProductosStore()
const { catalogFilter, navigateTo } = useNavigation()
const { trackCategoryFilter, trackWhatsAppClick } = useAnalytics()

// ── Tabs fijos ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'MELAMINA',  label: 'Melaminas' },
  { key: 'PISO',      label: 'Piso' },
]
const activeTab = ref('todos')

watch(
  catalogFilter,
  (filter) => {
    if (!filter) return
    const [categoria] = filter.split(':')
    const key = categoria?.toUpperCase()
    if (key && TABS.some(t => t.key === key)) activeTab.value = key
  },
  { immediate: true },
)

// ── Productos filtrados por tab ───────────────────────────────────────────────
const productosActivos = computed(() => {
  const validos = store.productos.filter((p: ProductoCatalogo) => p.tipo && p.colores.length > 0)
  if (activeTab.value === 'todos') return validos
  return validos.filter((p: ProductoCatalogo) => p.tipo?.toUpperCase().startsWith(activeTab.value))
})

// Lista plana de colores para mostrar en el grid
const coloresActivos = computed(() => {
  const result: Array<{ producto: ProductoCatalogo; color: ColorCatalogo; idx: number }> = []
  for (const p of productosActivos.value) {
    p.colores.forEach((color: ColorCatalogo, idx: number) => result.push({ producto: p, color, idx }))
  }
  return result
})

function selectTab(tab: string) {
  activeTab.value = tab
  trackCategoryFilter(tab)
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
const selectedProducto = ref<ProductoCatalogo | null>(null)
const modalColorIdx = ref(0)
const modalImageIdx = ref(0)

const modalColor = computed((): ColorCatalogo | null => {
  if (!selectedProducto.value) return null
  return selectedProducto.value.colores[modalColorIdx.value] ?? selectedProducto.value.colores[0] ?? null
})

function openModal(producto: ProductoCatalogo, colorIdx = 0) {
  selectedProducto.value = producto
  modalColorIdx.value = colorIdx
  modalImageIdx.value = 0
}

function closeModal() {
  selectedProducto.value = null
}

function setModalColor(idx: number) {
  modalColorIdx.value = idx
  modalImageIdx.value = 0
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '521XXXXXXXXXX'

function whatsappProducto(producto: ProductoCatalogo | null) {
  if (!producto) return
  const color = modalColor.value
  const colorParte = color ? ` — Color: ${color.nombre}` : ''
  const mensaje = encodeURIComponent(
    `Hola Barroca! Me interesa el siguiente producto:\n\n${producto.nombre}${colorParte}\nLínea: ${producto.subcategoria} (${producto.tipo})\n\n¿Pueden darme más información?`,
  )
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank')
  trackWhatsAppClick('catalogo')
}

function whatsappGeneral() {
  const mensaje = encodeURIComponent('Hola Barroca! Me gustaría solicitar información sobre su catálogo de productos.')
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank')
  trackWhatsAppClick('catalogo-general')
}

onMounted(() => {
  store.fetchProductos()
})
</script>

<template>
  <section id="catalogo" class="py-20 md:py-28 bg-gray-50 min-h-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Encabezado -->
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Catálogo</h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Melaminas y pisos con diseño contemporáneo, acabados de alta calidad. Diseños inspirados en tendencias de Asia, Emiratos Árabes y Europa.
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap justify-center gap-3 mb-10">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          @click="selectTab(tab.key)"
          :class="[
            'px-6 py-2.5 rounded-full font-heading text-sm font-semibold uppercase tracking-wider transition-colors duration-200',
            activeTab === tab.key
              ? 'bg-gold text-charcoal shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gold/10 hover:text-gold-dark border border-gray-200',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-500">Cargando productos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="text-center py-16">
        <p class="text-red-500 mb-4">{{ store.error }}</p>
        <button
          @click="store.fetchProductos(true)"
          class="bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid plano de colores -->
      <template v-else>
        <div v-if="coloresActivos.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <button
            v-for="{ producto, color, idx } in coloresActivos"
            :key="`${producto.id}-${color.nombre}`"
            @click="openModal(producto, idx)"
            class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 text-left"
          >
            <div class="aspect-square bg-gray-100 overflow-hidden">
              <LazyImage
                v-if="color.imagenes.length"
                :src="imageUrl(color.imagenes[0]?.url ?? '')"
                :alt="`${producto.nombre} — ${color.nombre}`"
                class="w-full h-full"
                img-class="group-hover:scale-105"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="px-2 py-2">
              <p class="text-xs font-heading font-semibold text-charcoal leading-tight truncate">{{ color.nombre }}</p>
              <p class="text-[10px] text-gray-400 font-heading truncate mt-0.5">{{ producto.nombre }}</p>
            </div>
          </button>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-16">
          <p class="text-gray-400 font-heading">No hay productos disponibles en esta categoría.</p>
        </div>

        <!-- CTA WhatsApp general -->
        <div class="mt-16 bg-verde rounded-xl p-8 text-center shadow-md">
          <h3 class="font-heading text-2xl font-bold text-gold mb-2">¿No encuentras lo que buscas?</h3>
          <p class="text-white/75 mb-6">Contáctanos por WhatsApp y te ayudamos a encontrar el producto ideal para tu proyecto.</p>
          <button
            @click="whatsappGeneral"
            class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-heading font-bold uppercase tracking-wider px-8 py-4 rounded-full transition-colors duration-200 shadow-md"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar por WhatsApp
          </button>
        </div>
      </template>
    </div>

    <!-- ── Modal Fichas Técnicas ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="fichasOpen" class="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" @click="fichasOpen = false" />
      </Transition>
      <Transition name="modal-up">
        <div
          v-if="fichasOpen"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
          @click.self="fichasOpen = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 class="font-heading font-bold text-charcoal text-base">Fichas Técnicas</h3>
                <p class="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-heading">{{ fichasCategoria }}</p>
              </div>
              <button @click="fichasOpen = false" class="p-2 text-gray-400 hover:text-charcoal transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4">
              <!-- Cargando -->
              <div v-if="fichasLoading" class="flex items-center justify-center py-12 gap-3 text-gray-400">
                <div class="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                <span class="text-sm font-heading">Cargando fichas...</span>
              </div>

              <!-- Sin fichas -->
              <div v-else-if="fichasData.length === 0" class="py-12 text-center">
                <svg class="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-400 text-sm font-heading">No hay fichas disponibles aún.</p>
              </div>

              <!-- Lista de fichas -->
              <div v-else class="space-y-3">
                <a
                  v-for="ficha in fichasData"
                  :key="ficha.id"
                  :href="ficha.download_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-colors group"
                >
                  <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-heading font-semibold text-charcoal text-sm leading-tight">{{ ficha.titulo }}</p>
                    <p v-if="ficha.descripcion" class="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{{ ficha.descripcion }}</p>
                    <p class="text-xs text-gray-400 mt-0.5 font-heading uppercase tracking-wider">PDF · Descargar</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-300 group-hover:text-gold transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal de detalle ───────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="selectedProducto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <span class="text-xs font-heading uppercase tracking-widest text-gold font-semibold">
                {{ selectedProducto.tipo }}{{ selectedProducto.subcategoria ? ` — ${selectedProducto.subcategoria}` : '' }}
              </span>
              <h3 class="font-heading font-bold text-charcoal text-xl">{{ selectedProducto.nombre }}</h3>
            </div>
            <button
              @click="closeModal"
              class="p-2 text-gray-400 hover:text-charcoal transition-colors rounded-full hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">

            <!-- Imagen principal -->
            <div class="rounded-xl overflow-hidden aspect-square bg-gray-100">
              <LazyImage
                v-if="modalColor?.imagenes.length"
                :src="imageUrl(modalColor.imagenes[modalImageIdx]?.url ?? '')"
                :alt="`${selectedProducto.nombre} — ${modalColor.nombre}`"
                loading="eager"
                class="w-full h-full"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Leyenda de la imagen activa -->
            <p
              v-if="getLeyenda(modalColor?.imagenes[modalImageIdx])"
              class="text-xs text-gray-400 text-center italic -mt-2"
            >
              {{ getLeyenda(modalColor?.imagenes[modalImageIdx]) }}
            </p>

            <!-- Botón Barroca Bot para imágenes IA -->
            <button
              v-if="modalColor?.imagenes[modalImageIdx]?.legend === 'ai_render'"
              @click="navigateTo('barroca-bot'); closeModal()"
              class="w-full flex items-center justify-center gap-2 bg-verde hover:bg-verde-light text-white font-heading font-semibold text-sm px-5 py-3 rounded-xl transition-colors duration-200"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Ve cómo se vería tu espacio con nuestro Barroca Bot
            </button>

            <!-- Miniaturas del color activo -->
            <div v-if="modalColor && modalColor.imagenes.length > 1" class="flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="(img, idx) in modalColor.imagenes"
                :key="idx"
                @click="modalImageIdx = idx"
                class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                :class="modalImageIdx === idx ? 'border-gold' : 'border-transparent hover:border-gray-300'"
              >
                <LazyImage :src="imageUrl(img.url)" :alt="`${modalColor.nombre} ${idx + 1}`" class="w-full h-full" />
              </button>
            </div>

            <!-- Color seleccionado -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-heading text-gray-400 uppercase tracking-wider">Color:</span>
              <span class="font-heading font-bold text-charcoal">{{ modalColor?.nombre }}</span>
            </div>

            <!-- Selector de todos los colores -->
            <div>
              <h4 class="font-heading font-semibold text-charcoal text-sm mb-3">
                Todos los colores ({{ selectedProducto.colores.length }})
              </h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(color, idx) in selectedProducto.colores"
                  :key="color.nombre"
                  @click="setModalColor(idx)"
                  class="text-xs font-heading px-3 py-1.5 rounded-full border-2 transition-colors"
                  :class="modalColorIdx === idx
                    ? 'bg-gold text-charcoal border-gold'
                    : 'border-gray-200 text-gray-600 hover:border-gold hover:text-charcoal'"
                >
                  {{ color.nombre }}
                </button>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3">
              <button
                @click="whatsappProducto(selectedProducto)"
                class="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold uppercase tracking-wider px-4 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>

              <button
                @click="openFichas(selectedProducto)"
                class="flex-1 inline-flex items-center justify-center gap-2 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-heading font-bold uppercase tracking-wider px-4 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Fichas Técnicas
              </button>
            </div>

          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-up-enter-active, .modal-up-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-up-enter-from, .modal-up-leave-to { opacity: 0; transform: scale(0.95) translateY(8px); }
</style>
