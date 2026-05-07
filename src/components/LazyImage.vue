<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  src: string
  blur?: string
  alt?: string
  mobileSrc?: string
  mobileBlur?: string
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'sync' | 'auto'
  imgClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  loading: 'lazy',
  fetchpriority: 'auto',
  decoding: 'async',
})

const loaded = ref(false)

watch(() => props.src, () => { loaded.value = false })

function onLoad() { loaded.value = true }
</script>

<template>
  <div class="relative overflow-hidden">
    <picture v-if="blur || mobileBlur" aria-hidden="true">
      <source v-if="mobileBlur" media="(max-width: 768px)" :srcset="mobileBlur" />
      <img
        :src="blur || mobileBlur"
        alt=""
        class="absolute inset-0 w-full h-full object-cover scale-110 blur-md transition-opacity duration-500"
        :class="loaded ? 'opacity-0' : 'opacity-100'"
      />
    </picture>

    <picture>
      <source v-if="mobileSrc" media="(max-width: 768px)" :srcset="mobileSrc" />
      <img
        :src="src"
        :alt="alt"
        :loading="loading"
        :fetchpriority="fetchpriority"
        :decoding="decoding"
        @load="onLoad"
        class="relative w-full h-full object-cover transition-opacity duration-500"
        :class="[imgClass, loaded ? 'opacity-100' : 'opacity-0']"
      />
    </picture>
  </div>
</template>
