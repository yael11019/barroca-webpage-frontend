import axios from 'axios'

const api = axios.create({
  // Sin baseURL: las peticiones van a /api/... y Vite las proxea al backend.
  // En producción, configura VITE_API_BASE_URL en tu .env de build.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000, // 15 s — evita que el spinner quede colgado para siempre
})

export default api
