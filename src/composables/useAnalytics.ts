import { event } from 'vue-gtag'
import type { Producto } from '@/types/producto'

// Nombres legibles de cada sección/pantalla para que en los reportes de GA4
// aparezcan títulos claros en lugar de slugs internos.
const NOMBRES_PANTALLA: Record<string, string> = {
  inicio: 'Inicio',
  nosotros: 'Nosotros',
  catalogo: 'Catálogo',
  sucursales: 'Sucursales',
  distribuidores: 'Distribuidores',
  agendar: 'Agendar cita',
  servicios: 'Servicios',
  proyectos: 'Proyectos',
  'carrito-vista': 'Carrito',
  'barroca-bot': 'Barroca Bot',
}

export function useAnalytics() {
  // ── Navegación entre pantallas ──
  // Se llama desde router.afterEach en cada cambio de ruta (y desde
  // CookieConsent al obtener consentimiento) para enviar un page_view con
  // título legible. Esto habilita en GA4: usuarios por pantalla, vistas por
  // pantalla y tiempo de interacción promedio en cada pantalla.
  function trackScreenView(section: string) {
    const titulo = NOMBRES_PANTALLA[section] ?? section
    const path = `/${section}`
    event('page_view', {
      page_title: titulo,
      page_path: path,
      page_location:
        typeof window !== 'undefined' ? `${window.location.origin}${path}` : path,
      screen_name: titulo,
    })
  }

  /**
   * Evento genérico para cualquier clic/interacción no cubierta por los
   * helpers específicos. Útil para CTAs sueltos: trackEvent('click_cta', {...}).
   */
  function trackEvent(nombre: string, params: Record<string, unknown> = {}) {
    event(nombre, params)
  }

  /** Clic en un botón/CTA identificable, indicando la pantalla de origen. */
  function trackCtaClick(etiqueta: string, pantalla?: string) {
    event('click_cta', {
      event_category: 'cta',
      event_label: etiqueta,
      ...(pantalla ? { screen_name: pantalla } : {}),
    })
  }

  // ── Barroca Bot ───────────────────────────────────────────
  function trackBotOpen(origen: string) {
    event('bot_abierto', { event_category: 'bot', event_label: origen })
  }

  function trackBotMessage(pregunta: string) {
    event('bot_mensaje', { event_category: 'bot', event_label: pregunta.slice(0, 100) })
  }

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
    trackScreenView,
    trackEvent,
    trackCtaClick,
    trackBotOpen,
    trackBotMessage,
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
