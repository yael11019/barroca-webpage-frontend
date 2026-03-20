<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation'
import AppHeader from '@/components/landing/AppHeader.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import ProductsSection from '@/components/landing/ProductsSection.vue'
import ContactSection from '@/components/landing/ContactSection.vue'
import AppointmentSection from '@/components/landing/AppointmentSection.vue'
import DistribuidoresSection from '@/components/landing/DistribuidoresSection.vue'
import ServiciosSection from '@/components/landing/ServiciosSection.vue'
import ProyectosSection from '@/components/landing/ProyectosSection.vue'
import CarritoSection from '@/components/landing/CarritoSection.vue'
import BarrocaBotSection from '@/components/landing/BarrocaBotSection.vue'
import AppFooter from '@/components/landing/AppFooter.vue'
import WhatsAppButton from '@/components/landing/WhatsAppButton.vue'
import CartDrawer from '@/components/landing/CartDrawer.vue'
import AppointmentModal from '@/components/landing/AppointmentModal.vue'
import WelcomeModal from '@/components/landing/WelcomeModal.vue'

const { currentSection } = useNavigation()
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <AppHeader />
    <!-- Spacer igual a la altura del header fijo para que main tenga la altura correcta -->
    <div class="h-16 md:h-20 shrink-0"></div>
    <main class="relative flex-1 overflow-hidden min-h-0">
      <WhatsAppButton />
      <div v-show="currentSection === 'inicio'" class="h-full overflow-y-auto">
        <HeroSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'nosotros'" class="h-full overflow-y-auto">
        <AboutSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'catalogo'" class="h-full overflow-y-auto">
        <ProductsSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'sucursales'" class="h-full overflow-y-auto">
        <ContactSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'agendar'" class="h-full overflow-y-auto">
        <AppointmentSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'distribuidores'" class="h-full overflow-y-auto">
        <DistribuidoresSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'servicios'" class="h-full overflow-y-auto">
        <ServiciosSection />
        <AppFooter />
      </div>
      <!-- Ocultas / en desarrollo -->
      <div v-show="currentSection === 'proyectos'" class="h-full overflow-y-auto">
        <ProyectosSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'carrito-vista'" class="h-full overflow-y-auto">
        <CarritoSection />
        <AppFooter />
      </div>
      <div v-show="currentSection === 'barroca-bot'" class="h-full overflow-y-auto">
        <BarrocaBotSection />
        <AppFooter />
      </div>
    </main>
    <CartDrawer />
    <AppointmentModal />
    <WelcomeModal />
  </div>
</template>
