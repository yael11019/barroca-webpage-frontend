<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import CookieConsent from '@/components/landing/CookieConsent.vue'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()

onMounted(() => {
  configStore.fetchSettings()
})
</script>

<template>
  <RouterView />
  <CookieConsent />
</template>
