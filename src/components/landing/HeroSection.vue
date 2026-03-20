<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigation } from '@/composables/useNavigation'

const { navigateTo } = useNavigation()

// ── Carousel ──────────────────────────────────────────────────────────────────
// TODO: Fetch desde backend GET /api/public/carousel
// El backend debe retornar las imágenes en orden configurable desde el admin.
const slides = ref([
  {
    id: 1,
    imagen: '',
    gradiente: 'from-verde to-verde-light',
    titulo: 'Diseño que inspira',
    subtitulo: 'Materiales premium para construcción e interiores',
  },
  {
    id: 2,
    imagen: '',
    gradiente: 'from-charcoal to-charcoal-light',
    titulo: 'Melaminas de Alta Gama',
    subtitulo: 'La mejor variedad en colores y acabados',
  },
  {
    id: 3,
    imagen: '',
    gradiente: 'from-amber-800 to-amber-600',
    titulo: 'Pisos SPC y Vinílicos',
    subtitulo: 'Durabilidad y estética en cada paso',
  },
])
const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}
function prev() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

onMounted(() => {
  timer = setInterval(next, 5000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ── Líneas de Melamina ────────────────────────────────────────────────────────
// TODO: Fetch desde backend GET /api/public/lineas?categoria=melamina
const lineasMelamina = [
  { id: 'premium', nombre: 'Línea Premium', imagen: '', descripcion: '24 colores disponibles', bg: 'bg-stone-200' },
  { id: 'clasica', nombre: 'Línea Clásica', imagen: '', descripcion: '18 colores disponibles', bg: 'bg-amber-100' },
  { id: 'maderas', nombre: 'Línea Maderas', imagen: '', descripcion: '20 tonos de madera', bg: 'bg-amber-700' },
  { id: 'unicolores', nombre: 'Unicolores', imagen: '', descripcion: '32 colores sólidos', bg: 'bg-slate-400' },
]

// ── Líneas de Pisos ───────────────────────────────────────────────────────────
// TODO: Fetch desde backend GET /api/public/lineas?categoria=piso
const lineasPisos = [
  { id: 'spc', nombre: 'Pisos SPC', imagen: '', descripcion: '15 diseños', bg: 'bg-stone-500' },
  { id: 'vinil', nombre: 'Vinil en Rollo', imagen: '', descripcion: '12 diseños', bg: 'bg-stone-300' },
  { id: 'madera-solida', nombre: 'Madera Natural', imagen: '', descripcion: '8 especies', bg: 'bg-amber-900' },
]

// ── Por qué Barroca ───────────────────────────────────────────────────────────
const razones = [
  {
    titulo: 'Calidad Certificada',
    descripcion: 'Productos con certificaciones internacionales de calidad y durabilidad garantizada.',
  },
  {
    titulo: 'Amplia Variedad',
    descripcion: 'Más de 200 opciones en colores, texturas y acabados para cada proyecto.',
  },
  {
    titulo: 'Asesoría Experta',
    descripcion: 'Nuestro equipo de especialistas te guía en cada etapa de tu proyecto.',
  },
  {
    titulo: 'Distribución Confiable',
    descripcion: 'Presencia en múltiples sucursales y tiempos de entrega puntuales.',
  },
]

function irACatalogo(filtro?: string) {
  navigateTo('catalogo', filtro ?? null)
}
</script>

<template>
  <div>
    <!-- ── Hero Banner ──────────────────────────────────────────────────────── -->
    <section class="relative min-h-[50vh] flex items-center justify-center bg-gold overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-gold-light via-gold to-gold-dark opacity-80"></div>
      <div class="absolute top-0 left-0 right-0 h-1 bg-verde"></div>

      <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-4">
        <img
          src="/img/barroca-logo-amarillo.jpeg"
          alt="Barroca"
          class="h-14 md:h-20 mx-auto mb-3 rounded-lg"
        />

        <!-- TODO: Reemplazar con el eslogan que proporcione Ximena -->
        <h1 class="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-verde leading-tight mb-4">
          Diseño que inspira,<br>
          <span class="text-verde/80">calidad que trasciende.</span>
        </h1>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="irACatalogo()"
            class="bg-verde hover:bg-verde-light text-gold font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
          >
            Ver Catálogo
          </button>
          <button
            @click="navigateTo('sucursales')"
            class="border-2 border-verde hover:bg-verde hover:text-gold text-verde font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
          >
            Nuestras Sucursales
          </button>
        </div>
      </div>
    </section>

    <!-- ── Carrusel de Fotos ─────────────────────────────────────────────────── -->
    <!-- TODO: Las imágenes y su orden se gestionan desde el backend -->
    <section class="relative bg-charcoal overflow-hidden">
      <div class="relative h-72 md:h-[480px]">

        <!-- Slides -->
        <div
          v-for="(slide, i) in slides"
          :key="slide.id"
          class="absolute inset-0 transition-opacity duration-700"
          :class="i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
          <!-- Imagen real del backend (cuando exista) -->
          <img
            v-if="slide.imagen"
            :src="slide.imagen"
            :alt="slide.titulo"
            class="w-full h-full object-cover"
          />
          <!-- Placeholder hasta que lleguen las imágenes -->
          <div
            v-else
            class="w-full h-full bg-gradient-to-br flex items-end justify-center pb-12"
            :class="slide.gradiente"
          >
            <div class="text-center text-white px-6">
              <p class="text-xs font-heading uppercase tracking-widest mb-2 opacity-50">
                Foto del carrusel {{ i + 1 }} — pendiente de subir al backend
              </p>
              <p class="font-heading text-2xl md:text-4xl font-bold mb-2">{{ slide.titulo }}</p>
              <p class="text-sm md:text-lg opacity-80">{{ slide.subtitulo }}</p>
            </div>
          </div>
        </div>

        <!-- Control anterior -->
        <button
          @click="prev"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Anterior"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Control siguiente -->
        <button
          @click="next"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Siguiente"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Indicadores -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <button
            v-for="(_, i) in slides"
            :key="i"
            @click="currentSlide = i"
            class="w-2.5 h-2.5 rounded-full transition-colors"
            :class="i === currentSlide ? 'bg-gold' : 'bg-white/50'"
            :aria-label="`Ir a slide ${i + 1}`"
          />
        </div>
      </div>
    </section>

    <!-- ── Galería Melaminas por Línea ──────────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Melaminas</h2>
          <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestras líneas de melamina. Da clic en cada línea para ver todos los colores disponibles.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <button
            v-for="linea in lineasMelamina"
            :key="linea.id"
            @click="irACatalogo('melamina:' + linea.id)"
            class="group relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Imagen real (cuando exista) -->
            <img
              v-if="linea.imagen"
              :src="linea.imagen"
              :alt="linea.nombre"
              class="w-full h-full object-cover"
            />
            <!-- Placeholder -->
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
              :class="linea.bg"
            >
              <div class="absolute inset-0 flex items-center justify-center opacity-10">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300"></div>

            <!-- Texto -->
            <div class="absolute bottom-0 left-0 right-0 p-4 text-left text-white">
              <p class="font-heading font-bold text-sm md:text-base">{{ linea.nombre }}</p>
              <p class="text-xs text-white/70 mt-0.5">{{ linea.descripcion }}</p>
              <p class="text-xs font-heading uppercase tracking-wider text-gold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Ver colores →
              </p>
            </div>
          </button>
        </div>

        <div class="text-center mt-8">
          <button
            @click="irACatalogo('melamina')"
            class="inline-flex items-center gap-2 bg-charcoal hover:bg-charcoal-light text-gold font-heading font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors duration-200"
          >
            Ver todo el catálogo de melaminas
          </button>
        </div>
      </div>
    </section>

    <!-- ── Galería Pisos ─────────────────────────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Pisos</h2>
          <div class="w-16 h-1 bg-gold mx-auto mb-6"></div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Desde pisos SPC hasta maderas naturales. Da clic para explorar cada línea de producto.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <button
            v-for="linea in lineasPisos"
            :key="linea.id"
            @click="irACatalogo('piso:' + linea.id)"
            class="group relative rounded-xl overflow-hidden h-64 md:h-80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Imagen real (cuando exista) -->
            <img
              v-if="linea.imagen"
              :src="linea.imagen"
              :alt="linea.nombre"
              class="w-full h-full object-cover"
            />
            <!-- Placeholder -->
            <div
              v-else
              class="w-full h-full"
              :class="linea.bg"
            >
              <div class="absolute inset-0 flex items-center justify-center opacity-10">
                <svg class="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300"></div>

            <div class="absolute bottom-0 left-0 right-0 p-6 text-left text-white">
              <p class="font-heading font-bold text-xl">{{ linea.nombre }}</p>
              <p class="text-sm text-white/70 mt-1">{{ linea.descripcion }}</p>
              <p class="text-xs font-heading uppercase tracking-wider text-gold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explorar →
              </p>
            </div>
          </button>
        </div>

        <div class="text-center mt-8">
          <button
            @click="irACatalogo('piso')"
            class="inline-flex items-center gap-2 bg-charcoal hover:bg-charcoal-light text-gold font-heading font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors duration-200"
          >
            Ver todo el catálogo de pisos
          </button>
        </div>
      </div>
    </section>

    <!-- ── Por qué elegir Barroca ────────────────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-verde">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <!-- TODO: Reemplazar con imagen real de Barroca -->
          <div class="relative rounded-xl overflow-hidden aspect-video bg-verde-light flex items-center justify-center shadow-xl">
            <div class="text-center text-white/30 px-6">
              <svg class="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="font-heading text-sm">Imagen institucional Barroca</p>
            </div>
          </div>

          <!-- Razones -->
          <div>
            <h2 class="font-heading text-3xl md:text-4xl font-bold text-gold mb-3">
              ¿Por qué elegir Barroca?
            </h2>
            <div class="w-16 h-1 bg-gold mb-8"></div>

            <div class="space-y-6">
              <div
                v-for="(razon, i) in razones"
                :key="i"
                class="flex items-start gap-4"
              >
                <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gold flex items-center justify-center text-verde font-heading font-bold text-sm">
                  {{ i + 1 }}
                </div>
                <div>
                  <h3 class="font-heading font-bold text-gold text-lg mb-1">{{ razon.titulo }}</h3>
                  <p class="text-white/75 leading-relaxed">{{ razon.descripcion }}</p>
                </div>
              </div>
            </div>

            <div class="mt-10">
              <button
                @click="navigateTo('nosotros')"
                class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-verde font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
              >
                Conoce nuestra historia
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
