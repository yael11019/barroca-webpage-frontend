import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { CarouselSlide } from '@/types/siteSettings'

export const useConfigStore = defineStore('config', () => {
  const heroUrl = ref('')
  const heroBlur = ref('')
  const carousel = ref<CarouselSlide[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/api/public/site-media')
      heroUrl.value = data.hero_url ?? ''
      heroBlur.value = data.hero_blur ?? ''
      carousel.value = data.carousel ?? [] // Ya ordenado por el Backend
    } catch (e) {
      error.value = 'No se pudieron cargar las configuraciones del sitio.'
      console.error('Failed to fetch site media:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    heroUrl,
    heroBlur,
    carousel,
    loading,
    error,
    fetchSettings,
  }
})
