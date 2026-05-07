<script setup lang="ts">
import { RouterView } from 'vue-router'
import CookieConsent from '@/components/landing/CookieConsent.vue'
import { useConfigStore } from '@/stores/config'
import { useProductosStore } from '@/stores/productos'

const configStore = useConfigStore()
const productosStore = useProductosStore()
configStore.fetchSettings()
productosStore.fetchProductos()
</script>

<template>
  <RouterView />
  <CookieConsent />
</template>
