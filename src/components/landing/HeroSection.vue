<template>
  <section
    id="inicio"
    class="relative min-h-screen flex items-center justify-center bg-charcoal pt-16 md:pt-20"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal opacity-90"></div>
    <div class="absolute top-0 left-0 right-0 h-1 bg-gold"></div>

    <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <img
        src="/img/barroca-logo-blanco.png"
        alt="Barroca"
        class="h-20 md:h-28 mx-auto mb-8"
      />
      <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
        Transformando lo ordinario en
        <span class="text-gold">extraordinario</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
        Soluciones premium en materiales para la construccion y el diseno de interiores
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="#productos"
          class="inline-block bg-gold hover:bg-gold-dark text-charcoal font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
        >
          Ver Productos
        </a>
        <a
          href="#contacto"
          class="inline-block border-2 border-white hover:border-gold hover:text-gold text-white font-heading font-bold uppercase tracking-wider px-8 py-4 rounded transition-colors duration-200"
        >
          Contactanos
        </a>
      </div>
    </div>
  </section>
</template>
