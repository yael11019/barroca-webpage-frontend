<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/landing/AppHeader.vue'
import AppFooter from '@/components/landing/AppFooter.vue'
import WhatsAppButton from '@/components/landing/WhatsAppButton.vue'
import BarrocaBotFloating from '@/components/landing/BarrocaBotFloating.vue'
import CartDrawer from '@/components/landing/CartDrawer.vue'
import AppointmentModal from '@/components/landing/AppointmentModal.vue'
import WelcomeModal from '@/components/landing/WelcomeModal.vue'

const route = useRoute()

// Cada sección comparte un único contenedor scrollable. Al cambiar de sección
// (no de query) volvemos arriba, replicando el comportamiento anterior en el
// que cada sección tenía su propio scroll independiente.
const scrollRef = ref<HTMLElement | null>(null)
watch(
  () => route.path,
  () => {
    scrollRef.value?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <AppHeader />
    <!-- Spacer igual a la altura del header fijo para que main tenga la altura correcta -->
    <div class="h-16 md:h-20 shrink-0"></div>
    <main class="relative flex-1 overflow-hidden min-h-0">
      <WhatsAppButton />
      <BarrocaBotFloating />
      <div ref="scrollRef" class="h-full overflow-y-auto">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <!-- Wrapper de raíz única: algunas secciones tienen varios nodos
                 raíz (sección + <Transition> de modales), y <transition out-in>
                 no puede animar un fragmento. El div lo vuelve animable y
                 min-h-full conserva el alto completo de cada pantalla. -->
            <div :key="route.path" class="min-h-full">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
        <AppFooter />
      </div>
    </main>
    <CartDrawer />
    <AppointmentModal />
    <WelcomeModal />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
