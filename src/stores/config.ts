import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { CarouselSlide, CatalogoMedia } from '@/types/siteSettings'

export const useConfigStore = defineStore('config', () => {
  // Hero desktop
  const heroUrl = ref('')
  const heroBlur = ref('')
  // Hero mobile
  const heroMobileUrl = ref('')
  const heroMobileBlur = ref('')

  const carousel = ref<CarouselSlide[]>([])
  const catalogos = ref<Record<string, CatalogoMedia>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/api/public/site-media')

      // Hero: nuevo formato { hero: { desktop_url, mobile_url, ... } } o legacy { hero_url }
      if (data.hero) {
        heroUrl.value = data.hero.desktop_url ?? ''
        heroBlur.value = data.hero.desktop_blur ?? ''
        heroMobileUrl.value = data.hero.mobile_url ?? data.hero.desktop_url ?? ''
        heroMobileBlur.value = data.hero.mobile_blur ?? data.hero.desktop_blur ?? ''
      } else {
        heroUrl.value = data.hero_url ?? ''
        heroBlur.value = data.hero_blur ?? ''
        heroMobileUrl.value = data.hero_url ?? ''
        heroMobileBlur.value = data.hero_blur ?? ''
      }

      carousel.value = data.carousel ?? []
      catalogos.value = data.catalogos ?? {}
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
    heroMobileUrl,
    heroMobileBlur,
    carousel,
    catalogos,
    loading,
    error,
    fetchSettings,
  }
})
