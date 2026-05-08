<script setup lang="ts">
import { ref, watch, useAttrs, computed } from 'vue'

defineOptions({ inheritAttrs: false })

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

const attrs = useAttrs()

const POSITION_CLASS_RE = /(?:^|\s)(absolute|fixed|relative|sticky|static)(?:\s|$)/

const rootClass = computed(() => {
  const passed = (attrs.class as string | undefined) ?? ''
  const hasPosition = POSITION_CLASS_RE.test(passed)
  return [
    hasPosition ? '' : 'relative',
    'overflow-hidden',
    passed,
  ].filter(Boolean).join(' ')
})

const rootStyle = computed(() => attrs.style as string | Record<string, string> | undefined)

const loaded = ref(false)

watch(() => props.src, () => { loaded.value = false })

function onLoad() { loaded.value = true }
</script>

<template>
  <div :class="rootClass" :style="rootStyle">
    <picture v-if="blur || mobileBlur" aria-hidden="true">
      <source v-if="mobileBlur" media="(max-width: 768px)" :srcset="mobileBlur" />
      <img
        :src="blur || mobileBlur"
        alt=""
        class="lazy-img-blur"
        :class="{ 'lazy-img-blur--hidden': loaded }"
      />
    </picture>

    <picture class="lazy-picture">
      <source v-if="mobileSrc" media="(max-width: 768px)" :srcset="mobileSrc" />
      <img
        :src="src"
        :alt="alt"
        :loading="loading"
        :fetchpriority="fetchpriority"
        :decoding="decoding"
        @load="onLoad"
        class="lazy-img-main"
        :class="[imgClass, { 'lazy-img-main--loaded': loaded }]"
      />
    </picture>
  </div>
</template>

<style scoped>
.lazy-picture {
  display: block;
  width: 100%;
  height: 100%;
}
.lazy-img-blur {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  filter: blur(20px);
  opacity: 1;
  transition: opacity 0.4s ease-out;
}
.lazy-img-blur--hidden {
  opacity: 0;
}
.lazy-img-main {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.4s ease-out, transform 0.3s ease;
}
.lazy-img-main--loaded {
  opacity: 1;
}
</style>
