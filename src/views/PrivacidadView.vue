<template>
  <div class="min-h-screen bg-white py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
        Aviso de Privacidad
      </h1>
      <p class="text-sm text-gray-400 mb-10">Ultima actualizacion: Marzo 2026</p>

      <div class="space-y-10 text-gray-600 leading-relaxed">
        <!-- Responsable -->
        <section>
          <p>
            <strong class="text-charcoal">Barroca S.A. de C.V.</strong>, con domicilio en Acambaro, Guanajuato,
            es responsable del tratamiento de sus datos personales.
          </p>
        </section>

        <!-- Fines -->
        <section>
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">
            ¿Para que fines utilizaremos sus datos?
          </h2>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-heading font-bold text-charcoal">Estadisticas y Navegacion</h3>
                <p class="text-sm mt-1">
                  Utilizamos Google Analytics para entender que productos (Triplay, MDF, Pino) son de su interes
                  y mejorar nuestra oferta.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 class="font-heading font-bold text-charcoal">Contacto Directo</h3>
                <p class="text-sm mt-1">
                  Si decide contactarnos via WhatsApp o formulario, usaremos sus datos unicamente para
                  cotizaciones y seguimiento de pedidos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Datos recolectados -->
        <section>
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">
            ¿Que datos recolectamos?
          </h2>
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-heading font-bold text-charcoal mb-2">Datos de navegacion (Cookies)</h3>
              <ul class="list-disc pl-5 space-y-1 text-sm">
                <li>Direccion IP (anonimizada)</li>
                <li>Tipo de dispositivo y navegador</li>
                <li>Paginas visitadas y tiempo de estancia</li>
                <li>Categorias de productos consultadas</li>
              </ul>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-heading font-bold text-charcoal mb-2">Datos de contacto</h3>
              <ul class="list-disc pl-5 space-y-1 text-sm">
                <li>Nombre, telefono y correo electronico</li>
                <li class="font-medium text-charcoal">Solo si usted los proporciona voluntariamente</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Cookies -->
        <section>
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">
            Uso de Cookies
          </h2>
          <p>
            Las cookies de Google Analytics se activan <strong class="text-charcoal">unicamente</strong> despues
            de que el usuario acepta el aviso de cookies. Si cierra el aviso sin aceptar, no se instalara
            ninguna cookie de rastreo en su dispositivo.
          </p>
        </section>

        <!-- Derechos ARCO -->
        <section>
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">
            Sus Derechos (ARCO)
          </h2>
          <p>
            Usted tiene derecho a conocer que datos tenemos de usted, para que los utilizamos y las condiciones
            del uso que les damos. Puede solicitar el <strong class="text-charcoal">Acceso, Rectificacion,
            Cancelacion u Oposicion</strong> de sus datos personales enviando un correo a:
          </p>
          <a
            href="mailto:contacto@barroca.com"
            class="inline-block mt-3 text-gold hover:text-gold-dark font-heading font-semibold transition-colors"
          >
            contacto@barroca.com
          </a>
        </section>

        <!-- Cambios al aviso -->
        <section>
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">
            Cambios a este aviso
          </h2>
          <p>
            Nos reservamos el derecho de efectuar modificaciones o actualizaciones al presente aviso de privacidad.
            Cualquier cambio sera publicado en esta misma pagina.
          </p>
        </section>
      </div>

      <!-- Volver al inicio -->
      <div class="mt-12 pt-8 border-t border-gray-100">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-heading font-semibold uppercase tracking-wider text-sm transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>
