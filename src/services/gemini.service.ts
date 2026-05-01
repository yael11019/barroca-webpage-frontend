const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const GEMINI_PROXY = '/gemini-proxy/v1beta'

export interface ShowroomRequest {
  imageBase64: string
  mimeType: string
  tipo: string
  subcategoria: string
  colorNombre: string
  textureImageUrl?: string | null
}

// ── Diagnóstico: lista los modelos disponibles para esta API key ────────────
export async function listarModelosDisponibles(): Promise<void> {
  if (!API_KEY) return
  try {
    const res = await fetch(`${GEMINI_PROXY}/models?key=${API_KEY}&pageSize=50`)
    const data = await res.json()
    const nombres: string[] = (data.models ?? []).map((m: { name: string }) => m.name)
    console.groupCollapsed('[Gemini] Modelos disponibles para esta API key')
    nombres.forEach((n) => console.log(n))
    console.groupEnd()
  } catch (e) {
    console.warn('[Gemini] No se pudo obtener lista de modelos:', e)
  }
}

// ── Visualización con Canvas (textura real del material) ───────────────────
// Aplica la imagen del color seleccionado como overlay sobre la foto del espacio.
// Funciona sin necesidad de modelos de imagen generativa.
function aplicarTexturaCanvas(
  imageBase64: string,
  mimeType: string,
  textureUrl: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) { reject(new Error('Canvas no disponible')); return }

    const roomImg = new Image()

    roomImg.onerror = () => reject(new Error('No se pudo cargar la foto del espacio'))

    roomImg.onload = () => {
      canvas.width = roomImg.naturalWidth
      canvas.height = roomImg.naturalHeight

      // 1. Dibujar foto del espacio original
      ctx.drawImage(roomImg, 0, 0)

      const textureImg = new Image()
      textureImg.crossOrigin = 'anonymous'

      textureImg.onload = () => {
        // 2. Mosaico de la textura del material con blend multiply
        //    Escala para que la textura se repita unas 4 veces en horizontal
        const scale = canvas.width / (textureImg.naturalWidth * 4)
        const tw = Math.ceil(textureImg.naturalWidth * scale)
        const th = Math.ceil(textureImg.naturalHeight * scale)

        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = 0.45
        for (let x = 0; x < canvas.width; x += tw) {
          for (let y = 0; y < canvas.height; y += th) {
            ctx.drawImage(textureImg, x, y, tw, th)
          }
        }

        // 3. Ligero viñeteado para dar profundidad
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 0.12
        const vignette = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.85,
        )
        vignette.addColorStop(0, 'transparent')
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'

        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }

      textureImg.onerror = () => {
        // Sin textura: overlay de color semitransparente
        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#C4955A'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }

      textureImg.src = textureUrl
    }

    roomImg.src = `data:${mimeType};base64,${imageBase64}`
  })
}

// ── Punto de entrada principal ────────────────────────────────────────────
export async function generarVisualizacion(req: ShowroomRequest): Promise<string> {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY no está configurada en el archivo .env')
  }

  // Muestra en consola qué modelos tiene disponibles esta API key
  listarModelosDisponibles()

  if (!req.textureImageUrl) {
    throw new Error('No hay imagen de textura para el color seleccionado')
  }

  // Aplica la textura del material sobre la foto usando Canvas
  return aplicarTexturaCanvas(req.imageBase64, req.mimeType, req.textureImageUrl)
}
