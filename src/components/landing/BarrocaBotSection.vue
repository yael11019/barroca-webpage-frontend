<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useProductosStore } from '@/stores/productos'
import type { ProductoCatalogo, ColorCatalogo } from '@/types/producto'
import { imageUrl } from '@/utils/imageUrl'
import api from '@/services/api'
import ShowroomMaterialPicker from '@/components/landing/ShowroomMaterialPicker.vue'

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
  productosStore.fetchProductos()
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
  '¿Qué servicios ofrece Barroca?',
  '¿Dónde están ubicados?',
  '¿Cuáles son sus horarios de atención?',
  '¿Cómo puedo cotizar?',
  '¿Tienen catálogo de melaminas?',
  '¿Hacen corte y enchapado juntos?',
]

const faqs = [
  // ── Servicios generales ────────────────────────────────────────────────────
  {
    keywords: ['servicios', 'que ofrece', 'qué ofrece', 'que hacen', 'qué hacen', 'que tienen', 'qué tienen', 'que venden', 'qué venden'],
    respuesta: 'En **Barroca** ofrecemos:\n\n• **Melaminas** — más de 200 referencias en colores, vetas y texturas\n• **Pisos SPC y Vinílicos** — alta durabilidad y diseño\n• **Corte a medida** — con despiece incluido\n• **Enchapado de cubrecantos** — acabado perfecto para tus tableros\n• **Afilado de discos** — disponible para todos\n• **Envío a domicilio** — en compras realizadas con nosotros\n\n¿Sobre cuál te gustaría saber más? 😊',
  },

  // ── Ubicación ──────────────────────────────────────────────────────────────
  {
    keywords: ['ubicacion', 'ubicación', 'sucursal', 'tienda', 'direccion', 'dirección', 'donde', 'dónde', 'ubicados'],
    respuesta: 'Contamos con sucursales en la **zona centro de México**. Escríbenos por WhatsApp y te indicamos la más cercana o coordinamos una visita. 📍\n\n**WhatsApp**: +52 443 339 6659',
  },

  // ── Horarios ───────────────────────────────────────────────────────────────
  {
    keywords: ['horario', 'horarios', 'atencion', 'atención', 'abren', 'cierran', 'cuando atienden', 'cuándo atienden', 'dias de trabajo'],
    respuesta: 'Nuestro horario de atención es:\n\n• **Lunes a Viernes**: 8:00 – 17:00\n• **Sábados**: 8:00 – 13:00\n\nFuera de horario puedes escribirnos por **WhatsApp** y te respondemos a la brevedad. ⏰',
  },

  // ── Cotización ─────────────────────────────────────────────────────────────
  {
    keywords: ['cotizar', 'cotizacion', 'cotización', 'presupuesto', 'precio', 'cuanto cuesta', 'cuánto cuesta', 'cuanto vale', 'cobran'],
    respuesta: 'Para cotizar, contáctanos por **WhatsApp al +52 443 339 6659** con:\n\n1. Material que necesitas (melamina, piso, etc.)\n2. Medidas o m² aproximados\n3. Servicio adicional (corte, enchapado)\n\nTe enviamos tu cotización personalizada a la brevedad. 📋',
  },

  // ── Catálogo de melaminas ──────────────────────────────────────────────────
  {
    keywords: ['catalogo', 'catálogo', 'catalogo de melaminas', 'colores melamina', 'referencias', 'modelos'],
    respuesta: 'Contamos con más de **200 referencias** en melamina:\n\n• **Sólidos** — blanco, negro, gris y más\n• **Vetas de madera** — roble, nogal, wengué, pino…\n• **Texturas metálicas y especiales**\n\nPuedes ver el catálogo en la sección de **Productos** o escribirnos para enviarte el PDF completo. 🎨\n\n**WhatsApp**: +52 443 339 6659',
  },

  // ── Espesores de melamina ──────────────────────────────────────────────────
  {
    keywords: ['espesor', 'espesores', 'grosor', 'milimetros', 'milímetros', 'mm', 'grueso', 'calibre'],
    respuesta: 'Manejamos melamina en los siguientes espesores:\n\n• **9 mm** — entrepaños y fondos\n• **15 mm** — uso general\n• **18 mm** — el más común en muebles\n• **25 mm** — para estructuras de mayor carga\n\nContacta por **WhatsApp** para confirmar disponibilidad de cada espesor. 📐',
  },

  // ── Precios para distribuidor ──────────────────────────────────────────────
  {
    keywords: ['precio distribuidor', 'precio para distribuidor', 'precios mayoreo', 'precio mayorista', 'mayoreo', 'precio especial'],
    respuesta: 'Sí contamos con **precios para distribuidor y mayoreo**. Para acceder a ellos:\n\n1. Visita la sección **Distribuidores** y llena tu solicitud\n2. O escríbenos directo por **WhatsApp al +52 443 339 6659**\n\nAnalizamos tu propuesta y te asignamos condiciones especiales. 🤝',
  },

  // ── Tipo de tablero ────────────────────────────────────────────────────────
  {
    keywords: ['aglomerado', 'mdf', 'tipo de tablero', 'madera tablero', 'particula', 'partícula', 'de que es'],
    respuesta: 'Nuestras melaminas están fabricadas sobre **tablero de aglomerado (partícula)**:\n\n• Mayor estabilidad dimensional\n• Excelente agarre de tornillos\n• Superficie recubierta con papel melamínico\n\nSi necesitas tablero **MDF** para proyectos específicos, consúltanos por **WhatsApp** ya que la disponibilidad puede variar. 🪵',
  },

  // ── Corte a medida ─────────────────────────────────────────────────────────
  {
    keywords: ['corte', 'cortar', 'costo corte', 'precio corte', 'cuanto corte', 'cuánto corte', 'servicio de corte'],
    respuesta: 'Sí ofrecemos **corte a medida** con tolerancias exactas.\n\nEl costo depende de la cantidad de cortes y el material. Para cotizar envíanos tu **lista de medidas** por **WhatsApp al +52 443 339 6659** y te damos precio inmediato. ✂️',
  },

  // ── Despiece ───────────────────────────────────────────────────────────────
  {
    keywords: ['despiece', 'optimizacion', 'optimización', 'lista de cortes', 'plano', 'distribucion de cortes', 'ayudan con medidas'],
    respuesta: 'Sí, te ayudamos con el **despiece de tus medidas**. Puedes enviarnos:\n\n• Tu lista de piezas (ancho × alto en mm o cm)\n• El material y espesor que necesitas\n\nNosotros optimizamos los cortes para minimizar desperdicio. Escríbenos por **WhatsApp al +52 443 339 6659**. 📐',
  },

  // ── Enchapado ─────────────────────────────────────────────────────────────
  {
    keywords: ['enchapado', 'cuanto tarda enchapado', 'cuánto tarda enchapado', 'tiempo enchapado', 'tarda el enchapado'],
    respuesta: 'El servicio de **enchapado de cubrecantos** se realiza el **mismo día** si tu material llega en la mañana, o al siguiente día hábil.\n\nEl tiempo exacto depende de la cantidad de piezas. Confirma por **WhatsApp al +52 443 339 6659**. ⏱️',
  },

  // ── Tipos de canto ─────────────────────────────────────────────────────────
  {
    keywords: ['tipo de canto', 'tipos de canto', 'canto pvc', 'canto madera', 'cubrecantos', 'que cantos', 'qué cantos'],
    respuesta: 'Manejamos cubrecantos en **PVC** en distintos acabados y colores que combinan con nuestra línea de melaminas:\n\n• Cantos lisos y con textura\n• Colores coordinados con cada referencia\n• Anchos de 22 mm y 44 mm\n\nConsulta disponibilidad por **WhatsApp al +52 443 339 6659**. 🪛',
  },

  // ── Corte y enchapado juntos ───────────────────────────────────────────────
  {
    keywords: ['corte y enchapado', 'enchapado y corte', 'juntos', 'los dos servicios', 'combo', 'ambos servicios'],
    respuesta: '¡Sí! Puedes solicitar **corte a medida + enchapado de cubrecantos** en un solo pedido.\n\nEs uno de nuestros servicios más solicitados porque recibes tus piezas listas para ensamblar. Envíanos tu despiece por **WhatsApp al +52 443 339 6659** y cotizamos todo junto. ✅',
  },

  // ── Piso SPC agua ──────────────────────────────────────────────────────────
  {
    keywords: ['spc', 'piso spc', 'resistente al agua', 'agua piso', 'humedad piso', 'impermeab', 'baño cocina piso'],
    respuesta: 'Sí, el **Piso SPC** es **100% resistente al agua** gracias a su núcleo de piedra compuesta (Stone Plastic Composite).\n\n• Ideal para cocinas, baños y áreas húmedas\n• No se hincha ni se deforma\n• Alta durabilidad ante impactos\n\n¡Usa el **Showroom Virtual** para verlo en tu espacio! 💧',
  },

  // ── Precio piso SPC ────────────────────────────────────────────────────────
  {
    keywords: ['precio piso', 'cuanto piso', 'cuánto piso', 'caja spc', 'costo piso', 'precio spc', 'precio caja'],
    respuesta: 'El precio del **Piso SPC** varía según el modelo, espesor y metraje por caja. Para darte el precio actualizado escríbenos por **WhatsApp al +52 443 339 6659** indicando el modelo que te interesa. 📦',
  },

  // ── Afilado de discos ──────────────────────────────────────────────────────
  {
    keywords: ['afilar', 'afilado', 'disco', 'discos', 'sierra', 'cuchilla', 'cuanto afilar', 'precio afilar'],
    respuesta: 'Ofrecemos **afilado de discos** a través de nuestro aliado **Afilados del Bajío**. Este servicio está disponible para todos, no solo clientes de Barroca.\n\nAfilan discos para:\n• Sierra circular\n• Caladora\n• Router / fresadora\n\nPara precios y tiempos, contáctanos por **WhatsApp al +52 443 339 6659**. 🔪',
  },

  // ── Envíos ─────────────────────────────────────────────────────────────────
  {
    keywords: ['envio', 'envío', 'domicilio', 'entregan', 'llevan', 'reparto', 'mandan', 'envian', 'envían', 'flete'],
    respuesta: 'Sí hacemos **envíos a domicilio**, disponible exclusivamente en compras realizadas con nosotros.\n\nTiempos de entrega aproximados:\n• **Local**: 1-2 días hábiles\n• **Zona Centro**: 2-3 días hábiles\n• **Foráneo**: 4-6 días hábiles\n\nConsulta disponibilidad de envío a tu zona por **WhatsApp al +52 443 339 6659**. 🚚',
  },

  // ── Garantía ───────────────────────────────────────────────────────────────
  {
    keywords: ['garantia', 'garantía', 'devolu', 'cambio', 'defecto', 'falla', 'danado', 'dañado'],
    respuesta: 'Todos nuestros productos tienen **garantía de calidad**. Si recibes un producto con defecto de fabricación, lo reemplazamos sin costo dentro de los primeros **7 días** de recibida la entrega. ✅\n\nEscríbenos por **WhatsApp al +52 443 339 6659** con foto del producto.',
  },

  // ── Showroom ───────────────────────────────────────────────────────────────
  {
    keywords: ['showroom', 'visualizar', 'visualiza', 'ver como', 'probar', 'prueba', 'foto espacio', 'ia', 'inteligencia artificial'],
    respuesta: '¡Usa el **Showroom Virtual** justo aquí al lado! 👈\n\n1. Elige el material que te interesa\n2. Sube una foto de tu espacio\n3. La IA genera cómo quedaría\n\n¡Es muy fácil y completamente gratis!',
  },

  // ── Contacto ───────────────────────────────────────────────────────────────
  {
    keywords: ['whatsapp', 'telefono', 'teléfono', 'llamar', 'contacto', 'contactar', 'numero', 'número', 'correo', 'email'],
    respuesta: 'Puedes contactarnos por:\n\n• **WhatsApp**: +52 443 339 6659\n• **Llamadas**: +52 417 178 0247\n• **Correo**: marketingbarroca@gmail.com\n\nHorario: Lun–Vie 8:00–17:00, Sáb 8:00–13:00 📞',
  },

  // ── Distribuidores ─────────────────────────────────────────────────────────
  {
    keywords: ['distribuidor', 'distribui', 'revendedor', 'reventa', 'ser distribuidor'],
    respuesta: 'Si te interesa ser distribuidor Barroca, visita la sección de **Distribuidores** y llena el formulario de solicitud. ¡Con gusto analizamos tu propuesta! 🤝\n\nO escríbenos directo por **WhatsApp al +52 443 339 6659**.',
  },

  // ── Saludos ────────────────────────────────────────────────────────────────
  {
    keywords: ['hola', 'hello', 'buenos', 'buenas', 'saludos', 'que tal', 'qué tal', 'buen dia', 'buen día'],
    respuesta: '¡Hola de nuevo! 👋 ¿En qué puedo ayudarte hoy? Pregúntame lo que necesites o usa los botones de abajo para preguntas frecuentes.',
  },

  // ── Despedida ──────────────────────────────────────────────────────────────
  {
    keywords: ['gracias', 'thanks', 'perfecto', 'excelente', 'genial', 'muy bien', 'listo', 'ok'],
    respuesta: '¡Con mucho gusto! 😊 Si tienes más preguntas, aquí estaré. También puedes contactarnos por **WhatsApp al +52 443 339 6659** para atención personalizada.',
  },
]

const defaultResponse = 'No tengo información específica sobre eso, pero con gusto te atendemos directamente. 😊\n\nEscríbenos por **WhatsApp al +52 443 339 6659** o usa los botones de abajo para preguntas frecuentes.'

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
    respuesta = data?.content ?? getBotResponse(msg)
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { content?: string } } }
    respuesta = axiosErr?.response?.data?.content ?? getBotResponse(msg)
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
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const processingError = ref<string | null>(null)
const resultImage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewOpen = ref(false)

// ── Modo del showroom ──────────────────────────────────────────────────────
// 'single'   = un solo material (melamina o piso)
// 'combinar' = melamina (muebles) + piso (suelo) en una misma visualización
type ShowroomModo = 'single' | 'combinar'
const showroomModo = ref<ShowroomModo>('single')

function productosDeTipo(tipoKey: string): ProductoCatalogo[] {
  return productosStore.productos.filter((p: ProductoCatalogo) =>
    p.tipo?.toUpperCase().startsWith(tipoKey) && p.colores.length > 0
  )
}

const melaminasDisponibles = computed(() => productosDeTipo('MELAMINA'))
const pisosDisponibles = computed(() => productosDeTipo('PISO'))
const hayMelaminas = computed(() => melaminasDisponibles.value.length > 0)
const hayPisos = computed(() => pisosDisponibles.value.length > 0)
const puedeCombinar = computed(() => hayMelaminas.value && hayPisos.value)

// ── Selección single (Tipo → Producto/Línea → Color) ───────────────────────
const showroomTipo = ref<string | null>(null)
const showroomProducto = ref<ProductoCatalogo | null>(null)
const showroomColorIdx = ref<number>(0)

const productosDelTipo = computed((): ProductoCatalogo[] =>
  showroomTipo.value ? productosDeTipo(showroomTipo.value.toUpperCase()) : []
)

const showroomColor = computed((): ColorCatalogo | null => {
  if (!showroomProducto.value) return null
  return showroomProducto.value.colores[showroomColorIdx.value] ?? showroomProducto.value.colores[0] ?? null
})

// ── Selección combinar (melamina + piso, AMBOS obligatorios) ───────────────
const melaminaProducto = ref<ProductoCatalogo | null>(null)
const melaminaColorIdx = ref<number>(0)
const pisoProducto = ref<ProductoCatalogo | null>(null)
const pisoColorIdx = ref<number>(0)

const melaminaColor = computed((): ColorCatalogo | null => {
  if (!melaminaProducto.value) return null
  return melaminaProducto.value.colores[melaminaColorIdx.value] ?? melaminaProducto.value.colores[0] ?? null
})
const pisoColor = computed((): ColorCatalogo | null => {
  if (!pisoProducto.value) return null
  return pisoProducto.value.colores[pisoColorIdx.value] ?? pisoProducto.value.colores[0] ?? null
})

// Combinar obliga a tener melamina+color Y piso+color antes de continuar
const puedeAvanzar = computed(() =>
  showroomModo.value === 'combinar'
    ? !!melaminaColor.value && !!pisoColor.value
    : !!showroomProducto.value && !!showroomColor.value
)

function selectModo(modo: ShowroomModo, tipo: string | null = null) {
  showroomModo.value = modo
  showroomTipo.value = tipo
  showroomProducto.value = null
  showroomColorIdx.value = 0
  melaminaProducto.value = null
  melaminaColorIdx.value = 0
  pisoProducto.value = null
  pisoColorIdx.value = 0
}

function selectProducto(p: ProductoCatalogo) {
  showroomProducto.value = p
  showroomColorIdx.value = 0
}
function selectMelamina(p: ProductoCatalogo) {
  melaminaProducto.value = p
  melaminaColorIdx.value = 0
}
function selectPiso(p: ProductoCatalogo) {
  pisoProducto.value = p
  pisoColorIdx.value = 0
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
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = ev => { uploadedPhoto.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// ── Visualización ─────────────────────────────────────────────────────────
async function runVisualization() {
  if (!uploadedFile.value || !puedeAvanzar.value) return
  isProcessing.value = true
  processingError.value = null
  resultImage.value = null

  try {
    const formData = new FormData()
    formData.append('imagen', uploadedFile.value)

    if (showroomModo.value === 'combinar') {
      formData.append('modo', 'combinado')
      formData.append('melamina_producto_id', String(melaminaProducto.value!.id))
      formData.append('melamina_color_nombre', melaminaColor.value!.nombre)
      formData.append('piso_producto_id', String(pisoProducto.value!.id))
      formData.append('piso_color_nombre', pisoColor.value!.nombre)
    } else {
      // Modo single: payload idéntico al actual (no se rompe el flujo vigente)
      formData.append('producto_id', String(showroomProducto.value!.id))
      formData.append('color_nombre', showroomColor.value!.nombre)
    }

    const { data } = await api.post('/api/public/visualizador', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })

    resultImage.value = data.image_url
    showroomStep.value = 'result'
  } catch (err: any) {
    const msg = err?.response?.data?.message
    processingError.value = msg ?? 'Error al generar la imagen. Inténtalo de nuevo.'
  } finally {
    isProcessing.value = false
  }
}

function limpiarSeleccion() {
  showroomModo.value = 'single'
  showroomTipo.value = null
  showroomProducto.value = null
  showroomColorIdx.value = 0
  melaminaProducto.value = null
  melaminaColorIdx.value = 0
  pisoProducto.value = null
  pisoColorIdx.value = 0
  resultImage.value = null
  processingError.value = null
}

function resetShowroom() {
  showroomStep.value = 'material'
  limpiarSeleccion()
  uploadedPhoto.value = null
  uploadedFile.value = null
  isProcessing.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function probarOtroMaterial() {
  // Mantiene la foto, limpia la selección de material
  showroomStep.value = 'material'
  limpiarSeleccion()
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
                <p class="text-xs text-gray-400">Visualización con IA</p>
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
                  1. ¿Qué quieres visualizar?
                </p>

                <!-- Loading del catálogo -->
                <div v-if="productosStore.loading && !hayMelaminas && !hayPisos" class="flex items-center gap-2 text-gray-400 text-xs">
                  <div class="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  Cargando catálogo...
                </div>

                <template v-else>
                  <!-- Selector de modo -->
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-if="hayMelaminas"
                      @click="selectModo('single', 'MELAMINA')"
                      class="px-2 py-2 rounded-lg text-xs font-heading font-semibold border transition-colors leading-tight"
                      :class="showroomModo === 'single' && showroomTipo === 'MELAMINA'
                        ? 'bg-gold text-charcoal border-gold'
                        : 'border-gray-200 text-gray-500 hover:border-gold hover:text-charcoal'"
                    >
                      Solo melamina
                    </button>
                    <button
                      v-if="hayPisos"
                      @click="selectModo('single', 'PISO')"
                      class="px-2 py-2 rounded-lg text-xs font-heading font-semibold border transition-colors leading-tight"
                      :class="showroomModo === 'single' && showroomTipo === 'PISO'
                        ? 'bg-gold text-charcoal border-gold'
                        : 'border-gray-200 text-gray-500 hover:border-gold hover:text-charcoal'"
                    >
                      Solo piso
                    </button>
                    <button
                      v-if="puedeCombinar"
                      @click="selectModo('combinar')"
                      class="px-2 py-2 rounded-lg text-xs font-heading font-semibold border transition-colors leading-tight"
                      :class="showroomModo === 'combinar'
                        ? 'bg-gold text-charcoal border-gold'
                        : 'border-gray-200 text-gray-500 hover:border-gold hover:text-charcoal'"
                    >
                      Combinar
                    </button>
                  </div>

                  <!-- Modo single: un material -->
                  <ShowroomMaterialPicker
                    v-if="showroomModo === 'single' && showroomTipo"
                    :productos="productosDelTipo"
                    :producto="showroomProducto"
                    :color-idx="showroomColorIdx"
                    @select-producto="selectProducto"
                    @select-color="showroomColorIdx = $event"
                  />

                  <!-- Modo combinar: melamina (muebles) + piso (suelo) -->
                  <template v-else-if="showroomModo === 'combinar'">
                    <div class="rounded-xl border border-gray-100 p-3">
                      <p class="font-heading font-bold text-charcoal text-xs mb-3 flex items-center gap-1.5">
                        🪵 Melamina <span class="text-gray-400 font-normal normal-case">(muebles)</span>
                      </p>
                      <ShowroomMaterialPicker
                        :productos="melaminasDisponibles"
                        :producto="melaminaProducto"
                        :color-idx="melaminaColorIdx"
                        @select-producto="selectMelamina"
                        @select-color="melaminaColorIdx = $event"
                      />
                    </div>
                    <div class="rounded-xl border border-gray-100 p-3">
                      <p class="font-heading font-bold text-charcoal text-xs mb-3 flex items-center gap-1.5">
                        🟫 Piso <span class="text-gray-400 font-normal normal-case">(suelo)</span>
                      </p>
                      <ShowroomMaterialPicker
                        :productos="pisosDisponibles"
                        :producto="pisoProducto"
                        :color-idx="pisoColorIdx"
                        @select-producto="selectPiso"
                        @select-color="pisoColorIdx = $event"
                      />
                    </div>
                    <p v-if="!puedeAvanzar" class="text-[11px] text-gray-400 text-center">
                      Elige una melamina y un piso para continuar.
                    </p>
                  </template>

                  <!-- Botón continuar -->
                  <button
                    v-if="showroomTipo || showroomModo === 'combinar'"
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
                  <!-- Single: un material -->
                  <template v-if="showroomModo === 'single'">
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
                  </template>

                  <!-- Combinar: melamina + piso -->
                  <template v-else>
                    <div class="flex -space-x-2 flex-shrink-0">
                      <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-white">
                        <img v-if="melaminaColor?.imagenes[0]" :src="imageUrl(melaminaColor.imagenes[0].url)" :alt="melaminaColor.nombre" class="w-full h-full object-cover" />
                      </div>
                      <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-white">
                        <img v-if="pisoColor?.imagenes[0]" :src="imageUrl(pisoColor.imagenes[0].url)" :alt="pisoColor.nombre" class="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-400 truncate">🪵 {{ melaminaColor?.nombre }}</p>
                      <p class="text-xs text-gray-400 truncate">🟫 {{ pisoColor?.nombre }}</p>
                    </div>
                  </template>
                </div>

                <div>
                  <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">
                    2. Sube una foto del espacio que quieres modificar
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Asegúrate de que se vea suficiente del espacio para poder modificarlo<span v-if="showroomModo === 'combinar'">, tanto el piso como las superficies donde irá la melamina</span>.
                  </p>
                </div>

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
                  {{ isProcessing ? 'Generando...' : 'Visualizar en mi espacio' }}
                </button>
              </div>
            </Transition>

            <!-- ── Paso 3: Resultado ───────────────────────────────── -->
            <Transition name="step" mode="out-in">
              <div v-if="showroomStep === 'result'" key="step3" class="flex-1 p-5 flex flex-col gap-4">

                <p class="font-heading font-bold text-charcoal text-xs uppercase tracking-wider">
                  <template v-if="showroomModo === 'combinar'">3. Tu espacio con {{ melaminaColor?.nombre }} + {{ pisoColor?.nombre }}</template>
                  <template v-else>3. Tu espacio con {{ showroomColor?.nombre }}</template>
                </p>

                <!-- Resultado generado -->
                <div class="relative rounded-xl overflow-hidden aspect-video bg-gray-100 flex-shrink-0">
                  <img
                    v-if="resultImage"
                    :src="resultImage"
                    class="w-full h-full object-cover cursor-zoom-in"
                    alt="Visualización generada"
                    @click="previewOpen = true"
                  />
                  <!-- Fallback: foto original si no hay resultado -->
                  <img
                    v-else-if="uploadedPhoto"
                    :src="uploadedPhoto"
                    class="w-full h-full object-cover"
                    alt="Espacio del usuario"
                  />
                  <!-- Badge -->
                  <div class="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
                    <template v-if="showroomModo === 'combinar'">
                      <span class="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-heading font-semibold backdrop-blur-sm">
                        🪵 {{ melaminaColor?.nombre }}
                      </span>
                      <span class="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-heading font-semibold backdrop-blur-sm">
                        🟫 {{ pisoColor?.nombre }}
                      </span>
                    </template>
                    <span v-else class="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-heading font-semibold backdrop-blur-sm">
                      {{ showroomColor?.nombre }} · {{ showroomProducto?.nombre }}
                    </span>
                    <button
                      v-if="resultImage"
                      type="button"
                      @click="previewOpen = true"
                      class="text-xs bg-gold hover:bg-gold-dark text-charcoal px-2 py-1 rounded-full font-heading font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7"/>
                      </svg>
                      Preview
                    </button>
                  </div>
                </div>

                <!-- Comparación: material(es) aplicado(s) -->
                <!-- Combinar -->
                <div v-if="showroomModo === 'combinar'" class="grid grid-cols-2 gap-2">
                  <div v-if="melaminaColor?.imagenes[0]" class="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                    <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img :src="imageUrl(melaminaColor.imagenes[0].url)" :alt="melaminaColor.nombre" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] text-gray-400 font-heading">🪵 Melamina</p>
                      <p class="text-xs font-heading font-bold text-charcoal truncate">{{ melaminaColor.nombre }}</p>
                    </div>
                  </div>
                  <div v-if="pisoColor?.imagenes[0]" class="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                    <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img :src="imageUrl(pisoColor.imagenes[0].url)" :alt="pisoColor.nombre" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] text-gray-400 font-heading">🟫 Piso</p>
                      <p class="text-xs font-heading font-bold text-charcoal truncate">{{ pisoColor.nombre }}</p>
                    </div>
                  </div>
                </div>
                <!-- Single -->
                <div v-else-if="showroomColor?.imagenes[0]" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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
                    @click="probarOtroMaterial"
                    class="w-full border border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-heading font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Probar otro material con esta foto
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

    <!-- ── Modal Preview de la imagen generada ────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="previewOpen && resultImage"
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        @click.self="previewOpen = false"
      >
        <button
          type="button"
          @click="previewOpen = false"
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div class="relative max-w-5xl w-full" @click.stop>
          <img
            :src="resultImage"
            :alt="`Visualización con ${showroomColor?.nombre}`"
            class="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <div class="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <span class="text-xs sm:text-sm bg-black/60 text-white px-3 py-1.5 rounded-full font-heading font-semibold backdrop-blur-sm">
              {{ showroomColor?.nombre }} · {{ showroomProducto?.nombre }}
            </span>
            <span class="text-xs sm:text-sm bg-gold text-charcoal px-3 py-1.5 rounded-full font-heading font-bold">
              Preview
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.step-enter-active, .step-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.step-enter-from { opacity: 0; transform: translateX(12px); }
.step-leave-to { opacity: 0; transform: translateX(-12px); }
</style>
