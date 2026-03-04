import { ref } from 'vue'
import { defineStore } from 'pinia'
import { newsletterService } from '@/services/newsletter.service'

export const useNewsletterStore = defineStore('newsletter', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  async function subscribe(email: string) {
    loading.value = true
    error.value = null
    success.value = false
    try {
      await newsletterService.subscribe({ email })
      success.value = true
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err.response?.status === 409) {
        error.value = 'Este correo ya esta suscrito.'
      } else if (err.response?.status === 422) {
        error.value = 'Por favor ingresa un correo valido.'
      } else {
        error.value = 'Error al suscribirte. Intenta de nuevo.'
      }
      console.error('Failed to subscribe:', e)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = null
    success.value = false
  }

  return { loading, error, success, subscribe, reset }
})
