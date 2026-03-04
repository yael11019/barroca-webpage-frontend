import { event } from 'vue-gtag'
import type { Producto } from '@/types/producto'

export function useAnalytics() {
  // ── Contacto ──────────────────────────────────────────────

  function trackWhatsAppClick(contexto: string) {
    event('click_whatsapp', {
      event_category: 'contacto',
      event_label: contexto,
      value: 1,
    })
  }

  function trackPhoneClick(telefono: string, sucursal: string) {
    event('click_telefono', {
      event_category: 'contacto',
      event_label: `${sucursal} - ${telefono}`,
      value: 1,
    })
  }

  function trackEmailClick(correo: string, sucursal: string) {
    event('click_email', {
      event_category: 'contacto',
      event_label: `${sucursal} - ${correo}`,
      value: 1,
    })
  }

  function trackDirectionsClick(sucursal: string) {
    event('click_como_llegar', {
      event_category: 'contacto',
      event_label: sucursal,
      value: 1,
    })
  }

  // ── Ecommerce / Productos ────────────────────────────────

  function trackAddToCart(producto: string, variante: string, precio: string) {
    event('add_to_cart', {
      event_category: 'ecommerce',
      event_label: `${producto} - ${variante}`,
      value: parseFloat(precio),
    })
  }

  /**
   * Dispara view_item_list cuando el usuario filtra por categoría.
   * Envía los productos visibles como items para el reporte de interés por categoría.
   */
  function trackViewItemList(categoria: string, productos: Producto[], sucursal?: string) {
    const catId = `cat_${categoria.toLowerCase().replace(/\s+/g, '_')}`
    event('view_item_list', {
      item_list_id: catId,
      item_list_name: categoria,
      items: productos.slice(0, 20).map((p, index) => ({
        item_id: String(p.id),
        item_name: p.nombre,
        item_category: p.categoria,
        index,
        ...(sucursal ? { location_id: sucursal.replace(/\s+/g, '_') } : {}),
      })),
    })
  }

  function trackCategoryFilter(categoria: string) {
    event('filter_categoria', {
      event_category: 'navegacion',
      event_label: categoria,
    })
  }

  function trackCartOrder(totalItems: number, totalPrecio: number) {
    event('pedido_whatsapp', {
      event_category: 'ecommerce',
      event_label: `${totalItems} productos`,
      value: totalPrecio,
    })
  }

  // ── Navegación ────────────────────────────────────────────

  function trackSucursalSwitch(sucursal: string) {
    event('cambio_sucursal', {
      event_category: 'navegacion',
      event_label: sucursal,
    })
  }

  // ── Engagement (tiempo de visualización de producto) ──────

  let engagementStart: number | null = null
  let engagementProducto: string | null = null

  function startProductEngagement(productoNombre: string) {
    engagementStart = Date.now()
    engagementProducto = productoNombre
  }

  function endProductEngagement() {
    if (!engagementStart || !engagementProducto) return
    const seconds = Math.round((Date.now() - engagementStart) / 1000)
    if (seconds >= 2) {
      event('product_engagement', {
        event_category: 'engagement',
        event_label: engagementProducto,
        value: seconds,
      })
    }
    engagementStart = null
    engagementProducto = null
  }

  // ── Newsletter ──────────────────────────────────────────────

  function trackNewsletterSubscription(email: string) {
    event('newsletter_subscription', {
      event_category: 'engagement',
      event_label: email,
      value: 1,
    })
  }

  // ── Citas ─────────────────────────────────────────────────

  function trackAppointmentStarted() {
    event('appointment_started', {
      event_category: 'citas',
      event_label: 'visita_vendedor',
      value: 1,
    })
  }

  function trackAppointmentCompleted(fecha: string, hora: string) {
    event('appointment_completed', {
      event_category: 'citas',
      event_label: `${fecha} ${hora}`,
      value: 1,
    })
  }

  return {
    trackWhatsAppClick,
    trackPhoneClick,
    trackEmailClick,
    trackDirectionsClick,
    trackAddToCart,
    trackViewItemList,
    trackCategoryFilter,
    trackCartOrder,
    trackSucursalSwitch,
    startProductEngagement,
    endProductEngagement,
    trackNewsletterSubscription,
    trackAppointmentStarted,
    trackAppointmentCompleted,
  }
}
