/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_FRONTEND_KEY: string
  /** ID de medición de Google Analytics 4 (formato G-XXXXXXXXXX). */
  readonly VITE_GA_MEASUREMENT_ID?: string
  /** ID del Meta Pixel (Facebook Pixel) para Meta Ads. */
  readonly VITE_META_PIXEL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue' {
  export interface GlobalComponents {
    LazyImage: typeof import('@/components/LazyImage.vue')['default']
    LazyVideo: typeof import('@/components/LazyVideo.vue')['default']
  }
}

export {}
