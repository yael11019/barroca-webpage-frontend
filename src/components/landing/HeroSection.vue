<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { useConfigStore } from '@/stores/config'

const { navigateTo } = useNavigation()
const configStore = useConfigStore()

// ── Hero ─────────────────────────────────────────────────────────────────────

// ── Carrusel ──────────────────────────────────────────────────────────────────
// Tipo unificado: campos del backend + campos opcionales del placeholder local
interface SlideDisplay {
  id: number
  // Nuevo formato
  desktop_url?: string
  mobile_url?: string
  blur_placeholder_mobile?: string
  // Legado
  image_url?: string
  blur_placeholder: string
  order: number
  link_url: string | null
  gradiente?: string
  titulo?: string
  subtitulo?: string
}

function slideDesktopUrl(s: SlideDisplay) { return s.desktop_url ?? s.image_url ?? '' }
function slideMobileUrl(s: SlideDisplay) { return s.mobile_url ?? s.desktop_url ?? s.image_url ?? '' }
function slideHasImage(s: SlideDisplay) { return !!(s.desktop_url ?? s.image_url) }

// Placeholders locales mientras el backend no tiene imágenes subidas
const placeholderSlides: SlideDisplay[] = [
  {
    id: 1,
    image_url: '',
    blur_placeholder: '',
    order: 1,
    link_url: null,
    gradiente: 'from-verde to-verde-light',
    titulo: 'Diseño que inspira',
    subtitulo: 'Materiales premium para construcción e interiores',
  },
  {
    id: 2,
    image_url: '',
    blur_placeholder: '',
    order: 2,
    link_url: null,
    gradiente: 'from-charcoal to-charcoal-light',
    titulo: 'Melaminas de Alta Gama',
    subtitulo: 'La mejor variedad en colores y acabados',
  },
  {
    id: 3,
    image_url: '',
    blur_placeholder: '',
    order: 3,
    link_url: null,
    gradiente: 'from-amber-800 to-amber-600',
    titulo: 'Pisos SPC y Vinílicos',
    subtitulo: 'Durabilidad y estética en cada paso',
  },
]

// Usa las del backend cuando ya llegaron; si no, muestra los placeholders
const slides = computed<SlideDisplay[]>(() =>
  configStore.carousel.length > 0 ? configStore.carousel : placeholderSlides
)

const currentSlide = ref(0)

// ── Lazy Loading del Carrusel ─────────────────────────────────────────────────
// Solo se renderizan los <img> de los slides que ya fueron "alcanzados" durante
// la navegación. Empieza con [0, 1] para precargar el primero y el siguiente.
const loadedSlideIndices = ref<number[]>([0, 1])

function preload(index: number) {
  if (!loadedSlideIndices.value.includes(index)) {
    loadedSlideIndices.value.push(index)
  }
}

function isSlideLoaded(index: number) {
  return loadedSlideIndices.value.includes(index)
}

function next() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  preload((currentSlide.value + 1) % slides.value.length)
}

function prev() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
  preload((currentSlide.value + 1) % slides.value.length)
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(next, 5000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

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

      <!-- Imagen real del backend detrás del contenido (desktop/mobile) -->
      <LazyImage
        v-if="configStore.heroUrl"
        :src="configStore.heroUrl"
        :blur="configStore.heroBlur"
        :mobile-src="configStore.heroMobileUrl || configStore.heroUrl"
        :mobile-blur="configStore.heroMobileBlur || configStore.heroBlur"
        alt="Imagen principal Barroca"
        loading="eager"
        fetchpriority="high"
        decoding="auto"
        class="absolute inset-0 w-full h-full"
      />

      <!-- Sin imagen: gradiente dorado de marca -->
      <!-- Con imagen: overlay oscuro sutil solo para contraste del texto -->
      <div
        class="absolute inset-0"
        :class="configStore.heroUrl
          ? 'bg-black/40'
          : 'bg-gradient-to-br from-gold-light via-gold to-gold-dark opacity-90'"
      />
      <div class="absolute top-0 left-0 right-0 h-1 bg-verde"></div>

      <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-4">
        <img
          src="/img/barroca-logo-blanco.png"
          alt="Barroca"
          class="h-24 md:h-36 mx-auto mb-3"
          fetchpriority="high"
          decoding="auto"
        />

        <!-- TODO: Reemplazar con el eslogan que proporcione Ximena -->
        <h1
          class="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
          :class="configStore.heroUrl ? 'text-white' : 'text-verde'"
        >
          Transformando lo ordinario<br>
          <span :class="configStore.heroUrl ? 'text-white/80' : 'text-verde/80'">en extraordinario.</span>
        </h1>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="irACatalogo()"
            class="bg-gold hover:bg-gold-dark text-white font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
          >
            Ver Catálogo
          </button>
          <button
            @click="navigateTo('sucursales')"
            class="font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
            :class="configStore.heroUrl
              ? 'border-2 border-white hover:bg-white hover:text-charcoal text-white'
              : 'border-2 border-verde hover:bg-verde hover:text-gold text-verde'"
          >
            Nuestras Sucursales
          </button>
        </div>
      </div>
    </section>

    <!-- ── Carrusel de Fotos ─────────────────────────────────────────────────── -->
    <section class="relative bg-charcoal overflow-hidden">
      <div class="relative h-72 md:h-[480px]">

        <!-- Slides -->
        <div
          v-for="(slide, i) in slides"
          :key="slide.id"
          class="absolute inset-0 transition-opacity duration-700"
          :class="i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
          <!-- Imagen del backend: solo se renderiza cuando el slide ha sido alcanzado -->
          <LazyImage
            v-if="slideHasImage(slide) && isSlideLoaded(i)"
            :src="slideDesktopUrl(slide)"
            :blur="slide.blur_placeholder"
            :mobile-src="slideMobileUrl(slide)"
            :mobile-blur="slide.blur_placeholder_mobile || slide.blur_placeholder"
            :alt="`Slide ${i + 1}`"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'low'"
            class="absolute inset-0 w-full h-full"
          />

          <!-- Placeholder local (sin imagen de backend) -->
          <div
            v-else-if="!slideHasImage(slide)"
            class="w-full h-full bg-gradient-to-br flex items-end justify-center pb-12"
            :class="slide.gradiente ?? 'from-charcoal to-charcoal-light'"
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
            @click="currentSlide = i; preload((i + 1) % slides.length)"
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
            Explora nuestras melaminas con acabados de alta calidad. Da clic para ver todos los colores disponibles.
          </p>
        </div>

        <!-- Imagen representativa del catálogo cuando el backend la tiene -->
        <button
          v-if="configStore.catalogos['melamina']"
          @click="irACatalogo('melamina')"
          class="block w-full relative rounded-xl overflow-hidden mb-8 h-40 md:h-56 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <LazyImage
            :src="configStore.catalogos['melamina'].desktop_url"
            :blur="configStore.catalogos['melamina'].desktop_blur"
            :mobile-src="configStore.catalogos['melamina'].mobile_url || configStore.catalogos['melamina'].desktop_url"
            :mobile-blur="configStore.catalogos['melamina'].mobile_blur || configStore.catalogos['melamina'].desktop_blur"
            alt="Catálogo de Melaminas"
            class="absolute inset-0 w-full h-full"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end px-6 pb-5">
            <p class="text-white font-heading text-lg md:text-2xl font-bold drop-shadow">Descubre todas nuestras líneas</p>
          </div>
        </button>

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
            Desde pisos SPC hasta maderas naturales. Explora nuestro catálogo completo.
          </p>
        </div>

        <!-- Imagen representativa del catálogo de pisos -->
        <button
          v-if="configStore.catalogos['piso_spc']"
          @click="irACatalogo('piso')"
          class="block w-full relative rounded-xl overflow-hidden mb-8 h-40 md:h-56 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <LazyImage
            :src="configStore.catalogos['piso_spc'].desktop_url"
            :blur="configStore.catalogos['piso_spc'].desktop_blur"
            :mobile-src="configStore.catalogos['piso_spc'].mobile_url || configStore.catalogos['piso_spc'].desktop_url"
            :mobile-blur="configStore.catalogos['piso_spc'].mobile_blur || configStore.catalogos['piso_spc'].desktop_blur"
            alt="Catálogo de Pisos"
            class="absolute inset-0 w-full h-full"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end px-6 pb-5">
            <p class="text-white font-heading text-lg md:text-2xl font-bold drop-shadow">Variedad en diseños y acabados</p>
          </div>
        </button>

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
