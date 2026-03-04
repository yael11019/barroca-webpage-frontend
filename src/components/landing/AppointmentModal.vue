<script setup lang="ts">
import { useCitasStore } from '@/stores/citas'
import CalendarStep from './appointment/CalendarStep.vue'
import TimeSlotStep from './appointment/TimeSlotStep.vue'
import FormStep from './appointment/FormStep.vue'
import ConfirmationStep from './appointment/ConfirmationStep.vue'
import SuccessStep from './appointment/SuccessStep.vue'

const store = useCitasStore()
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="store.modalAbierto"
      class="fixed inset-0 bg-black/40 z-[60]"
      @click="store.cerrarModal()"
    ></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div
      v-if="store.modalAbierto"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="store.cerrarModal()"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-heading text-lg font-bold text-charcoal">Reservar visita</h2>
          <button
            @click="store.cerrarModal()"
            class="p-2 text-gray-400 hover:text-charcoal transition-colors"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Step content -->
        <div class="p-6">
          <CalendarStep v-if="store.paso === 'calendario'" />
          <TimeSlotStep v-if="store.paso === 'horario'" />
          <FormStep v-if="store.paso === 'formulario'" />
          <ConfirmationStep v-if="store.paso === 'confirmacion'" />
          <SuccessStep v-if="store.paso === 'exito'" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
