import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { productoService } from '@/services/producto.service'
import type { Producto } from '@/types/producto'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref<Producto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const productosPorCategoria = computed(() => {
    const grouped: Record<string, Producto[]> = {}
    for (const producto of productos.value) {
      if (!producto.activo) continue
      if (!grouped[producto.categoria]) {
        grouped[producto.categoria] = []
      }
      grouped[producto.categoria]!.push(producto)
    }
    return grouped
  })

  const categorias = computed(() => Object.keys(productosPorCategoria.value))

  async function fetchProductos() {
    loading.value = true
    error.value = null
    try {
      productos.value = await productoService.getAll()
    } catch (e) {
      error.value = 'Error al cargar los productos. Intente de nuevo mas tarde.'
      console.error('Failed to fetch productos:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    productosPorCategoria,
    categorias,
    fetchProductos,
  }
})
