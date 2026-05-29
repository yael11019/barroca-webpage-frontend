<script setup lang="ts">
import { computed } from 'vue'
import type { ProductoCatalogo, ColorCatalogo } from '@/types/producto'
import { imageUrl } from '@/utils/imageUrl'

const props = defineProps<{
  productos: ProductoCatalogo[]
  producto: ProductoCatalogo | null
  colorIdx: number
}>()

const emit = defineEmits<{
  'select-producto': [p: ProductoCatalogo]
  'select-color': [idx: number]
}>()

const colorSel = computed((): ColorCatalogo | null =>
  props.producto?.colores[props.colorIdx] ?? null
)
</script>

<template>
  <div class="space-y-4">
    <!-- Selector de línea/producto -->
    <div>
      <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2">Línea</p>
      <div class="flex flex-col gap-2">
        <button
          v-for="p in productos"
          :key="p.id"
          @click="emit('select-producto', p)"
          class="flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left"
          :class="producto?.id === p.id
            ? 'border-gold bg-gold/5 shadow-sm'
            : 'border-gray-200 hover:border-gold/50 hover:bg-gray-50'"
        >
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              v-if="p.colores[0]?.imagenes[0]"
              :src="imageUrl(p.colores[0].imagenes[0].url)"
              :alt="p.nombre"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-heading font-bold text-charcoal truncate">{{ p.nombre }}</p>
            <p class="text-xs text-gray-400">{{ p.colores.length }} colores</p>
          </div>
          <svg
            v-if="producto?.id === p.id"
            class="w-4 h-4 text-gold flex-shrink-0"
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Selector de color -->
    <div v-if="producto">
      <p class="text-xs text-gray-400 font-heading uppercase tracking-wider mb-2">Color</p>
      <div class="flex flex-wrap gap-1.5 mb-3">
        <button
          v-for="(color, idx) in producto.colores"
          :key="color.nombre"
          @click="emit('select-color', idx)"
          class="text-[10px] font-heading px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap"
          :class="colorIdx === idx
            ? 'bg-gold text-charcoal border-gold'
            : 'border-gray-200 text-gray-500 hover:border-gold/60 hover:text-charcoal'"
        >
          {{ color.nombre }}
        </button>
      </div>

      <!-- Preview del color seleccionado -->
      <div v-if="colorSel" class="rounded-xl overflow-hidden aspect-video bg-gray-100">
        <img
          v-if="colorSel.imagenes[0]"
          :src="imageUrl(colorSel.imagenes[0].url)"
          :alt="colorSel.nombre"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>
