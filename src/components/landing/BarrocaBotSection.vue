<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Mensaje {
  id: number
  from: 'bot' | 'user'
  text: string
}

interface Material {
  id: number
  nombre: string
  color: string
  colorTexto: string
  categoria: 'melamina' | 'piso'
}

type ShowroomStep = 'material' | 'upload' | 'result'

// ── Mobile tabs ────────────────────────────────────────────────────────────
const activeTab = ref<'chat' | 'showroom'>('chat')

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
    respuesta: '¡Usa el **Showroom Virtual** justo aquí al lado! 👈\n\n1. Elige el material que te interesa\n2. Sube una foto de tu espacio\n3. Ve cómo quedaría\n\n¡Es muy fácil y gratis!',
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

// Renderiza texto con **negrita** y saltos de línea
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
  await new Promise(r => setTimeout(r, 900 + Math.random() * 700))
  isBotTyping.value = false
  mensajes.value.push({ id: msgId++, from: 'bot', text: getBotResponse(msg) })
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
const selectedMaterial = ref<Material | null>(null)
const uploadedPhoto = ref<string | null>(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const materiales: Material[] = [
  { id: 1, nombre: 'Nogal',          color: '#7D5A2F', colorTexto: '#fff', categoria: 'melamina' },
  { id: 2, nombre: 'Blanca',         color: '#F0EDE8', colorTexto: '#555', categoria: 'melamina' },
  { id: 3, nombre: 'Gris Cemento',   color: '#8E9196', colorTexto: '#fff', categoria: 'melamina' },
  { id: 4, nombre: 'Roble Natural',  color: '#C4955A', colorTexto: '#fff', categoria: 'melamina' },
  { id: 5, nombre: 'Negro Mate',     color: '#2D2D2D', colorTexto: '#fff', categoria: 'melamina' },
  { id: 6, nombre: 'Verde Salvia',   color: '#7A9E7E', colorTexto: '#fff', categoria: 'melamina' },
  { id: 7, nombre: 'SPC Roble',      color: '#A0722A', colorTexto: '#fff', categoria: 'piso' },
  { id: 8, nombre: 'Vinílico Gris',  color: '#B0BEC5', colorTexto: '#333', categoria: 'piso' },
]

const melaminasList = materiales.filter(m => m.categoria === 'melamina')
const pisosList     = materiales.filter(m => m.categoria === 'piso')

function selectMaterial(m: Material) {
  selectedMaterial.value = m
  showroomStep.value = 'upload'
}

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

async function runVisualization() {
  isProcessing.value = true
  // TODO: POST /api/visualizer { materialId: selectedMaterial.value.id, photo: uploadedPhoto.value }
  await new Promise(r => setTimeout(r, 2200))
  isProcessing.value = false
  showroomStep.value = 'result'
}

function resetShowroom() {
  showroomStep.value = 'material'
  selectedMaterial.value = null
  uploadedPhoto.value = null
  isProcessing.value = false
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
                <p class="text-xs text-gray-400">Visualiza materiales en tu espacio</p>
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
              <div v-if="showroomStep === 'material'" key="step1" class="flex-1 p-5 overflow-y-auto">
                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider mb-3">
                  1. Elige un material
                </p>

                <p class="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2">Melaminas</p>
                <div class="grid grid-cols-4 gap-2 mb-4">
                  <button
                    v-for="m in melaminasList"
                    :key="m.id"
                    @click="selectMaterial(m)"
                    class="group flex flex-col items-center gap-1.5 focus:outline-none"
                  >
                    <div
                      class="w-full aspect-square rounded-lg border-2 border-transparent group-hover:border-gold group-hover:scale-105 transition-all duration-150 shadow-sm"
                      :style="{ backgroundColor: m.color }"
                    ></div>
                    <span class="text-xs text-gray-500 group-hover:text-charcoal transition-colors text-center leading-tight">
                      {{ m.nombre }}
                    </span>
                  </button>
                </div>

                <p class="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2">Pisos</p>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="m in pisosList"
                    :key="m.id"
                    @click="selectMaterial(m)"
                    class="group flex flex-col items-center gap-1.5 focus:outline-none"
                  >
                    <div
                      class="w-full aspect-square rounded-lg border-2 border-transparent group-hover:border-gold group-hover:scale-105 transition-all duration-150 shadow-sm"
                      :style="{ backgroundColor: m.color }"
                    ></div>
                    <span class="text-xs text-gray-500 group-hover:text-charcoal transition-colors text-center leading-tight">
                      {{ m.nombre }}
                    </span>
                  </button>
                </div>
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
                  <div
                    class="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                    :style="{ backgroundColor: selectedMaterial?.color }"
                  ></div>
                  <div>
                    <p class="text-xs text-gray-400">Material seleccionado</p>
                    <p class="font-heading font-bold text-charcoal text-sm">{{ selectedMaterial?.nombre }}</p>
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
                  {{ isProcessing ? 'Procesando con IA...' : 'Visualizar en mi espacio' }}
                </button>
              </div>
            </Transition>

            <!-- ── Paso 3: Resultado ───────────────────────────────── -->
            <Transition name="step" mode="out-in">
              <div v-if="showroomStep === 'result'" key="step3" class="flex-1 p-5 flex flex-col gap-4">

                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">3. Tu espacio con {{ selectedMaterial?.nombre }}</p>

                <!-- Resultado: foto + overlay de color -->
                <div class="relative rounded-xl overflow-hidden aspect-video bg-gray-100 flex-shrink-0">
                  <img v-if="uploadedPhoto" :src="uploadedPhoto" class="w-full h-full object-cover" alt="Tu espacio"/>
                  <!-- Overlay de color del material (placeholder hasta el backend AI) -->
                  <div
                    class="absolute inset-0 mix-blend-multiply opacity-35"
                    :style="{ backgroundColor: selectedMaterial?.color }"
                  ></div>
                  <!-- Badge resultado -->
                  <div class="absolute bottom-3 left-3">
                    <span class="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-heading font-semibold backdrop-blur-sm">
                      {{ selectedMaterial?.nombre }} · Previsualización
                    </span>
                  </div>
                </div>

                <!-- Aviso placeholder -->
                <div class="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 flex items-start gap-2">
                  <svg class="w-4 h-4 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-xs text-charcoal leading-relaxed">
                    Esta es una <strong>previsualización de referencia</strong>. El resultado real generado por IA estará disponible próximamente con mayor precisión.
                  </p>
                </div>

                <!-- Acciones -->
                <div class="flex flex-col gap-2 mt-auto">
                  <button
                    @click="showroomStep = 'material'; selectedMaterial = null; uploadedPhoto = null"
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
                <!-- Avatar bot -->
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
