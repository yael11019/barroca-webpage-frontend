<script setup lang="ts">
interface Props {
  src: string
  poster?: string
  autoplay?: boolean
  controls?: boolean
  playsinline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  type?: string
}

withDefaults(defineProps<Props>(), {
  autoplay: false,
  controls: true,
  playsinline: true,
  preload: 'none',
  type: 'video/mp4',
})
</script>

<template>
  <video
    :poster="poster"
    :preload="preload"
    :autoplay="autoplay"
    :controls="controls"
    :playsinline="playsinline"
    class="block w-full h-auto bg-black"
  >
    <source :src="src" :type="type" />
    Tu navegador no soporta video HTML5.
  </video>
</template>
