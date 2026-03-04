import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Producto, Variante } from '@/types/producto'
import type { ItemCarrito } from '@/types/carrito'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref<ItemCarrito[]>([])
  const abierto = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.cantidad, 0),
  )

  const totalPrecio = computed(() =>
    items.value.reduce(
      (sum, item) => sum + parseFloat(item.variante.precio_base) * item.cantidad,
      0,
    ),
  )

  function agregarItem(producto: Producto, variante: Variante) {
    const existente = items.value.find((i) => i.variante.id === variante.id)
    if (existente) {
      existente.cantidad++
    } else {
      items.value.push({ producto, variante, cantidad: 1 })
    }
    abierto.value = true
  }

  function removerItem(varianteId: number) {
    items.value = items.value.filter((i) => i.variante.id !== varianteId)
  }

  function actualizarCantidad(varianteId: number, cantidad: number) {
    const item = items.value.find((i) => i.variante.id === varianteId)
    if (!item) return
    if (cantidad <= 0) {
      removerItem(varianteId)
    } else {
      item.cantidad = cantidad
    }
  }

  function vaciarCarrito() {
    items.value = []
  }

  function toggleCarrito() {
    abierto.value = !abierto.value
  }

  return {
    items,
    abierto,
    totalItems,
    totalPrecio,
    agregarItem,
    removerItem,
    actualizarCantidad,
    vaciarCarrito,
    toggleCarrito,
  }
})
