<script setup lang="ts">
import { ref } from 'vue'

// TODO: Los textos de misión, visión, historia y quiénes somos los proporciona Ximena.

// ── Línea del tiempo horizontal ───────────────────────────────────────────────
// TODO: actualizar con datos reales de Ximena
const timeline = [
  {
    año: '1989',
    titulo: 'Fundación',
    descripcion: 'Grupo Barrera nace para proporcionar soluciones especializadas en madera que respondieran a las necesidades específicas de su ciudad.',
  },
  {
    año: 'Primeros años',
    titulo: 'Raíces en la comunidad',
    descripcion: 'Se ganó la confianza de los clientes construyendo raíces profundas en la comunidad, con compromiso con la calidad, el servicio y un precio justo.',
  },
  {
    año: 'Expansión',
    titulo: 'Crecimiento exponencial',
    descripcion: 'Comenzó el crecimiento exponencial de la marca, permitiéndonos ganar mercado y lograr abrir 2 sucursales más.',
  },
  {
    año: '2024',
    titulo: 'Nace BARROCA',
    descripcion: 'Después de más de tres décadas de experiencia en el sector maderero, surge BARROCA: una iniciativa impulsada por la nueva generación.',
  },
  {
    año: '2025',
    titulo: 'Hoy',
    descripcion: 'Más de 30 años de experiencia respaldan a Barroca como referente en melaminas de diseño, calidad y precio justo.',
  },
]

const timelineRef = ref<HTMLElement | null>(null)

function scrollTimeline(direction: 'left' | 'right') {
  if (!timelineRef.value) return
  const amount = 320
  timelineRef.value.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' })
}

// Certificaciones — TODO: reemplazar con logos y nombres reales
const certificaciones = [
  { nombre: 'ISO 9001', descripcion: 'Calidad en procesos' },
  { nombre: 'Certificación 2', descripcion: 'TODO: nombre real' },
  { nombre: 'Certificación 3', descripcion: 'TODO: nombre real' },
  { nombre: 'Certificación 4', descripcion: 'TODO: nombre real' },
]
</script>

<template>
  <div>
    <!-- ── Misión, Visión e Historia ─────────────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">Nosotros</h2>
          <div class="w-16 h-1 bg-gold mx-auto"></div>
        </div>

        <!-- Misión + Visión -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <!-- Misión -->
          <div class="bg-gold rounded-xl p-8 shadow-md">
            <div class="w-12 h-12 bg-verde rounded-full flex items-center justify-center mb-5">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-heading text-2xl font-bold text-verde mb-3">Misión</h3>
            <p class="text-verde/80 leading-relaxed">
              Ofrecer melaminas que combinan diseño contemporáneo, calidad superior y precios accesibles, permitiendo crear espacios modernos, funcionales y visualmente impactantes. Nos comprometemos a brindar un servicio confiable, ágil y cercano, facilitando a nuestros clientes materiales duraderos, tendencias actuales y soluciones que aporten valor real a cada proyecto.
            </p>
          </div>

          <!-- Visión -->
          <div class="bg-gold rounded-xl p-8 shadow-md">
            <div class="w-12 h-12 bg-verde rounded-full flex items-center justify-center mb-5">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 class="font-heading text-2xl font-bold text-verde mb-3">Visión</h3>
            <p class="text-verde/80 leading-relaxed">
              Ser la marca líder en melaminas en México, reconocida por ofrecer diseños innovadores, acabados de alta calidad y soluciones estéticas que equilibran lo premium con lo accesible, convirtiéndonos en el aliado clave de arquitectos, diseñadores, carpinteros y desarrolladores.
            </p>
          </div>
        </div>

        <!-- Historia de la Marca -->
        <div class="max-w-3xl mx-auto text-center">
          <h3 class="font-heading text-2xl font-bold text-charcoal mb-3">Historia de la Marca</h3>
          <div class="w-12 h-1 bg-gold mx-auto mb-6"></div>
          <p class="text-gray-600 leading-relaxed text-lg">
            Barroca surge como respuesta a una necesidad no cubierta en el mercado: ofrecer melamina de alta calidad a precios accesibles. Nacida del espíritu emprendedor de una nueva generación, Barroca representa la unión entre tradición e innovación. Hoy, nos consolidamos como una marca que combina el conocimiento heredado con una visión fresca y actual, creando soluciones que transforman la forma de diseñar y construir.
          </p>
        </div>
      </div>
    </section>

    <!-- ── Línea del Tiempo Horizontal ──────────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Nuestra Trayectoria</h3>
          <div class="w-12 h-1 bg-gold mx-auto"></div>
        </div>

        <!-- Contenedor con botones -->
        <div class="relative">
          <!-- Botón izquierda -->
          <button
            @click="scrollTimeline('left')"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-colors duration-200"
            aria-label="Anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Scroll horizontal -->
          <div
            ref="timelineRef"
            class="overflow-x-auto scrollbar-hide pb-6"
            style="scroll-behavior: smooth;"
          >
            <div class="flex gap-0 min-w-max px-8 relative">
              <!-- Línea horizontal de fondo -->
              <div class="absolute top-8 left-8 right-8 h-0.5 bg-gold/30"></div>

              <!-- Tarjetas -->
              <div
                v-for="(evento, i) in timeline"
                :key="i"
                class="relative flex flex-col items-center w-64 px-4"
              >
                <!-- Punto en la línea -->
                <div class="w-5 h-5 rounded-full bg-gold border-4 border-white shadow-md z-10 mb-6 mt-[24px]"></div>

                <!-- Tarjeta -->
                <div class="bg-white rounded-xl shadow-md border border-gray-100 p-5 w-full text-center">
                  <p class="font-heading text-2xl font-bold text-gold mb-1">{{ evento.año }}</p>
                  <h4 class="font-heading font-bold text-charcoal text-base mb-2">{{ evento.titulo }}</h4>
                  <p class="text-gray-500 text-sm leading-relaxed">{{ evento.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón derecha -->
          <button
            @click="scrollTimeline('right')"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-colors duration-200"
            aria-label="Siguiente"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ── Quiénes Somos + Certificaciones ───────────────────────────────────── -->
    <section class="py-20 md:py-28 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          <!-- Quiénes somos -->
          <div>
            <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">Quiénes Somos</h3>
            <div class="w-12 h-1 bg-gold mb-6"></div>
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p>
                En Barroca, nos dedicamos a ofrecer melaminas de alta calidad que combinan elegancia, innovación y accesibilidad, respondiendo a las necesidades de arquitectos, diseñadores y constructores.
              </p>
              <p>
                Trabajamos con compromiso, servicio y honestidad, transformando las ideas de nuestros clientes en proyectos que perduran.
              </p>
            </div>
          </div>

          <!-- Certificaciones -->
          <div>
            <h3 class="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">Certificaciones</h3>
            <div class="w-12 h-1 bg-gold mb-6"></div>
            <!-- TODO: Agregar logos y nombres reales de certificaciones -->
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="cert in certificaciones"
                :key="cert.nombre"
                class="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <!-- TODO: Reemplazar con logo real de la certificación -->
                <div class="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p class="font-heading font-bold text-charcoal text-center text-sm">{{ cert.nombre }}</p>
                <p class="text-xs text-gray-400 text-center mt-1">{{ cert.descripcion }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
