<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useAnalytics } from '@/composables/useAnalytics'
import ProductCard from './ProductCard.vue'

const store = useProductosStore()
const { trackCategoryFilter, trackViewItemList } = useAnalytics()
const activeCategory = ref<string | null>(null)

const filteredProductos = computed(() => {
  if (!activeCategory.value) {
    return store.productos.filter((p) => p.activo)
  }
  return store.productosPorCategoria[activeCategory.value] || []
})

function selectCategory(cat: string | null) {
  activeCategory.value = cat
  const label = cat ?? 'Todos'
  trackCategoryFilter(label)
  trackViewItemList(label, filteredProductos.value)
}

onMounted(() => {
  store.fetchProductos()
})
</script>

<template>
  <section id="productos" class="py-20 md:py-28 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
          Nuestros Productos
        </h2>
        <div class="w-16 h-1 bg-gold mx-auto mb-8"></div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra amplia gama de materiales de construccion y acabados de diseno interior.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="text-center py-12">
        <div class="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-500">Cargando productos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ store.error }}</p>
        <button
          @click="store.fetchProductos()"
          class="bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Products -->
      <template v-else>
        <!-- Category filters -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
          <button
            :class="[
              'px-5 py-2 rounded-full font-heading text-sm font-semibold uppercase tracking-wider transition-colors duration-200',
              activeCategory === null
                ? 'bg-gold text-charcoal'
                : 'bg-white text-gray-600 hover:bg-gold/10 hover:text-gold-dark border border-gray-200',
            ]"
            @click="selectCategory(null)"
          >
            Todos
          </button>
          <button
            v-for="cat in store.categorias"
            :key="cat"
            :class="[
              'px-5 py-2 rounded-full font-heading text-sm font-semibold uppercase tracking-wider transition-colors duration-200',
              activeCategory === cat
                ? 'bg-gold text-charcoal'
                : 'bg-white text-gray-600 hover:bg-gold/10 hover:text-gold-dark border border-gray-200',
            ]"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Product grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            v-for="producto in filteredProductos"
            :key="producto.id"
            :producto="producto"
          />
        </div>

        <!-- Empty state -->
        <div v-if="filteredProductos.length === 0 && !store.loading" class="text-center py-12">
          <p class="text-gray-500">No hay productos disponibles en esta categoria.</p>
        </div>
      </template>
    </div>
  </section>
</template>
