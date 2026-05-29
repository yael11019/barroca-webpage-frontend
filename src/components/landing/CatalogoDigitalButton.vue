<script setup lang="ts">
import { ref } from 'vue'

const CATALOGO_URL = 'https://flbook.com.cn/c/8e3ksOniUH#page/1'

const open = ref(false)

function openModal() {
  open.value = true
}

function closeModal() {
  open.value = false
}
</script>

<template>
  <!-- Botón -->
  <div class="text-center">
    <button
      @click="openModal"
      class="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200 shadow-sm"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      Ver catálogo digital
    </button>
  </div>

  <!-- Modal con iframe -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm" @click="closeModal" />
    </Transition>
    <Transition name="modal-up">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
          <!-- Encabezado -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h3 class="font-heading font-bold text-charcoal text-base">Catálogo Digital</h3>
            <button
              @click="closeModal"
              class="p-2 text-gray-400 hover:text-charcoal transition-colors"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Iframe -->
          <div class="flex-1 bg-gray-100">
            <iframe
              v-if="open"
              :src="CATALOGO_URL"
              class="w-full h-full border-0"
              title="Catálogo Digital Barroca"
              allow="fullscreen"
              allowfullscreen
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-up-enter-active, .modal-up-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-up-enter-from, .modal-up-leave-to { opacity: 0; transform: scale(0.95) translateY(8px); }
</style>
