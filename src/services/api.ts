import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    Accept: 'application/json',
    'X-Frontend-Key': import.meta.env.VITE_FRONTEND_KEY ?? '',
  },
  timeout: 15000, // 15 s — evita que el spinner quede colgado para siempre
})

export default api
