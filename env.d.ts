/// <reference types="vite/client" />

declare module 'vue' {
  export interface GlobalComponents {
    LazyImage: typeof import('@/components/LazyImage.vue')['default']
    LazyVideo: typeof import('@/components/LazyVideo.vue')['default']
  }
}

export {}
