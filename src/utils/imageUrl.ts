/**
 * Convierte rutas de imagen del backend en URLs completas.
 *
 * El backend puede devolver:
 *   - URL completa: "https://..."  → se usa tal cual
 *   - Ruta relativa al storage: "MELAMINA/LINEA.../archivo.jpg"
 *     → se prefixa con {VITE_API_URL}/storage/catalogo/
 */
const API_BASE = (
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? ''
).replace(/\/$/, '')

export function imageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const clean = path.startsWith('/') ? path : `/${path}`
  // Si la ruta ya viene con /storage, no la dupliques
  const storagePath = clean.startsWith('/storage/') ? clean : `/storage/catalogo${clean}`
  return `${API_BASE}${storagePath}`
}
