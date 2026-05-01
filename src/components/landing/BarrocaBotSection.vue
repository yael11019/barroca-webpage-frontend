<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'
import type { ProductoCatalogo, ColorCatalogo } from '@/types/producto'
import { generarVisualizacion } from '@/services/gemini.service'
import { imageUrl } from '@/utils/imageUrl'
import api from '@/services/api'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Mensaje {
  id: number
  from: 'bot' | 'user'
  text: string
}

type ShowroomStep = 'material' | 'upload' | 'result'

// ── Mobile tabs ────────────────────────────────────────────────────────────
const activeTab = ref<'chat' | 'showroom'>('chat')

// ── Productos store ────────────────────────────────────────────────────────
const productosStore = useProductosStore()

onMounted(() => {
  if (!productosStore.productos.length) productosStore.fetchProductos()
})

// ── Chat FAQ ───────────────────────────────────────────────────────────────
let msgId = 2
const mensajes = ref<Mensaje[]>([
  {
    id: 1,
    from: 'bot',
    text: '¡Hola! Soy el asistente de Barroca 👋\n\nPuedo ayudarte con dudas sobre materiales, precios, tiempos de entrega y más. También puedes explorar el **Showroom Virtual** para visualizar los materiales en tu espacio.\n\n¿En qué puedo ayudarte?',
  },
])
const inputText = ref('')
const isBotTyping = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)

const quickReplies = [
  '¿Qué materiales tienen?',
  '¿Cuánto tarda la entrega?',
  '¿Hacen instalación?',
  '¿Cómo pido una cotización?',
  '¿Dónde están ubicados?',
  '¿Tienen garantía?',
]

const faqs = [
  {
    keywords: ['precio', 'costo', 'cuánto', 'cuanto', 'vale', 'cotiz', 'presupuesto', 'cobran'],
    respuesta: 'Los precios varían según el material, medidas y acabado. Puedes solicitar una cotización personalizada en la sección de **Servicios** o contactarnos por **WhatsApp al +52 417 160 1530**. 📋',
  },
  {
    keywords: ['entrega', 'envío', 'envio', 'tiempo', 'días', 'dias', 'tarda', 'llega', 'demora'],
    respuesta: 'Los tiempos de entrega según zona:\n\n• **Zona Metropolitana**: 1-2 días hábiles\n• **Zona Centro**: 2-3 días hábiles\n• **Norte / Sur**: 4-6 días hábiles\n\nA partir de la confirmación de pago. 🚚',
  },
  {
    keywords: ['melamina', 'material', 'producto', 'catalogo', 'catálogo', 'tienen', 'ofrecen', 'venden', 'piso', 'vinilico', 'vinílico', 'spc'],
    respuesta: 'Contamos con más de **200 referencias** en:\n\n• **Melaminas** — sólidos, vetas de madera, texturas metálicas\n• **Pisos SPC** — alta durabilidad, resistentes al agua\n• **Pisos Vinílicos** — versátiles y económicos\n\n¡Prueba el **Showroom Virtual** para ver cómo quedarían en tu espacio! 🎨',
  },
  {
    keywords: ['instalacion', 'instalación', 'instalan', 'instala', 'colocan', 'ponen', 'instalar'],
    respuesta: 'Sí ofrecemos **instalación profesional** en zonas seleccionadas. Es un servicio con cotización previa ya que depende del área, material y ubicación. Contáctanos para más detalles. 🔧',
  },
  {
    keywords: ['garantia', 'garantía', 'devolu', 'cambio', 'defecto', 'falla'],
    respuesta: 'Todos nuestros productos tienen **garantía de calidad**. Si recibes un producto con defecto de fabricación, lo reemplazamos sin costo dentro de los primeros **7 días** de recibida la entrega. ✅',
  },
  {
    keywords: ['ubicacion', 'ubicación', 'sucursal', 'tienda', 'direccion', 'dirección', 'donde', 'dónde'],
    respuesta: 'Contamos con sucursales en la **zona centro de México**. Escríbenos por WhatsApp y te indicamos la más cercana o coordinamos una visita. 📍\n\n**WhatsApp**: +52 417 160 1530',
  },
  {
    keywords: ['distribuidor', 'distribui', 'revendedor', 'mayoreo', 'reventa'],
    respuesta: 'Si te interesa ser distribuidor Barroca, visita la sección de **Distribuidores** y llena el formulario de solicitud. ¡Con gusto analizamos tu propuesta! 🤝',
  },
  {
    keywords: ['corte', 'medida', 'personaliz', 'dimensiones', 'medidas'],
    respuesta: 'Sí hacemos **cortes a medida** con tolerancias exactas. El precio depende de las dimensiones y el material. Solicita tu cotización por WhatsApp o en la sección de **Servicios**. ✂️',
  },
  {
    keywords: ['showroom', 'visualizar', 'visualiza', 'ver como', 'probar', 'prueba', 'foto', 'espacio'],
    respuesta: '¡Usa el **Showroom Virtual** justo aquí al lado! 👈\n\n1. Elige el material que te interesa\n2. Sube una foto de tu espacio\n3. La IA genera cómo quedaría\n\n¡Es muy fácil y gratis!',
  },
  {
    keywords: ['hola', 'hello', 'buenos', 'buenas', 'saludos', 'que tal', 'qué tal', 'buen dia'],
    respuesta: '¡Hola de nuevo! 👋 ¿En qué puedo ayudarte hoy? Pregúntame lo que necesites o usa los botones de abajo para preguntas frecuentes.',
  },
  {
    keywords: ['gracias', 'thanks', 'perfecto', 'excelente', 'genial', 'muy bien', 'listo', 'ok'],
    respuesta: '¡Con mucho gusto! 😊 Si tienes más preguntas, aquí estaré. También puedes contactarnos por **WhatsApp al +52 417 160 1530** para atención personalizada.',
  },
  {
    keywords: ['whatsapp', 'telefono', 'teléfono', 'llamar', 'contacto', 'contactar', 'numero', 'número'],
    respuesta: 'Puedes contactarnos por:\n\n• **WhatsApp**: +52 417 160 1530\n• **Correo**: ventas@barroca.mx\n\nHorario: Lun–Vie 9:00–18:00 📞',
  },
]

const defaultResponse = 'No tengo información específica sobre eso, pero con gusto te atendemos directamente. 😊\n\nEscríbenos por **WhatsApp al +52 417 160 1530** o usa los botones de abajo para preguntas frecuentes.'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getBotResponse(text: string): string {
  const n = normalize(text)
  return faqs.find(f => f.keywords.some(k => n.includes(normalize(k))))?.respuesta ?? defaultResponse
}

function renderText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

async function sendMessage(text?: string) {
  const msg = (text ?? inputText.value).trim()
  if (!msg || isBotTyping.value) return
  inputText.value = ''
  mensajes.value.push({ id: msgId++, from: 'user', text: msg })
  await scrollToBottom()
  isBotTyping.value = true
  await scrollToBottom()

  let respuesta: string
  try {
    const { data } = await api.post('/api/public/chat', { pregunta: msg })
    respuesta = data?.respuesta ?? data?.message ?? data?.answer ?? data?.texto ?? getBotResponse(msg)
  } catch {
    respuesta = getBotResponse(msg)
  }

  isBotTyping.value = false
  mensajes.value.push({ id: msgId++, from: 'bot', text: respuesta })
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

const showQuickReplies = computed(
  () => mensajes.value.at(-1)?.from === 'bot',
)

// ── Showroom ───────────────────────────────────────────────────────────────
const showroomStep = ref<ShowroomStep>('material')
const uploadedPhoto = ref<string | null>(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const processingError = ref<string | null>(null)
const resultImage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// ── Selección de material (Tipo → Producto/Línea → Color) ──────────────────
const showroomTipo = ref<string | null>(null)
const showroomProducto = ref<ProductoCatalogo | null>(null)
const showroomColorIdx = ref<number>(0)

const tiposDisponibles = computed(() => productosStore.tipos)

const productosDelTipo = computed((): ProductoCatalogo[] => {
  if (!showroomTipo.value) return []
  return productosStore.productos.filter((p: ProductoCatalogo) => p.tipo === showroomTipo.value)
})

const showroomColor = computed((): ColorCatalogo | null => {
  if (!showroomProducto.value) return null
  return showroomProducto.value.colores[showroomColorIdx.value] ?? showroomProducto.value.colores[0] ?? null
})

const puedeAvanzar = computed(() => !!showroomProducto.value && !!showroomColor.value)

function selectTipo(tipo: string) {
  showroomTipo.value = tipo
  showroomProducto.value = null
  showroomColorIdx.value = 0
}

function selectProducto(p: ProductoCatalogo) {
  showroomProducto.value = p
  showroomColorIdx.value = 0
}

// ── Manejo de archivo ──────────────────────────────────────────────────────
function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) loadFile(file)
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

function loadFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = ev => { uploadedPhoto.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// ── Visualización con Gemini ───────────────────────────────────────────────
async function runVisualization() {
  if (!uploadedPhoto.value || !showroomProducto.value || !showroomColor.value) return
  isProcessing.value = true
  processingError.value = null
  resultImage.value = null

  try {
    const parts = uploadedPhoto.value.split(',')
    const mimeType = parts[0]?.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const base64 = parts[1] ?? ''

    const textureRaw = showroomColor.value.imagenes[0] ?? null
    const textureImageUrl = textureRaw ? imageUrl(textureRaw.url) : null

    resultImage.value = await generarVisualizacion({
      imageBase64: base64,
      mimeType,
      tipo: showroomProducto.value.tipo,
      subcategoria: showroomProducto.value.subcategoria,
      colorNombre: showroomColor.value.nombre,
      textureImageUrl,
    })
    showroomStep.value = 'result'
  } catch (err) {
    processingError.value = 'No se pudo generar la visualización. Verifica la API key o intenta de nuevo.'
    console.error('[Gemini Showroom]', err)
  } finally {
    isProcessing.value = false
  }
}

function resetShowroom() {
  showroomStep.value = 'material'
  showroomTipo.value = null
  showroomProducto.value = null
  showroomColorIdx.value = 0
  uploadedPhoto.value = null
  isProcessing.value = false
  processingError.value = null
  resultImage.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <section id="barroca-bot" class="bg-gray-50">

    <!-- ── Encabezado ──────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-8 text-center">
      <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Inteligencia artificial</p>
      <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Barroca Bot</h2>
      <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
      <p class="text-gray-500 max-w-2xl mx-auto text-base">
        Resuelve tus dudas con nuestro asistente y visualiza cómo quedarían nuestros materiales en tu espacio.
      </p>
    </div>

    <!-- ── Tabs móvil ──────────────────────────────────────────────────── -->
    <div class="md:hidden max-w-7xl mx-auto px-4 mb-4">
      <div class="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
        <button
          @click="activeTab = 'chat'"
          :class="['flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all duration-150',
            activeTab === 'chat' ? 'bg-charcoal text-white shadow-sm' : 'text-gray-500 hover:text-charcoal']"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Asistente
        </button>
        <button
          @click="activeTab = 'showroom'"
          :class="['flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all duration-150',
            activeTab === 'showroom' ? 'bg-charcoal text-white shadow-sm' : 'text-gray-500 hover:text-charcoal']"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Showroom
        </button>
      </div>
    </div>

    <!-- ── Contenido principal ─────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="flex flex-col md:flex-row gap-5 items-stretch">

        <!-- ══ SHOWROOM (izquierda desktop, tab móvil) ════════════════ -->
        <div
          :class="['w-full md:w-[420px] flex-shrink-0 flex flex-col', activeTab !== 'showroom' ? 'hidden md:flex' : 'flex']"
        >
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">

            <!-- Header showroom -->
            <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-heading font-bold text-charcoal text-sm">Showroom Virtual</p>
                <p class="text-xs text-gray-400">Visualización con IA · Gemini</p>
              </div>
              <!-- Step indicator -->
              <div class="flex items-center gap-1">
                <div v-for="i in 3" :key="i"
                  :class="['w-2 h-2 rounded-full transition-colors',
                    (i === 1 && showroomStep === 'material') ||
                    (i === 2 && showroomStep === 'upload') ||
                    (i === 3 && showroomStep === 'result')
                      ? 'bg-gold'
                      : (i === 1 && (showroomStep === 'upload' || showroomStep === 'result')) ||
                        (i === 2 && showroomStep === 'result')
                        ? 'bg-gold/40'
                        : 'bg-gray-200'
                  ]"
                />
              </div>
            </div>

            <!-- ── Paso 1: Elegir material ─────────────────────────── -->
            <Transition name="step" mode="out-in">
              <div v-if="showroomStep === 'material'" key="step1" class="flex-1 p-5 overflow-y-auto space-y-5">

                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">
                  1. Elige un material
                </p>

                <!-- Loading del catálogo -->
                <div v-if="productosStore.loading" class="flex items-center gap-2 text-gray-400 text-xs">
                  <div class="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  Cargando catálogo...
                </div>

                <template v-else>
                  <!-- Selector de tipo (categoría) -->
                  <div>
                    <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2">Categoría</p>
                    <div class="flex gap-2 flex-wrap">
                      <button
                        v-for="tipo in tiposDisponibles"
                        :key="tipo"
                        @click="selectTipo(tipo)"
                        class="px-4 py-1.5 rounded-full text-xs font-heading font-semibold border transition-colors"
                        :class="showroomTipo === tipo
                          ? 'bg-gold text-charcoal border-gold'
                          : 'border-gray-200 text-gray-500 hover:border-gold hover:text-charcoal'"
                      >
                        {{ tipo }}
                      </button>
                    </div>
                  </div>

                  <!-- Selector de línea/producto -->
                  <div v-if="showroomTipo">
                    <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2">Línea</p>
                    <div class="flex flex-col gap-2">
                      <button
                        v-for="p in productosDelTipo"
                        :key="p.id"
                        @click="selectProducto(p)"
                        class="flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left"
                        :class="showroomProducto?.id === p.id
                          ? 'border-gold bg-gold/5 shadow-sm'
                          : 'border-gray-200 hover:border-gold/50 hover:bg-gray-50'"
                      >
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            v-if="p.colores[0]?.imagenes[0]"
                            :src="imageUrl(p.colores[0].imagenes[0].url)"
                            :alt="p.nombre"
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-heading font-bold text-charcoal truncate">{{ p.nombre }}</p>
                          <p class="text-xs text-gray-400">{{ p.colores.length }} colores</p>
                        </div>
                        <svg
                          v-if="showroomProducto?.id === p.id"
                          class="w-4 h-4 text-gold flex-shrink-0"
                          fill="currentColor" viewBox="0 0 20 20"
                        >
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Selector de color -->
                  <div v-if="showroomProducto">
                    <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2">Color</p>
                    <div class="flex flex-wrap gap-1.5 mb-3">
                      <button
                        v-for="(color, idx) in showroomProducto.colores"
                        :key="color.nombre"
                        @click="showroomColorIdx = idx"
                        class="text-[10px] font-heading px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap"
                        :class="showroomColorIdx === idx
                          ? 'bg-gold text-charcoal border-gold'
                          : 'border-gray-200 text-gray-500 hover:border-gold/60 hover:text-charcoal'"
                      >
                        {{ color.nombre }}
                      </button>
                    </div>

                    <!-- Preview del color seleccionado -->
                    <div v-if="showroomColor" class="rounded-xl overflow-hidden aspect-video bg-gray-100">
                      <img
                        v-if="showroomColor.imagenes[0]"
                        :src="imageUrl(showroomColor.imagenes[0].url)"
                        :alt="showroomColor.nombre"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <!-- Botón continuar -->
                  <button
                    @click="showroomStep = 'upload'"
                    :disabled="!puedeAvanzar"
                    class="w-full bg-gold hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-charcoal font-heading font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider transition-colors"
                  >
                    Continuar →
                  </button>
                </template>
              </div>
            </Transition>

            <!-- ── Paso 2: Subir foto ──────────────────────────────── -->
            <Transition name="step" mode="out-in">
              <div v-if="showroomStep === 'upload'" key="step2" class="flex-1 p-5 flex flex-col gap-4">

                <!-- Material elegido -->
                <div class="flex items-center gap-3">
                  <button @click="showroomStep = 'material'" class="text-gray-400 hover:text-charcoal transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      v-if="showroomColor?.imagenes[0]"
                      :src="imageUrl(showroomColor.imagenes[0].url)"
                      :alt="showroomColor.nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-gray-400 truncate">{{ showroomProducto?.nombre }}</p>
                    <p class="font-heading font-bold text-charcoal text-sm truncate">{{ showroomColor?.nombre }}</p>
                  </div>
                </div>

                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">2. Sube una foto de tu espacio</p>

                <!-- Drop zone -->
                <div
                  class="flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors min-h-[180px] relative"
                  :class="isDragging ? 'border-gold bg-gold/5' : 'border-gray-300 hover:border-gold hover:bg-gray-50'"
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop.prevent="handleDrop"
                  @click="fileInputRef?.click()"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileInput"
                  />

                  <!-- Preview -->
                  <div v-if="uploadedPhoto" class="absolute inset-0 rounded-xl overflow-hidden">
                    <img :src="uploadedPhoto" class="w-full h-full object-cover" alt="Tu espacio"/>
                    <div class="absolute inset-0 bg-charcoal/20 flex items-center justify-center">
                      <span class="bg-white text-charcoal text-xs font-heading font-bold px-3 py-1.5 rounded-full shadow">
                        Cambiar foto
                      </span>
                    </div>
                  </div>

                  <template v-else>
                    <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <div class="text-center">
                      <p class="text-sm font-heading font-semibold text-charcoal">Arrastra tu foto aquí</p>
                      <p class="text-xs text-gray-400 mt-0.5">o haz clic para seleccionar</p>
                    </div>
                    <p class="text-xs text-gray-300">JPG, PNG, HEIC · Máx 10MB</p>
                  </template>
                </div>

                <!-- Error -->
                <div v-if="processingError" class="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  {{ processingError }}
                </div>

                <!-- Botón procesar -->
                <button
                  @click="runVisualization"
                  :disabled="!uploadedPhoto || isProcessing"
                  class="w-full bg-gold hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-charcoal font-heading font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <svg v-if="isProcessing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ isProcessing ? 'Generando con Gemini...' : 'Visualizar en mi espacio' }}
                </button>
              </div>
            </Transition>

            <!-- ── Paso 3: Resultado ───────────────────────────────── -->
            <Transition name="step" mode="out-in">
              <div v-if="showroomStep === 'result'" key="step3" class="flex-1 p-5 flex flex-col gap-4">

                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">
                  3. Tu espacio con {{ showroomColor?.nombre }}
                </p>

                <!-- Resultado generado por Gemini -->
                <div class="relative rounded-xl overflow-hidden aspect-video bg-gray-100 flex-shrink-0">
                  <img
                    v-if="resultImage"
                    :src="resultImage"
                    class="w-full h-full object-cover"
                    alt="Visualización generada"
                  />
                  <!-- Fallback: foto original si no hay resultado -->
                  <img
                    v-else-if="uploadedPhoto"
                    :src="uploadedPhoto"
                    class="w-full h-full object-cover"
                    alt="Tu espacio"
                  />
                  <!-- Badge -->
                  <div class="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span class="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-heading font-semibold backdrop-blur-sm">
                      {{ showroomColor?.nombre }} · {{ showroomProducto?.nombre }}
                    </span>
                    <span v-if="resultImage" class="text-xs bg-gold text-charcoal px-2 py-1 rounded-full font-heading font-bold">
                      Preview
                    </span>
                  </div>
                </div>

                <!-- Comparación: miniatura del material -->
                <div v-if="showroomColor?.imagenes[0]" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img :src="imageUrl(showroomColor.imagenes[0].url)" :alt="showroomColor.nombre" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 font-heading">Material aplicado</p>
                    <p class="text-sm font-heading font-bold text-charcoal">{{ showroomColor.nombre }}</p>
                    <p class="text-xs text-gray-400">{{ showroomProducto?.nombre }} · {{ showroomProducto?.tipo }}</p>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="flex flex-col gap-2 mt-auto">
                  <button
                    @click="showroomStep = 'material'; showroomProducto = null; showroomTipo = null; uploadedPhoto = null; resultImage = null"
                    class="w-full border border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-heading font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Probar otro material
                  </button>
                  <button
                    @click="resetShowroom"
                    class="w-full text-gray-400 hover:text-charcoal font-heading font-semibold py-2 text-xs transition-colors"
                  >
                    Empezar de nuevo
                  </button>
                </div>
              </div>
            </Transition>

          </div>
        </div>

        <!-- ══ CHAT FAQ (derecha desktop, tab móvil) ══════════════════ -->
        <div
          :class="['flex-1 min-w-0 flex flex-col', activeTab !== 'chat' ? 'hidden md:flex' : 'flex']"
        >
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden" style="min-height: 540px">

            <!-- Header chat -->
            <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div class="relative">
                <div class="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                  </svg>
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p class="font-heading font-bold text-charcoal text-sm">Barroca Asistente</p>
                <p class="text-xs text-green-500 font-medium">En línea</p>
              </div>
            </div>

            <!-- Mensajes -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4" style="max-height: 380px">
              <div
                v-for="msg in mensajes"
                :key="msg.id"
                :class="['flex', msg.from === 'user' ? 'justify-end' : 'justify-start']"
              >
                <div v-if="msg.from === 'bot'" class="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                  </svg>
                </div>

                <div
                  :class="[
                    'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.from === 'bot'
                      ? 'bg-gray-100 text-charcoal rounded-tl-none'
                      : 'bg-charcoal text-white rounded-tr-none',
                  ]"
                  v-html="renderText(msg.text)"
                ></div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isBotTyping" class="flex items-end gap-2">
                <div class="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                  </svg>
                </div>
                <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>

              <div ref="messagesEnd" />
            </div>

            <!-- Quick replies -->
            <Transition name="fade">
              <div v-if="showQuickReplies && !isBotTyping" class="px-5 pb-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="q in quickReplies"
                    :key="q"
                    @click="sendMessage(q)"
                    class="text-xs bg-gray-50 hover:bg-gold/10 hover:text-charcoal border border-gray-200 hover:border-gold text-gray-600 px-3 py-1.5 rounded-full font-heading font-medium transition-colors"
                  >
                    {{ q }}
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Input -->
            <div class="px-4 pb-4 pt-2 border-t border-gray-100">
              <div class="flex gap-2 items-end">
                <input
                  v-model="inputText"
                  type="text"
                  placeholder="Escribe tu pregunta..."
                  class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors resize-none"
                  @keydown.enter.prevent="sendMessage()"
                  :disabled="isBotTyping"
                />
                <button
                  @click="sendMessage()"
                  :disabled="!inputText.trim() || isBotTyping"
                  class="w-10 h-10 rounded-xl bg-charcoal hover:bg-charcoal-light disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-300 mt-2 text-center">
                Las respuestas son orientativas. Para atención personalizada contáctanos por WhatsApp.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.step-enter-active, .step-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.step-enter-from { opacity: 0; transform: translateX(12px); }
.step-leave-to { opacity: 0; transform: translateX(-12px); }
</style>
