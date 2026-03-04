import api from './api'
import type { NewsletterSubscription, NewsletterResponse } from '@/types/newsletter'

export const newsletterService = {
  async subscribe(payload: NewsletterSubscription): Promise<NewsletterResponse> {
    const { data } = await api.post<NewsletterResponse>('/api/public/newsletter', payload)
    return data
  },
}
