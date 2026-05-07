import OpenAI from 'openai'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

export interface ShowroomRequest {
  imageBase64: string
  mimeType: string
  tipo: string
  subcategoria: string
  colorNombre: string
  textureImageUrl?: string | null
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const parts = dataUrl.split(',')
      const mimeType = parts[0]?.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      const base64 = parts[1] ?? ''
      resolve({ base64, mimeType })
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function generarVisualizacion(req: ShowroomRequest): Promise<string> {
  if (!API_KEY || API_KEY.startsWith('sk-proj-REEMPLAZA')) {
    throw new Error('VITE_OPENAI_API_KEY no está configurada en el archivo .env')
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentParts: any[] = []

  // Foto del espacio del usuario
  contentParts.push({
    type: 'input_image',
    image_url: `data:${req.mimeType};base64,${req.imageBase64}`,
  })

  // Textura del material seleccionado
  if (req.textureImageUrl) {
    const texture = await fetchImageAsBase64(req.textureImageUrl)
    contentParts.push({
      type: 'input_image',
      image_url: `data:${texture.mimeType};base64,${texture.base64}`,
    })
  }

  const prompt = [
    `Modifica la primera imagen (foto de un espacio interior) aplicando el material "${req.colorNombre}" de la línea "${req.subcategoria}" (categoría: ${req.tipo}) sobre el suelo o las paredes del espacio.`,
    req.textureImageUrl
      ? 'La segunda imagen es la muestra exacta de ese material — usa su textura, color y patrón al aplicarlo.'
      : '',
    'Conserva la perspectiva, iluminación y composición originales. El resultado debe ser fotorrealista.',
  ].filter(Boolean).join(' ')

  contentParts.push({ type: 'input_text', text: prompt })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (openai.responses as any).create({
    model: 'gpt-4.1-mini',
    input: [{ role: 'user', content: contentParts }],
    tools: [{ type: 'image_generation' }],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageData: string[] = (response.output as any[])
    .filter((o) => o.type === 'image_generation_call')
    .map((o) => o.result)

  if (imageData.length === 0) {
    throw new Error('OpenAI no generó ninguna imagen. Intenta de nuevo.')
  }

  return `data:image/png;base64,${imageData[0]}`
}
