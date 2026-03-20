<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

function cerrar() {
  visible.value = false
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 z-[80]"
    ></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div
      v-if="visible"
      class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <!-- Botón cerrar -->
        <button
          @click="cerrar"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="p-8">
          <!-- Logo -->
          <div class="flex justify-center mb-6">
            <img
              src="/img/barroca-logo-amarillo.jpeg"
              alt="Grupo Barrera"
              class="h-16 object-contain"
            />
          </div>

          <!-- Título -->
          <h2 class="text-2xl font-bold mb-5 leading-tight text-center" style="color: var(--color-verde)">
            Grupo Barrera
          </h2>

          <!-- Botón -->
          <div class="mt-8 flex justify-center">
            <button
              @click="cerrar"
              class="btn-verde text-white font-semibold px-10 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 text-base"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.btn-verde {
  background-color: var(--color-verde);
}
.btn-verde:hover {
  background-color: var(--color-verde-light);
}

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
