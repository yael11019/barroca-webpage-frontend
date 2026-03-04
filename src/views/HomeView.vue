<script setup lang="ts">
import AppHeader from '@/components/landing/AppHeader.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import ProductsSection from '@/components/landing/ProductsSection.vue'
import ContactSection from '@/components/landing/ContactSection.vue'
import AppointmentSection from '@/components/landing/AppointmentSection.vue'
import NewsletterSection from '@/components/landing/NewsletterSection.vue'
import AppFooter from '@/components/landing/AppFooter.vue'
import WhatsAppButton from '@/components/landing/WhatsAppButton.vue'
import CartDrawer from '@/components/landing/CartDrawer.vue'
import AppointmentModal from '@/components/landing/AppointmentModal.vue'
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <ContactSection />
      <AppointmentSection />
      <NewsletterSection />
    </main>
    <AppFooter />
    <WhatsAppButton />
    <CartDrawer />
    <AppointmentModal />
  </div>
</template>
