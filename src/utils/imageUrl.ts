/**
 * Convierte rutas de imagen del backend en URLs completas.
 *
 * El backend puede devolver:
 *   - URL completa: "https://..."  → se usa tal cual
 *   - Ruta relativa al storage: "MELAMINA/LINEA.../archivo.jpg"
 *     → se prefixa con /storage/catalogo/ (proxeado por Vite en dev)
 */
export function imageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Eliminar doble slash si la ruta ya empieza con /
  const clean = path.startsWith('/') ? path : `/${path}`
  // En dev el proxy de Vite enruta /storage → backend:8000/storage
  return `/storage/catalogo${clean}`
}
