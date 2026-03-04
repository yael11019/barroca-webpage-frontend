import type { Producto, Variante } from './producto'

export interface ItemCarrito {
  producto: Producto
  variante: Variante
  cantidad: number
}
