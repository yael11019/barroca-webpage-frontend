import { ref } from 'vue'

const currentSection = ref('inicio')
const catalogFilter = ref<string | null>(null)

export function useNavigation() {
  function navigateTo(section: string, filter?: string | null) {
    currentSection.value = section
    if (filter !== undefined) {
      catalogFilter.value = filter ?? null
    }
  }
  return { currentSection, catalogFilter, navigateTo }
}
