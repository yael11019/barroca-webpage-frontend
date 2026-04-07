<script setup lang="ts">
import { ref, computed } from 'vue'

// ── Tipos ──────────────────────────────────────────────────────────────────
type TipoProyecto = 'todos' | 'residencial' | 'comercial' | 'oficinas' | 'exterior'

interface Proyecto {
  id: number
  nombre: string
  ubicacion: string
  empresa: string
  tipo: Exclude<TipoProyecto, 'todos'>
  materiales: string[]
  descripcion: string
  año: number
  fotos: string[] // TODO: URLs reales del backend
  gradiente: string
}

interface Testimonio {
  id: number
  nombre: string
  ubicacion: string
  comentario: string
  calificacion: number
  proyecto: string
}

interface Tutorial {
  id: number
  titulo: string
  tipo: 'video' | 'articulo'
  duracion: string
  descripcion: string
  gradiente: string
}

// ── Filtros ────────────────────────────────────────────────────────────────
const filtroActivo = ref<TipoProyecto>('todos')
const vistaGrid = ref(true) // true = grid, false = lista

const filtros: { key: TipoProyecto; label: string }[] = [
  { key: 'todos',       label: 'Todos' },
  { key: 'residencial', label: 'Residencial' },
  { key: 'comercial',   label: 'Comercial' },
  { key: 'oficinas',    label: 'Oficinas' },
  { key: 'exterior',    label: 'Exterior' },
]

// ── Proyectos (mock — TODO: GET /api/public/proyectos) ────────────────────
const proyectos: Proyecto[] = [
  {
    id: 1,
    nombre: 'Residencia Pedregal',
    ubicacion: 'Pedregal, CDMX',
    empresa: 'Arq. Mendoza & Asociados',
    tipo: 'residencial',
    materiales: ['Melamina Nogal', 'Piso SPC Roble'],
    descripcion: 'Remodelación integral de sala-comedor y cocina con melaminas en tonos cálidos. El proyecto buscaba unificar los espacios bajo una estética contemporánea y acogedora que reflejara el estilo de vida de la familia.',
    año: 2024,
    fotos: ['', '', ''],
    gradiente: 'from-amber-100 to-orange-50',
  },
  {
    id: 2,
    nombre: 'Oficinas Torre Reforma',
    ubicacion: 'Paseo de la Reforma, CDMX',
    empresa: 'Diseño Interior MX',
    tipo: 'oficinas',
    materiales: ['Melamina Blanca', 'Melamina Gris Cemento'],
    descripcion: 'Adecuación de tres pisos de oficinas corporativas. Se utilizaron melaminas en blanco y gris para crear un ambiente limpio, profesional y altamente funcional con divisiones modulares.',
    año: 2024,
    fotos: ['', '', '', ''],
    gradiente: 'from-slate-100 to-gray-50',
  },
  {
    id: 3,
    nombre: 'Restaurante El Patio',
    ubicacion: 'Cholula, Puebla',
    empresa: 'Studio Culinario Arq.',
    tipo: 'comercial',
    materiales: ['Melamina Roble Natural', 'Piso Vinílico Gris'],
    descripcion: 'Diseño y habilitación de un restaurante con capacidad para 80 comensales. La paleta de materiales en tonos madera y gris generó una atmósfera cálida y sofisticada acorde al concepto gastronómico.',
    año: 2023,
    fotos: ['', '', ''],
    gradiente: 'from-orange-100 to-amber-50',
  },
  {
    id: 4,
    nombre: 'Casa Juriquilla',
    ubicacion: 'Juriquilla, Querétaro',
    empresa: 'Construye QRO',
    tipo: 'residencial',
    materiales: ['Melamina Verde Salvia', 'Piso SPC Roble'],
    descripcion: 'Casa habitación de 320 m² con aplicación de melaminas en tonos verdes para integrar el interior con los jardines exteriores. Proyecto ganador del Premio Regional de Diseño 2023.',
    año: 2023,
    fotos: ['', ''],
    gradiente: 'from-green-100 to-emerald-50',
  },
  {
    id: 5,
    nombre: 'Showroom Automotriz',
    ubicacion: 'Santa Fe, CDMX',
    empresa: 'Grupo Constructivo Norte',
    tipo: 'comercial',
    materiales: ['Melamina Negro Mate', 'Melamina Blanca'],
    descripcion: 'Habilitación de showroom para agencia de autos de lujo. Combinación de melaminas en negro mate y blanco para resaltar los vehículos en exhibición con una propuesta visual de alto impacto.',
    año: 2024,
    fotos: ['', '', ''],
    gradiente: 'from-zinc-200 to-slate-100',
  },
  {
    id: 6,
    nombre: 'Terraza Jardín Cuernavaca',
    ubicacion: 'Cuernavaca, Morelos',
    empresa: 'Paisajismo del Sur',
    tipo: 'exterior',
    materiales: ['Piso SPC Exterior', 'Melamina para exteriores'],
    descripcion: 'Intervención de terraza y jardín de 180 m² con pisos SPC especiales para exteriores. El material seleccionado ofrece resistencia UV y a la humedad sin sacrificar estética.',
    año: 2023,
    fotos: ['', '', ''],
    gradiente: 'from-teal-100 to-green-50',
  },
  {
    id: 7,
    nombre: 'Departamento Santa Fe',
    ubicacion: 'Santa Fe, CDMX',
    empresa: 'Remodelaciones DF',
    tipo: 'residencial',
    materiales: ['Melamina Blanca', 'Melamina Roble Natural'],
    descripcion: 'Remodelación completa de departamento de 95 m². Combinación de blanco y tonos madera para maximizar la sensación de amplitud en espacios compactos.',
    año: 2024,
    fotos: ['', ''],
    gradiente: 'from-blue-50 to-indigo-50',
  },
  {
    id: 8,
    nombre: 'Centro Comercial Forum León',
    ubicacion: 'León, Guanajuato',
    empresa: 'MegaConstruye S.A.',
    tipo: 'comercial',
    materiales: ['Piso SPC Comercial', 'Melamina Gris Cemento'],
    descripcion: 'Habilitación de locales comerciales en zona de alto tráfico. Se priorizaron materiales de alta durabilidad y fácil mantenimiento sin sacrificar la propuesta estética del centro comercial.',
    año: 2023,
    fotos: ['', '', '', ''],
    gradiente: 'from-purple-50 to-violet-50',
  },
]

const proyectosFiltrados = computed(() =>
  filtroActivo.value === 'todos'
    ? proyectos
    : proyectos.filter(p => p.tipo === filtroActivo.value),
)

// ── Modal proyecto ─────────────────────────────────────────────────────────
const proyectoModal = ref<Proyecto | null>(null)
const fotoIndex = ref(0)

function abrirProyecto(p: Proyecto) {
  proyectoModal.value = p
  fotoIndex.value = 0
}
function cerrarModal() { proyectoModal.value = null }
function prevFoto() {
  if (!proyectoModal.value) return
  fotoIndex.value = (fotoIndex.value - 1 + proyectoModal.value.fotos.length) % proyectoModal.value.fotos.length
}
function nextFoto() {
  if (!proyectoModal.value) return
  fotoIndex.value = (fotoIndex.value + 1) % proyectoModal.value.fotos.length
}

// ── Testimonios (mock — TODO: GET /api/public/testimonios) ────────────────
const testimonios: Testimonio[] = [
  {
    id: 1,
    nombre: 'Laura Martínez',
    ubicacion: 'CDMX',
    comentario: 'Quedamos encantados con el resultado. La melamina Nogal le dio exactamente la calidez que buscábamos para el comedor. El equipo de Barroca fue muy profesional y puntual en la entrega.',
    calificacion: 5,
    proyecto: 'Residencia Pedregal',
  },
  {
    id: 2,
    nombre: 'Carlos Ibáñez',
    ubicacion: 'Querétaro',
    comentario: 'Excelente calidad de materiales. Llevamos 8 meses con los pisos SPC y se ven igual que el primer día. La asesoría que nos dieron para elegir el acabado correcto fue invaluable.',
    calificacion: 5,
    proyecto: 'Casa Juriquilla',
  },
  {
    id: 3,
    nombre: 'Sofía Reyes',
    ubicacion: 'Puebla',
    comentario: 'El restaurante quedó precioso. Nuestros clientes constantemente preguntan por los acabados y se sorprenden cuando les decimos el precio. Definitivamente la mejor relación calidad-precio del mercado.',
    calificacion: 5,
    proyecto: 'Restaurante El Patio',
  },
  {
    id: 4,
    nombre: 'Ing. Roberto Campos',
    ubicacion: 'León, Guanajuato',
    comentario: 'Para proyectos de gran escala como el nuestro necesitábamos un proveedor confiable. Barroca cumplió en tiempos, calidad y precio. Ya tenemos tres proyectos más planificados con ellos.',
    calificacion: 5,
    proyecto: 'Centro Comercial Forum León',
  },
  {
    id: 5,
    nombre: 'Ana Villegas',
    ubicacion: 'Cuernavaca, Morelos',
    comentario: 'La terraza quedó hermosa y los pisos han aguantado sol, lluvia y todo. Increíble que un material tan bonito sea tan resistente. 100% recomendado para exteriores.',
    calificacion: 5,
    proyecto: 'Terraza Jardín Cuernavaca',
  },
]

const testimonioActivo = ref(0)
const testimonio = computed(() => testimonios[testimonioActivo.value] ?? testimonios[0]!)
function prevTestimonio() {
  testimonioActivo.value = (testimonioActivo.value - 1 + testimonios.length) % testimonios.length
}
function nextTestimonio() {
  testimonioActivo.value = (testimonioActivo.value + 1) % testimonios.length
}

// ── Tutoriales (mock — TODO: GET /api/public/tutoriales) ──────────────────
const tutoriales: Tutorial[] = [
  {
    id: 1,
    titulo: 'Cómo instalar melamina en cocinas paso a paso',
    tipo: 'video',
    duracion: '12 min',
    descripcion: 'Guía completa desde la preparación de la superficie hasta los acabados finales. Incluye tips para cortes en ángulo y uniones invisibles.',
    gradiente: 'from-amber-100 to-orange-50',
  },
  {
    id: 2,
    titulo: 'Guía de selección: ¿qué piso SPC elegir?',
    tipo: 'articulo',
    duracion: '5 min lectura',
    descripcion: 'Comparativa detallada entre los diferentes acabados, grosores y resistencias. Te ayudamos a elegir el correcto según el tráfico y uso de cada espacio.',
    gradiente: 'from-blue-50 to-indigo-50',
  },
  {
    id: 3,
    titulo: 'Cuidado y mantenimiento de melaminas',
    tipo: 'video',
    duracion: '8 min',
    descripcion: 'Aprende cómo limpiar, proteger y mantener tus melaminas para que duren años en perfectas condiciones. Productos recomendados y técnicas correctas.',
    gradiente: 'from-green-100 to-emerald-50',
  },
  {
    id: 4,
    titulo: 'Diseño de espacios pequeños con melaminas claras',
    tipo: 'articulo',
    duracion: '7 min lectura',
    descripcion: 'Estrategias de diseño para maximizar la sensación de amplitud en departamentos y estudios usando la combinación correcta de colores y texturas.',
    gradiente: 'from-purple-50 to-violet-50',
  },
  {
    id: 5,
    titulo: 'Instalación de piso vinílico flotante',
    tipo: 'video',
    duracion: '15 min',
    descripcion: 'Tutorial detallado de instalación con herramientas básicas. Aprende a preparar la subbase, manejar las dilataciones y hacer los cortes de orilla perfectamente.',
    gradiente: 'from-teal-100 to-cyan-50',
  },
  {
    id: 6,
    titulo: 'Combinaciones de color: tendencias 2024-2025',
    tipo: 'articulo',
    duracion: '4 min lectura',
    descripcion: 'Las paletas de color más populares del año y cómo aplicarlas con nuestro catálogo. Inspiración real de proyectos terminados por nuestros clientes.',
    gradiente: 'from-rose-50 to-pink-50',
  },
]

// ── Helper ─────────────────────────────────────────────────────────────────
const tipoLabel: Record<Exclude<TipoProyecto, 'todos'>, string> = {
  residencial: 'Residencial',
  comercial:   'Comercial',
  oficinas:    'Oficinas',
  exterior:    'Exterior',
}

const tipoBadgeColor: Record<Exclude<TipoProyecto, 'todos'>, string> = {
  residencial: 'bg-amber-100 text-amber-800',
  comercial:   'bg-blue-100 text-blue-800',
  oficinas:    'bg-slate-100 text-slate-700',
  exterior:    'bg-green-100 text-green-800',
}
</script>

<template>
  <section id="proyectos" class="bg-white">

    <!-- ── Encabezado ──────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-10 text-center">
      <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-3">Portafolio</p>
      <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Proyectos & Comunidad</h2>
      <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
      <p class="text-gray-500 max-w-2xl mx-auto">
        Cada proyecto es una historia de transformación. Descubre cómo nuestros materiales han dado vida
        a espacios residenciales, comerciales y corporativos en todo México.
      </p>
    </div>

    <!-- ── Filtros + vista ─────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <!-- Tabs de filtro -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in filtros"
            :key="f.key"
            @click="filtroActivo = f.key"
            :class="[
              'px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-150',
              filtroActivo === f.key
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gold hover:text-gold',
            ]"
          >
            {{ f.label }}
            <span v-if="f.key !== 'todos'" class="ml-1.5 text-xs opacity-60">
              {{ proyectos.filter(p => p.tipo === f.key).length }}
            </span>
            <span v-else class="ml-1.5 text-xs opacity-60">{{ proyectos.length }}</span>
          </button>
        </div>

        <!-- Toggle vista grid / lista -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
          <button
            @click="vistaGrid = true"
            :class="['p-1.5 rounded-md transition-colors', vistaGrid ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-charcoal']"
            aria-label="Vista cuadrícula"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z"/>
            </svg>
          </button>
          <button
            @click="vistaGrid = false"
            :class="['p-1.5 rounded-md transition-colors', !vistaGrid ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-charcoal']"
            aria-label="Vista lista"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Galería GRID ────────────────────────────────────────────────── -->
    <div v-if="vistaGrid" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Transition name="fade" mode="out-in">
        <div :key="filtroActivo" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div
            v-for="p in proyectosFiltrados"
            :key="p.id"
            @click="abrirProyecto(p)"
            class="group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <!-- Foto / placeholder -->
            <div :class="`relative h-48 bg-gradient-to-br ${p.gradiente} flex items-center justify-center overflow-hidden`">
              <!-- TODO: <img v-if="p.fotos[0]" :src="p.fotos[0]" class="w-full h-full object-cover" /> -->
              <div class="flex flex-col items-center gap-2 opacity-30">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs font-heading font-semibold uppercase tracking-wider">{{ p.fotos.length }} fotos</span>
              </div>
              <!-- Badge tipo -->
              <div class="absolute top-3 left-3">
                <span :class="`text-xs font-heading font-bold px-2 py-1 rounded-full ${tipoBadgeColor[p.tipo]}`">
                  {{ tipoLabel[p.tipo] }}
                </span>
              </div>
              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-200 flex items-center justify-center">
                <span class="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-charcoal text-xs font-heading font-bold px-3 py-1.5 rounded-full shadow">
                  Ver proyecto
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="p-4">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 class="font-heading font-bold text-charcoal text-sm leading-snug">{{ p.nombre }}</h3>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ p.año }}</span>
              </div>
              <p class="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ p.ubicacion }}
              </p>
              <p class="text-xs text-gray-500">{{ p.empresa }}</p>
              <!-- Materiales -->
              <div class="flex flex-wrap gap-1 mt-3">
                <span
                  v-for="m in p.materiales"
                  :key="m"
                  class="text-xs bg-gold/10 text-charcoal px-2 py-0.5 rounded-full font-medium"
                >
                  {{ m }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Vista LISTA ─────────────────────────────────────────────────── -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Transition name="fade" mode="out-in">
        <div :key="filtroActivo" class="space-y-4">
          <div
            v-for="p in proyectosFiltrados"
            :key="p.id"
            @click="abrirProyecto(p)"
            class="group cursor-pointer bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex gap-4 overflow-hidden"
          >
            <!-- Foto mini -->
            <div :class="`relative w-32 sm:w-48 flex-shrink-0 bg-gradient-to-br ${p.gradiente} flex items-center justify-center`">
              <svg class="w-10 h-10 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Info -->
            <div class="py-4 pr-4 flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span :class="`text-xs font-heading font-bold px-2 py-0.5 rounded-full ${tipoBadgeColor[p.tipo]}`">
                  {{ tipoLabel[p.tipo] }}
                </span>
                <span class="text-xs text-gray-400">{{ p.año }}</span>
              </div>
              <h3 class="font-heading font-bold text-charcoal text-base mb-0.5">{{ p.nombre }}</h3>
              <p class="text-xs text-gray-400 mb-1">{{ p.ubicacion }} · {{ p.empresa }}</p>
              <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ p.descripcion }}</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="m in p.materiales" :key="m"
                  class="text-xs bg-gold/10 text-charcoal px-2 py-0.5 rounded-full font-medium">
                  {{ m }}
                </span>
              </div>
            </div>
            <!-- Arrow -->
            <div class="flex items-center pr-4 text-gray-300 group-hover:text-gold transition-colors flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Testimonios ─────────────────────────────────────────────────── -->
    <div class="bg-charcoal">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div class="text-center mb-12">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">Lo que dicen</p>
          <h3 class="font-heading text-2xl md:text-3xl font-bold text-white">Comentarios de Clientes</h3>
        </div>

        <div class="relative max-w-3xl mx-auto">
          <!-- Testimonial -->
          <Transition name="slide" mode="out-in">
            <div :key="testimonioActivo" class="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10">
              <!-- Estrellas -->
              <div class="flex gap-1 mb-6">
                <svg v-for="i in 5" :key="i" class="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <!-- Texto -->
              <blockquote class="text-white text-lg leading-relaxed mb-8 font-light">
                "{{ testimonio.comentario }}"
              </blockquote>
              <!-- Autor -->
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-gold font-heading font-bold text-sm">
                    {{ testimonio.nombre.charAt(0) }}
                  </span>
                </div>
                <div>
                  <p class="font-heading font-bold text-white text-sm">{{ testimonio.nombre }}</p>
                  <p class="text-gray-400 text-xs">{{ testimonio.ubicacion }} · {{ testimonio.proyecto }}</p>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Navegación -->
          <div class="flex items-center justify-between mt-6">
            <button @click="prevTestimonio"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-gold hover:text-gold transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <!-- Dots -->
            <div class="flex gap-2">
              <button
                v-for="(_, i) in testimonios"
                :key="i"
                @click="testimonioActivo = i"
                :class="['w-2 h-2 rounded-full transition-all duration-200', i === testimonioActivo ? 'bg-gold w-6' : 'bg-white/30 hover:bg-white/60']"
              />
            </div>

            <button @click="nextTestimonio"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-gold hover:text-gold transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tutoriales ──────────────────────────────────────────────────── -->
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div class="text-center mb-10">
          <p class="font-heading text-gold text-sm font-semibold uppercase tracking-widest mb-2">Aprende</p>
          <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Tutoriales</h3>
          <div class="w-16 h-1 bg-gold mx-auto mb-4"></div>
          <p class="text-gray-500 text-sm max-w-lg mx-auto">
            Guías y videos para sacarle el máximo provecho a nuestros materiales.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="t in tutoriales"
            :key="t.id"
            class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group cursor-pointer"
          >
            <!-- Thumbnail placeholder -->
            <div :class="`relative h-40 bg-gradient-to-br ${t.gradiente} flex items-center justify-center`">
              <!-- Video play button -->
              <div v-if="t.tipo === 'video'"
                class="w-14 h-14 rounded-full bg-charcoal/80 flex items-center justify-center group-hover:bg-charcoal transition-colors shadow-lg">
                <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <!-- Article icon -->
              <div v-else class="opacity-25">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <!-- Tipo + duración -->
              <div class="absolute top-3 left-3 flex items-center gap-2">
                <span :class="['text-xs font-heading font-bold px-2 py-1 rounded-full',
                  t.tipo === 'video' ? 'bg-charcoal text-white' : 'bg-white text-charcoal']">
                  {{ t.tipo === 'video' ? '▶ Video' : '📄 Artículo' }}
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <span class="text-xs bg-black/30 text-white px-2 py-1 rounded-full font-medium">
                  {{ t.duracion }}
                </span>
              </div>
            </div>

            <!-- Contenido -->
            <div class="p-4">
              <h4 class="font-heading font-bold text-charcoal text-sm leading-snug mb-2 group-hover:text-gold transition-colors">
                {{ t.titulo }}
              </h4>
              <p class="text-gray-500 text-xs leading-relaxed line-clamp-2">{{ t.descripcion }}</p>
              <div class="mt-4 flex items-center gap-1 text-xs font-heading font-semibold text-gold group-hover:gap-2 transition-all">
                {{ t.tipo === 'video' ? 'Ver video' : 'Leer artículo' }}
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- ── Modal proyecto ─────────────────────────────────────────────────── -->
  <Transition name="fade">
    <div v-if="proyectoModal" class="fixed inset-0 bg-black/70 z-[60]" @click="cerrarModal" />
  </Transition>

  <Transition name="modal">
    <div
      v-if="proyectoModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        <!-- Header modal -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <span :class="`text-xs font-heading font-bold px-2 py-1 rounded-full mr-2 ${tipoBadgeColor[proyectoModal.tipo]}`">
              {{ tipoLabel[proyectoModal.tipo] }}
            </span>
            <span class="text-xs text-gray-400">{{ proyectoModal.año }}</span>
          </div>
          <button @click="cerrarModal" class="p-2 text-gray-400 hover:text-charcoal transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="flex flex-col lg:flex-row">

          <!-- Galería de fotos -->
          <div class="lg:w-3/5 flex-shrink-0">
            <!-- Foto principal -->
            <div :class="`relative h-64 lg:h-96 bg-gradient-to-br ${proyectoModal.gradiente} flex items-center justify-center`">
              <!-- TODO: <img :src="proyectoModal.fotos[fotoIndex]" class="w-full h-full object-cover" /> -->
              <div class="flex flex-col items-center gap-2 opacity-25">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm font-heading font-semibold uppercase tracking-wider">Foto {{ fotoIndex + 1 }} / {{ proyectoModal.fotos.length }}</span>
              </div>

              <!-- Prev / Next -->
              <button v-if="proyectoModal.fotos.length > 1"
                @click.stop="prevFoto"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button v-if="proyectoModal.fotos.length > 1"
                @click.stop="nextFoto"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <!-- Thumbnails -->
            <div v-if="proyectoModal.fotos.length > 1" class="flex gap-2 p-3 bg-gray-50">
              <button
                v-for="(_, i) in proyectoModal.fotos"
                :key="i"
                @click="fotoIndex = i"
                :class="[
                  'w-16 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-all',
                  `bg-gradient-to-br ${proyectoModal.gradiente}`,
                  i === fotoIndex ? 'ring-2 ring-gold ring-offset-1' : 'opacity-60 hover:opacity-100',
                ]"
              >
                <svg class="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Detalles -->
          <div class="lg:w-2/5 p-6 flex flex-col">
            <h2 class="font-heading text-xl font-bold text-charcoal mb-1">{{ proyectoModal.nombre }}</h2>
            <p class="text-sm text-gray-400 flex items-center gap-1 mb-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ proyectoModal.ubicacion }}
            </p>
            <p class="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              {{ proyectoModal.empresa }}
            </p>

            <p class="text-sm text-gray-600 leading-relaxed mb-5">{{ proyectoModal.descripcion }}</p>

            <div class="mb-5">
              <p class="text-xs font-heading font-bold text-charcoal uppercase tracking-wider mb-2">Materiales usados</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="m in proyectoModal.materiales"
                  :key="m"
                  class="text-xs bg-gold/10 text-charcoal px-2.5 py-1 rounded-full font-medium"
                >
                  {{ m }}
                </span>
              </div>
            </div>

            <div class="mt-auto pt-4 border-t border-gray-100">
              <a
                href="https://wa.me/524171601530?text=Hola%2C%20me%20interesa%20un%20proyecto%20similar%20al%20que%20vi%20en%20su%20sitio."
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold py-3 rounded-lg text-sm uppercase tracking-wider transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Quiero un proyecto similar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to { opacity: 0; transform: translateX(-20px); }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
