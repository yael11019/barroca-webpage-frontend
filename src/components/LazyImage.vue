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
        class="lazy-img-blur absolute inset-0 w-full h-full object-cover"
        :class="{ 'lazy-img-blur--hidden': loaded }"
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
        class="lazy-img-main relative w-full h-full object-cover"
        :class="[imgClass, { 'lazy-img-main--loaded': loaded }]"
      />
    </picture>
  </div>
</template>

<style scoped>
.lazy-img-blur {
  transform: scale(1.1);
  filter: blur(20px);
  opacity: 1;
  transition: opacity 0.4s ease-out;
}
.lazy-img-blur--hidden {
  opacity: 0;
}
.lazy-img-main {
  opacity: 0;
  transition: opacity 0.4s ease-out, transform 0.3s ease;
}
.lazy-img-main--loaded {
  opacity: 1;
}
</style>
