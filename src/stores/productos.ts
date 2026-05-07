import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { productoService } from '@/services/producto.service'
import type { ProductoCatalogo } from '@/types/producto'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref<ProductoCatalogo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  // Tipos únicos (MELAMINA, PISO, …) en el orden que llegan del API
  // Filtra productos con tipo null/undefined que vienen del backend
  const tipos = computed(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const p of productos.value) {
      if (!p.tipo) continue
      if (!seen.has(p.tipo)) {
        seen.add(p.tipo)
        result.push(p.tipo)
      }
    }
    return result
  })

  // Alias para compatibilidad con código anterior
  const categorias = computed(() => tipos.value)

  async function fetchProductos(force = false) {
    if ((fetched.value || loading.value) && !force) return
    loading.value = true
    error.value = null
    try {
      productos.value = await productoService.getAll()
      fetched.value = true
    } catch (e) {
      error.value = 'Error al cargar los productos. Intente de nuevo más tarde.'
      console.error('Failed to fetch productos:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    fetched,
    tipos,
    categorias,
    fetchProductos,
  }
})
