// Meta Pixel (Facebook Pixel) para medir campañas de Meta Ads.
//
// Sigue el mismo patrón que GA4 en este proyecto:
//  - El ID se configura por variable de entorno (VITE_META_PIXEL_ID), no se
//    hardcodea, para usar IDs distintos por entorno y no exponerlo en el repo.
//  - El script se carga de forma diferida (lazy) SOLO cuando el usuario acepta
//    cookies (ver CookieConsent.vue), no al cargar el HTML.
//  - Al ser una SPA, el PageView se dispara en cada cambio de ruta
//    (ver router.afterEach), no solo en la carga inicial.

type FbqArgs = unknown[]

interface Fbq {
  (...args: FbqArgs): void
  callMethod?: (...args: FbqArgs) => void
  queue: FbqArgs[]
  push: Fbq
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

let inicializado = false

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

// Inyecta el script base de Meta (fbevents.js) una sola vez. Equivalente al
// snippet "!function(f,b,e,v,n,t,s)..." que entrega Meta, pero en TypeScript.
function cargarScriptBase() {
  if (window.fbq) return

  const n: Fbq = function (...args: FbqArgs) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args)
  } as Fbq

  if (!window._fbq) window._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  window.fbq = n

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
}

/**
 * Inicializa el Meta Pixel y registra el primer PageView. Se llama una vez que
 * hay consentimiento de cookies. Si no hay ID configurado, no hace nada.
 */
export function initMetaPixel() {
  if (inicializado || !PIXEL_ID) {
    if (!PIXEL_ID && import.meta.env.DEV) {
      console.warn('[meta-pixel] VITE_META_PIXEL_ID no está definido; Pixel deshabilitado.')
    }
    return
  }

  cargarScriptBase()
  window.fbq?.('init', PIXEL_ID)
  window.fbq?.('track', 'PageView')
  inicializado = true
}

/**
 * Dispara un PageView. Pensado para router.afterEach en cada cambio de ruta.
 * No hace nada si el Pixel aún no se ha inicializado (sin consentimiento), de
 * modo que nunca se rastrea antes de aceptar cookies.
 */
export function trackPixelPageView() {
  if (!inicializado) return
  window.fbq?.('track', 'PageView')
}

/**
 * Dispara un evento estándar o personalizado del Pixel (p. ej. 'Lead',
 * 'Contact', 'AddToCart'). No hace nada si el Pixel no está inicializado.
 * Útil más adelante para optimizar campañas por conversiones.
 */
export function trackPixelEvent(nombre: string, params: Record<string, unknown> = {}) {
  if (!inicializado) return
  window.fbq?.('track', nombre, params)
}
