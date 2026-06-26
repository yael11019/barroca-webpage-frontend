import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '../views/HomeLayout.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { trackPixelPageView } from '@/utils/metaPixel'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeLayout,
      children: [
        {
          path: '',
          name: 'inicio',
          component: () => import('@/components/landing/HeroSection.vue'),
        },
        {
          path: 'nosotros',
          name: 'nosotros',
          component: () => import('@/components/landing/AboutSection.vue'),
        },
        {
          path: 'catalogo',
          name: 'catalogo',
          component: () => import('@/components/landing/ProductsSection.vue'),
        },
        {
          path: 'sucursales',
          name: 'sucursales',
          component: () => import('@/components/landing/SucursalesSection.vue'),
        },
        {
          path: 'distribuidores',
          name: 'distribuidores',
          component: () => import('@/components/landing/DistribuidoresSection.vue'),
        },
        {
          path: 'servicios',
          name: 'servicios',
          component: () => import('@/components/landing/ServiciosSection.vue'),
        },
        {
          path: 'agendar',
          name: 'agendar',
          component: () => import('@/components/landing/AppointmentSection.vue'),
        },
        // Ocultas / en desarrollo (sin enlace en el menú, pero accesibles por URL)
        {
          path: 'proyectos',
          name: 'proyectos',
          component: () => import('@/components/landing/ProyectosSection.vue'),
        },
        {
          path: 'carrito',
          name: 'carrito-vista',
          component: () => import('@/components/landing/CarritoSection.vue'),
        },
        {
          path: 'barroca-bot',
          name: 'barroca-bot',
          component: () => import('@/components/landing/BarrocaBotSection.vue'),
        },
      ],
    },
    // Redirects canónicos: la ruta combinada antigua ahora vive en dos secciones.
    { path: '/sucursales-distribuidores', redirect: { name: 'sucursales' } },
    {
      path: '/privacidad',
      name: 'privacidad',
      component: () => import('../views/PrivacidadView.vue'),
    },
    // Cualquier ruta desconocida vuelve al inicio.
    { path: '/:pathMatch(.*)*', redirect: { name: 'inicio' } },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// Vista de pantalla en GA4 por cada cambio de ruta (sustituye al tracking manual
// que se hacía dentro de useNavigation). Usa el nombre de la ruta como sección.
router.afterEach((to) => {
  const { trackScreenView } = useAnalytics()
  const section = (to.name as string | undefined) ?? to.path
  trackScreenView(section)
  // Meta Pixel: en una SPA la navegación no recarga la página, así que el
  // PageView se dispara aquí. No hace nada hasta que el Pixel se inicializa
  // (tras aceptar cookies), de modo que nunca se rastrea sin consentimiento.
  trackPixelPageView()
})

export default router
