import { ref } from 'vue'

const currentSection = ref('inicio')
const catalogFilter = ref<string | null>(null)
// Pestaña con la que debe abrirse el Barroca Bot ('chat' por defecto)
const botTab = ref<'chat' | 'showroom'>('chat')

export function useNavigation() {
  function navigateTo(section: string, filter?: string | null) {
    currentSection.value = section
    if (filter !== undefined) {
      catalogFilter.value = filter ?? null
    }
  }
  return { currentSection, catalogFilter, botTab, navigateTo }
}
