<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useNavigation } from '@/composables/useNavigation'

const { currentSection, navigateTo } = useNavigation()

const mobileMenuOpen = ref(false)
const categoriesOpen = ref(false)
const navFits = ref(true)

const navLinks = [
  { label: 'Nosotros', section: 'nosotros' },
  { label: 'Catálogo', section: 'catalogo' },
  { label: 'Sucursales / Distribuidores', section: 'sucursales-distribuidores' },
  { label: 'Servicios', section: 'servicios' },
  // Oculto temporalmente del menú (el componente ProyectosSection sigue existiendo):
  // { label: 'Proyectos / Comunidad', section: 'proyectos' },
  { label: 'Barroca Bot', section: 'barroca-bot' },
]

const headerInnerRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const navMeasureRef = ref<HTMLElement | null>(null)

const MENU_ICON_RESERVE = 56

function checkFit() {
  if (!headerInnerRef.value || !logoRef.value || !navMeasureRef.value) return
  if (window.innerWidth < 768) {
    navFits.value = true
    return
  }
  const containerWidth = headerInnerRef.value.clientWidth
  const logoWidth = logoRef.value.offsetWidth
  const navWidth = navMeasureRef.value.scrollWidth
  navFits.value = navWidth <= containerWidth - logoWidth - MENU_ICON_RESERVE
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  checkFit()
  resizeObserver = new ResizeObserver(() => checkFit())
  if (headerInnerRef.value) resizeObserver.observe(headerInnerRef.value)
  window.addEventListener('resize', checkFit)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', checkFit)
})

function goTo(section: string) {
  navigateTo(section)
  mobileMenuOpen.value = false
  categoriesOpen.value = false
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div ref="headerInnerRef" class="flex items-center justify-between h-16 md:h-20">

        <!-- Logo -->
        <button ref="logoRef" @click="goTo('inicio')" class="flex-shrink-0">
          <img
            src="/img/barroca-logo-amarillo.jpeg"
            alt="Barroca"
            class="h-16 md:h-20 w-auto"
          />
        </button>

        <!-- Desktop nav tabs: only when they fit -->
        <nav v-show="navFits" class="hidden md:flex items-center space-x-1">
          <button
            v-for="link in navLinks"
            :key="link.section"
            @click="goTo(link.section)"
            :class="[
              'px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wider rounded transition-colors duration-200 whitespace-nowrap',
              currentSection === link.section
                ? 'text-gold border-b-2 border-gold'
                : 'text-charcoal hover:text-gold',
            ]"
          >
            {{ link.label }}
          </button>
        </nav>

        <!-- Hidden measurement nav -->
        <nav
          ref="navMeasureRef"
          aria-hidden="true"
          class="hidden md:flex items-center space-x-1 absolute opacity-0 pointer-events-none -z-10"
        >
          <button
            v-for="link in navLinks"
            :key="`measure-${link.section}`"
            class="px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
          >
            {{ link.label }}
          </button>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-1">

          <!-- 3-lines categories menu (desktop only, when nav doesn't fit) -->
          <div v-if="!navFits" class="relative hidden md:block">
            <button
              @click="categoriesOpen = !categoriesOpen"
              class="p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Menú"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              v-show="categoriesOpen"
              class="absolute right-0 top-full mt-1 w-56 bg-white shadow-lg rounded-md border border-gray-100 py-2 z-50"
            >
              <button
                v-for="item in navLinks"
                :key="item.section"
                @click="goTo(item.section)"
                :class="[
                  'block w-full text-left px-4 py-2.5 text-sm font-heading font-semibold transition-colors',
                  currentSection === item.section
                    ? 'text-gold bg-gold/5'
                    : 'text-charcoal hover:text-gold hover:bg-gold/5',
                ]"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- Mobile hamburger -->
          <button
            class="md:hidden p-2 text-charcoal hover:text-gold transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
            :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav dropdown -->
      <nav
        v-show="mobileMenuOpen"
        class="md:hidden pb-4 border-t border-gray-100"
      >
        <button
          v-for="link in navLinks"
          :key="link.section"
          @click="goTo(link.section)"
          :class="[
            'block w-full text-left py-3 px-1 font-heading text-sm font-semibold uppercase tracking-wider transition-colors',
            currentSection === link.section ? 'text-gold' : 'text-charcoal hover:text-gold',
          ]"
        >
          {{ link.label }}
        </button>
      </nav>
    </div>

    <!-- Overlay to close categories dropdown -->
    <div
      v-show="categoriesOpen"
      class="fixed inset-0 z-40"
      @click="categoriesOpen = false"
    ></div>
  </header>
</template>
