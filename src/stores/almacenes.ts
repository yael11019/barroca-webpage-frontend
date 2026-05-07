import { ref } from 'vue'
import { defineStore } from 'pinia'
import { almacenService } from '@/services/almacen.service'
import type { Almacen } from '@/types/almacen'

export const useAlmacenesStore = defineStore('almacenes', () => {
  const almacenes = ref<Almacen[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)
  const selected = ref<Almacen | null>(null)

  async function fetchAlmacenes(force = false) {
    if (fetched.value && !force) return
    loading.value = true
    error.value = null
    try {
      almacenes.value = await almacenService.getAll()
      fetched.value = true
      const activos = almacenes.value.filter((a) => a.activo)
      if (activos.length > 0 && !selected.value) {
        selected.value = activos[0] ?? null
      }
    } catch (e) {
      error.value = 'Error al cargar las sucursales.'
      console.error('Failed to fetch almacenes:', e)
    } finally {
      loading.value = false
    }
  }

  function selectAlmacen(almacen: Almacen) {
    selected.value = almacen
  }

  return {
    almacenes,
    loading,
    error,
    fetched,
    selected,
    fetchAlmacenes,
    selectAlmacen,
  }
})
