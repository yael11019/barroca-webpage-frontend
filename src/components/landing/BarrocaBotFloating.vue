<script setup lang="ts">
import { ref, nextTick } from 'vue'
import api from '@/services/api'

interface Mensaje {
  id: number
  from: 'bot' | 'user'
  text: string
}

const isOpen = ref(false)
let msgId = 2

const mensajes = ref<Mensaje[]>([{
  id: 1,
  from: 'bot',
  text: '¡Hola! Soy el asistente de Barroca 👋\n¿En qué puedo ayudarte? Escribe tu pregunta o elige una opción.',
}])
const inputText = ref('')
const isBotTyping = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)

const quickReplies = [
  '¿Qué servicios ofrece Barroca?',
  '¿Dónde están ubicados?',
  '¿Cuáles son sus horarios de atención?',
  '¿Cómo puedo cotizar?',
  '¿Tienen catálogo de melaminas?',
  '¿Hacen corte y enchapado juntos?',
]

function renderText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

async function scrollToBottom() {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

async function sendMessage(text?: string) {
  const msg = (text ?? inputText.value).trim()
  if (!msg || isBotTyping.value) return
  inputText.value = ''
  mensajes.value.push({ id: msgId++, from: 'user', text: msg })
  await scrollToBottom()
  isBotTyping.value = true
  await scrollToBottom()

  const fallback = 'Lo siento, no pude procesar tu pregunta. Contáctanos por **WhatsApp al +52 417 160 1530**. 😊'
  let respuesta: string
  try {
    const { data } = await api.post('/api/public/chat', { pregunta: msg })
    respuesta = data?.content ?? fallback
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { content?: string } } }
    respuesta = axiosErr?.response?.data?.content ?? fallback
  }

  isBotTyping.value = false
  mensajes.value.push({ id: msgId++, from: 'bot', text: respuesta })
  await scrollToBottom()
}

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <!-- Botón flotante -->
  <button
    @click="toggle"
    class="absolute bottom-24 right-6 z-30 w-11 h-11 rounded-full bg-charcoal hover:bg-charcoal-light shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
    aria-label="Abrir asistente Barroca"
  >
    <Transition name="icon-swap" mode="out-in">
      <svg v-if="!isOpen" key="open" class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <svg v-else key="close" class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </Transition>
  </button>

  <!-- Popup chat -->
  <Transition name="chatpop">
    <div
      v-if="isOpen"
      class="fixed bottom-40 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden w-[300px] max-h-[420px] md:w-[480px] md:max-h-[640px]"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-3 bg-charcoal flex-shrink-0">
        <div class="relative flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-charcoal rounded-full"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white font-heading font-bold text-sm leading-none">Barroca Asistente</p>
          <p class="text-green-400 text-xs mt-0.5">En línea</p>
        </div>
        <button @click="isOpen = false" class="text-white/50 hover:text-white transition-colors p-1 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mensajes -->
      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        <div
          v-for="msg in mensajes"
          :key="msg.id"
          :class="['flex', msg.from === 'user' ? 'justify-end' : 'justify-start items-end gap-2']"
        >
          <div v-if="msg.from === 'bot'" class="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          <div
            :class="[
              'max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed',
              msg.from === 'bot'
                ? 'bg-gray-100 text-charcoal rounded-tl-none'
                : 'bg-charcoal text-white rounded-tr-none',
            ]"
            v-html="renderText(msg.text)"
          />
        </div>

        <!-- Typing indicator -->
        <div v-if="isBotTyping" class="flex items-end gap-2">
          <div class="w-6 h-6 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          <div class="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </div>
        </div>

        <div ref="messagesEnd" />
      </div>

      <!-- Quick replies -->
      <div v-if="mensajes.at(-1)?.from === 'bot' && !isBotTyping" class="px-4 pb-2 flex-shrink-0">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="q in quickReplies"
            :key="q"
            @click="sendMessage(q)"
            class="text-[10px] bg-gray-50 hover:bg-gold/10 hover:text-charcoal border border-gray-200 hover:border-gold text-gray-500 px-2 py-1 rounded-full font-heading font-medium transition-colors"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
        <div class="flex gap-2 items-center">
          <input
            v-model="inputText"
            type="text"
            placeholder="Escribe tu pregunta..."
            class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-charcoal placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"
            @keydown.enter.prevent="sendMessage()"
            :disabled="isBotTyping"
          />
          <button
            @click="sendMessage()"
            :disabled="!inputText.trim() || isBotTyping"
            class="w-8 h-8 rounded-xl bg-charcoal hover:bg-charcoal-light disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.chatpop-enter-active, .chatpop-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.chatpop-enter-from, .chatpop-leave-to { opacity: 0; transform: translateY(10px) scale(0.97); }

.icon-swap-enter-active, .icon-swap-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.icon-swap-enter-from, .icon-swap-leave-to { opacity: 0; transform: scale(0.7) rotate(90deg); }
</style>
