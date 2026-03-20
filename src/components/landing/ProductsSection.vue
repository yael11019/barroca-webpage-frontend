<script setup lang="ts">
import { onMounted, ref, computed, watch, reactive } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useNavigation } from '@/composables/useNavigation'
import { useAnalytics } from '@/composables/useAnalytics'
import type { Producto, Variante } from '@/types/producto'

const store = useProductosStore()
const { catalogFilter } = useNavigation()
const { trackCategoryFilter, trackViewItemList, trackWhatsAppClick } = useAnalytics()

// ── Productos demo (ejemplos con colores interactivos) ────────────────────────
// Cuando el backend tenga imágenes reales, estas tarjetas se reemplazarán.
interface DemoColor {
  nombre: string
  hex: string
  textura?: string
}
interface DemoProducto {
  id: string
  nombre: string
  linea: string
  categoria: 'melamina' | 'piso' | 'madera'
  medida: string
  espesor: string
  colores: DemoColor[]
}

const demoProductos: DemoProducto[] = [
  {
    id: 'demo-mel-estandar',
    nombre: 'Melamina Estándar',
    linea: 'Estándar',
    categoria: 'melamina',
    medida: '2440 × 1220 mm',
    espesor: '16 / 18 mm',
    colores: [
      { nombre: 'Latte', hex: '#C8A882' },
      { nombre: 'Mármol Negro', hex: '#2D2D2D', textura: 'Veteado' },
      { nombre: 'Seda Oscura', hex: '#4A3728' },
      { nombre: 'Blanco', hex: '#F5F5F0' },
      { nombre: 'Nogal', hex: '#7B5B3A', textura: 'Veteado' },
    ],
  },
  {
    id: 'demo-mel-supermate',
    nombre: 'Melamina Super Mate',
    linea: 'Super Mate',
    categoria: 'melamina',
    medida: '2440 × 1220 mm',
    espesor: '16 / 18 mm',
    colores: [
      { nombre: 'Gris Oxford', hex: '#6B6B6B', textura: 'Aterciopelado' },
      { nombre: 'Blanco Mate', hex: '#EDEDE8', textura: 'Aterciopelado' },
      { nombre: 'Negro Mate', hex: '#1E1E1E', textura: 'Aterciopelado' },
      { nombre: 'Lino', hex: '#D4C4A8', textura: 'Aterciopelado' },
    ],
  },
  {
    id: 'demo-mel-sincronizado',
    nombre: 'Melamina Sincronizado',
    linea: 'Sincronizado',
    categoria: 'melamina',
    medida: '2440 × 1220 mm',
    espesor: '16 / 18 mm',
    colores: [
      { nombre: 'Roble Sincronizado', hex: '#C4A265', textura: 'Poro sincronizado' },
      { nombre: 'Wengué Sync', hex: '#3D2B1F', textura: 'Poro sincronizado' },
      { nombre: 'Fresno Blanco', hex: '#E8DDD0', textura: 'Poro sincronizado' },
      { nombre: 'Cedro Sync', hex: '#8B5E3C', textura: 'Poro sincronizado' },
    ],
  },
  {
    id: 'demo-mel-altobrillo',
    nombre: 'Melamina Alto Brillo',
    linea: 'Alto Brillo',
    categoria: 'melamina',
    medida: '2440 × 1220 mm',
    espesor: '6 / 18 mm',
    colores: [
      { nombre: 'Gris Oxford Brillo', hex: '#7A7A7A', textura: 'Reflectante' },
      { nombre: 'Blanco Brillo', hex: '#F8F8F8', textura: 'Reflectante' },
      { nombre: 'Negro Brillo', hex: '#111111', textura: 'Reflectante' },
      { nombre: 'Champagne', hex: '#D4B896', textura: 'Reflectante' },
    ],
  },
]

// Color activo por producto demo (id → índice del color)
const selectedDemoColorIdx = reactive<Record<string, number>>(
  Object.fromEntries(demoProductos.map((p) => [p.id, 0])),
)

function activeColor(demo: DemoProducto) {
  const idx = selectedDemoColorIdx[demo.id] ?? 0
  return demo.colores[idx] ?? demo.colores[0]!
}

// Modal de detalle para demos
const selectedDemo = ref<DemoProducto | null>(null)

function openDemo(demo: DemoProducto) {
  selectedDemo.value = demo
}
function closeDemo() {
  selectedDemo.value = null
}

function whatsappDemo(demo: DemoProducto) {
  const color = activeColor(demo)
  const msg = encodeURIComponent(
    `Hola Barroca! Me interesa el siguiente producto:\n\n${demo.nombre} (Línea ${demo.linea})\nColor: ${color.nombre}\nMedida: ${demo.medida} — Espesor: ${demo.espesor}\n\n¿Pueden darme más información y precio?`,
  )
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  trackWhatsAppClick('catalogo-demo')
}

const filteredDemos = computed(() => {
  if (activeTab.value === 'todos') return demoProductos
  return demoProductos.filter((p) => p.categoria === activeTab.value)
})

// ── Tabs principales ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'melamina', label: 'Melamina' },
  { key: 'piso', label: 'Piso' },
  { key: 'madera', label: 'Madera' },
]

const activeTab = ref('todos')
const activeLinea = ref<string | null>(null)

// Reaccionar al filtro que viene desde la galería del inicio
watch(
  catalogFilter,
  (filter) => {
    if (!filter) return
    const [categoria, linea] = filter.split(':')
    if (categoria) {
      activeTab.value = categoria
      activeLinea.value = linea ?? null
    }
  },
  { immediate: true },
)

// ── Productos filtrados ───────────────────────────────────────────────────────
const filteredProductos = computed(() => {
  let list = store.productos.filter((p) => p.activo)
  if (activeTab.value !== 'todos') {
    list = list.filter((p) => p.categoria.toLowerCase().includes(activeTab.value))
  }
  // TODO: cuando el backend incluya el campo "linea", filtrar por activeLinea.value aquí
  return list
})

// Categorías dinámicas del backend
const categoriasBackend = computed(() => store.categorias)

function selectTab(tab: string) {
  activeTab.value = tab
  activeLinea.value = null
  trackCategoryFilter(tab)
  trackViewItemList(tab, filteredProductos.value)
}

// ── Detalle de producto (modal) ───────────────────────────────────────────────
const selectedProducto = ref<Producto | null>(null)
const selectedVariante = ref<Variante | null>(null)

function openProducto(producto: Producto) {
  selectedProducto.value = producto
  selectedVariante.value = producto.variantes?.[0] ?? null
}
function closeProducto() {
  selectedProducto.value = null
  selectedVariante.value = null
}
function selectVariante(variante: Variante) {
  selectedVariante.value = variante
}

// ── WhatsApp CTA ──────────────────────────────────────────────────────────────
// TODO: reemplazar con el número real de WhatsApp de Barroca
const WHATSAPP_NUMBER = '521XXXXXXXXXX'

function whatsappProducto(producto: Producto | null, variante?: Variante | null) {
  if (!producto) return
  const color = variante?.color ?? ''
  const detalle = variante
    ? `${producto.nombre} — Color: ${color}, Medida: ${variante.medida}`
    : producto.nombre
  const mensaje = encodeURIComponent(
    `Hola Barroca! Me interesa el siguiente producto:\n\n${detalle}\n\n¿Pueden darme más información y precio?`,
  )
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank')
  trackWhatsAppClick('catalogo')
}

function whatsappGeneral() {
  const mensaje = encodeURIComponent('Hola Barroca! Me gustaría solicitar información sobre su catálogo de productos.')
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank')
  trackWhatsAppClick('catalogo-general')
}

// ── PDF ───────────────────────────────────────────────────────────────────────
// TODO: cuando el backend genere PDFs por producto/línea, conectar aquí
function descargarPDF(producto: Producto | null) {
  if (!producto) return
  alert(`PDF del producto "${producto.nombre}" — pendiente de implementar en el backend.`)
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
          Cuatro líneas de melaminas con diseño contemporáneo, acabados de alta calidad y espesores de 6, 16 y 18 mm. Diseños inspirados en tendencias de Asia, Emiratos Árabes y Europa.
        </p>
      </div>

      <!-- Tabs principales: Todos / Melamina / Piso / Madera -->
      <div class="flex flex-wrap justify-center gap-3 mb-6">
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

      <!-- Sub-filtro de líneas (si hay filtro activo desde el inicio) -->
      <div v-if="activeLinea" class="flex justify-center mb-8">
        <div class="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-charcoal rounded-full px-5 py-2 text-sm font-heading font-semibold">
          <span>Línea: {{ activeLinea }}</span>
          <button
            @click="activeLinea = null"
            class="ml-1 text-gold hover:text-gold-dark transition-colors"
            aria-label="Quitar filtro"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Nota sobre líneas del backend -->
      <div v-if="activeTab !== 'todos' && categoriasBackend.length > 0" class="flex flex-wrap justify-center gap-2 mb-10">
        <!-- TODO: cuando el backend incluya el campo "linea" en los productos,
             renderizar aquí botones de sub-filtro por línea dentro de la categoría activa -->
      </div>

      <!-- ── Ejemplos interactivos ─────────────────────────────────────────── -->
      <div class="mb-14">
        <div class="flex items-center gap-3 mb-6">
          <div class="h-px flex-1 bg-gray-200"></div>
          <span class="text-xs font-heading font-semibold uppercase tracking-widest text-gray-400 px-2">
            Ejemplos de productos
          </span>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div
            v-for="demo in filteredDemos"
            :key="demo.id"
            class="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <!-- Área de color — cambia al seleccionar un color -->
            <div
              class="relative aspect-square transition-colors duration-500 flex items-end"
              :style="{ backgroundColor: activeColor(demo).hex }"
            >
              <!-- Badge categoría -->
              <span class="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-charcoal text-xs font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {{ demo.categoria }}
              </span>

              <!-- Nombre del color activo -->
              <div class="w-full px-4 pb-3 pt-6 bg-gradient-to-t from-black/50 to-transparent">
                <p class="text-white font-heading font-bold text-sm leading-tight">
                  {{ activeColor(demo).nombre }}
                </p>
                <p v-if="activeColor(demo).textura" class="text-white/70 text-xs">
                  {{ activeColor(demo).textura }}
                </p>
              </div>
            </div>

            <!-- Info + selector de colores -->
            <div class="p-4">
              <p class="font-heading font-bold text-charcoal text-sm mb-0.5">{{ demo.nombre }}</p>
              <p class="text-xs text-gray-400 font-heading mb-3">Línea {{ demo.linea }}</p>

              <!-- Pastillas de color -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="(color, idx) in demo.colores"
                  :key="color.nombre"
                  :title="color.nombre"
                  @click="selectedDemoColorIdx[demo.id] = idx"
                  class="w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110"
                  :style="{ backgroundColor: color.hex }"
                  :class="selectedDemoColorIdx[demo.id] === idx
                    ? 'border-charcoal scale-110 shadow-md'
                    : 'border-white shadow-sm'"
                />
              </div>

              <!-- Specs rápidas -->
              <div class="flex gap-2 text-xs text-gray-500 mb-3">
                <span class="bg-gray-50 rounded px-2 py-1 font-heading">{{ demo.medida }}</span>
                <span class="bg-gray-50 rounded px-2 py-1 font-heading">{{ demo.espesor }}</span>
              </div>

              <button
                @click="openDemo(demo)"
                class="w-full text-center text-xs font-heading font-semibold uppercase tracking-wider text-gold hover:text-gold-dark transition-colors"
              >
                Ver detalles →
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-8">
          <div class="h-px flex-1 bg-gray-200"></div>
          <span class="text-xs font-heading font-semibold uppercase tracking-widest text-gray-400 px-2">
            Productos del catálogo
          </span>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>
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
          @click="store.fetchProductos()"
          class="bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de productos -->
      <template v-else>
        <div
          v-if="filteredProductos.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <div
            v-for="producto in filteredProductos"
            :key="producto.id"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
            @click="openProducto(producto)"
          >
            <!-- Imagen del producto / placeholder -->
            <div class="relative aspect-square bg-gray-100 overflow-hidden">
              <!-- TODO: cuando el backend retorne imágenes por producto, mostrar aquí -->
              <div class="w-full h-full flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-300">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Badge categoría -->
              <span class="absolute top-3 left-3 bg-gold text-charcoal text-xs font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {{ producto.categoria }}
              </span>
            </div>

            <!-- Info del producto -->
            <div class="p-4">
              <h3 class="font-heading font-bold text-charcoal text-sm mb-1 line-clamp-2">{{ producto.nombre }}</h3>
              <p v-if="producto.descripcion" class="text-gray-500 text-xs line-clamp-2 mb-3">
                {{ producto.descripcion }}
              </p>

              <!-- Variantes (colores) -->
              <div v-if="producto.variantes?.length" class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="v in producto.variantes.slice(0, 6)"
                  :key="v.id"
                  :title="v.color ?? undefined"
                  class="w-5 h-5 rounded-full border border-gray-200 bg-gray-200 text-[9px] flex items-center justify-center font-bold text-gray-500"
                >
                  <!-- TODO: cuando el backend provea código de color hex, usar como bg -->
                </span>
                <span
                  v-if="producto.variantes.length > 6"
                  class="text-xs text-gray-400 font-heading"
                >
                  +{{ producto.variantes.length - 6 }}
                </span>
              </div>

              <button
                class="w-full text-center text-xs font-heading font-semibold uppercase tracking-wider text-gold hover:text-gold-dark transition-colors"
                @click.stop="openProducto(producto)"
              >
                Ver detalles →
              </button>
            </div>
          </div>
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

    <!-- ── Modal de detalle de producto ─────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="selectedProducto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeProducto"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeProducto"></div>

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">

          <!-- Header del modal -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <span class="text-xs font-heading uppercase tracking-widest text-gold font-semibold">
                {{ selectedProducto?.categoria }}
              </span>
              <h3 class="font-heading font-bold text-charcoal text-xl">{{ selectedProducto?.nombre }}</h3>
            </div>
            <button
              @click="closeProducto"
              class="p-2 text-gray-400 hover:text-charcoal transition-colors rounded-full hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6">

            <!-- Imagen del producto -->
            <!-- TODO: cuando el backend retorne fotos por producto/variante, mostrar galería aquí -->
            <div class="bg-gray-100 rounded-xl aspect-video flex items-center justify-center text-gray-300">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm font-heading">Fotos del producto — pendiente del backend</p>
                <!-- TODO: Alex quiere fotos de los colores que al dar click se muestren -->
              </div>
            </div>

            <!-- Descripción -->
            <div v-if="selectedProducto?.descripcion">
              <h4 class="font-heading font-bold text-charcoal mb-2">Descripción</h4>
              <p class="text-gray-600 leading-relaxed text-sm">{{ selectedProducto?.descripcion }}</p>
            </div>

            <!-- Variantes / Colores -->
            <div v-if="selectedProducto?.variantes?.length">
              <h4 class="font-heading font-bold text-charcoal mb-3">Colores y Variantes</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variante in selectedProducto?.variantes"
                  :key="variante.id"
                  @click="selectVariante(variante)"
                  :class="[
                    'px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-colors',
                    selectedVariante?.id === variante.id
                      ? 'bg-gold text-charcoal border-gold'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gold hover:text-gold',
                  ]"
                >
                  {{ variante.color }}
                </button>
              </div>
            </div>

            <!-- Especificaciones de la variante seleccionada -->
            <div v-if="selectedVariante">
              <h4 class="font-heading font-bold text-charcoal mb-3">Especificaciones</h4>
              <!-- TODO: agregar campos de espesor, acabado, etc. cuando el backend los incluya -->
              <div class="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">SKU</span>
                  <span class="font-bold text-charcoal">{{ selectedVariante.sku || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Color</span>
                  <span class="font-bold text-charcoal">{{ selectedVariante.color || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Medida</span>
                  <span class="font-bold text-charcoal">{{ selectedVariante.medida || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Código de barras</span>
                  <span class="font-bold text-charcoal">{{ selectedVariante.barcode || '—' }}</span>
                </div>
                <!-- TODO: agregar Espesor, Acabado, Resistencia, etc. desde el backend -->
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <!-- WhatsApp -->
              <button
                @click="whatsappProducto(selectedProducto, selectedVariante)"
                class="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </button>

              <!-- Descargar PDF -->
              <button
                @click="descargarPDF(selectedProducto)"
                class="flex-1 inline-flex items-center justify-center gap-2 border-2 border-charcoal hover:bg-charcoal hover:text-gold text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
                <!-- TODO: conectar con endpoint de generación de PDF del backend -->
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Modal de detalle — Demo ───────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="selectedDemo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeDemo"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDemo"></div>

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <span class="text-xs font-heading uppercase tracking-widest text-gold font-semibold">
                {{ selectedDemo.categoria }} — Línea {{ selectedDemo.linea }}
              </span>
              <h3 class="font-heading font-bold text-charcoal text-xl">{{ selectedDemo.nombre }}</h3>
            </div>
            <button
              @click="closeDemo"
              class="p-2 text-gray-400 hover:text-charcoal transition-colors rounded-full hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6">

            <!-- Área de color interactiva (reemplaza la imagen) -->
            <div
              class="rounded-xl aspect-video transition-colors duration-500 flex items-end overflow-hidden"
              :style="{ backgroundColor: activeColor(selectedDemo).hex }"
            >
              <div class="w-full px-6 pb-5 pt-10 bg-gradient-to-t from-black/50 to-transparent">
                <p class="text-white font-heading font-bold text-lg">{{ activeColor(selectedDemo).nombre }}</p>
                <p v-if="activeColor(selectedDemo).textura" class="text-white/70 text-sm">
                  {{ activeColor(selectedDemo).textura }}
                </p>
              </div>
            </div>

            <!-- Selector de colores -->
            <div>
              <h4 class="font-heading font-bold text-charcoal mb-3">Colores disponibles</h4>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="(color, idx) in selectedDemo.colores"
                  :key="color.nombre"
                  @click="selectedDemoColorIdx[selectedDemo.id] = idx"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-heading font-semibold transition-all duration-200"
                  :class="(selectedDemoColorIdx[selectedDemo.id] ?? 0) === idx
                    ? 'border-charcoal bg-gray-50 text-charcoal'
                    : 'border-gray-200 text-gray-500 hover:border-gold hover:text-gold'"
                >
                  <span
                    class="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                    :style="{ backgroundColor: color.hex }"
                  />
                  {{ color.nombre }}
                </button>
              </div>
            </div>

            <!-- Especificaciones -->
            <div>
              <h4 class="font-heading font-bold text-charcoal mb-3">Especificaciones</h4>
              <div class="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Categoría</span>
                  <span class="font-bold text-charcoal capitalize">{{ selectedDemo.categoria }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Línea</span>
                  <span class="font-bold text-charcoal">{{ selectedDemo.linea }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Medida</span>
                  <span class="font-bold text-charcoal">{{ selectedDemo.medida }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Espesor</span>
                  <span class="font-bold text-charcoal">{{ selectedDemo.espesor }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-heading">Color seleccionado</span>
                  <span class="font-bold text-charcoal">{{ activeColor(selectedDemo).nombre }}</span>
                </div>
                <div v-if="activeColor(selectedDemo).textura" class="flex justify-between">
                  <span class="text-gray-500 font-heading">Textura</span>
                  <span class="font-bold text-charcoal">{{ activeColor(selectedDemo).textura }}</span>
                </div>
                <!-- TODO: agregar Acabado, Resistencia, SKU, etc. desde el backend -->
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                @click="whatsappDemo(selectedDemo)"
                class="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </button>

              <button
                @click="descargarPDF(null)"
                class="flex-1 inline-flex items-center justify-center gap-2 border-2 border-charcoal hover:bg-charcoal hover:text-gold text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
            </div>

          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
