import { defineStore } from 'pinia'
import { ref } from 'vue'
import { JellyfinService } from 'src/services/JellyfinService'

export const useMediaStore = defineStore('media', () => {
  const views = ref([])
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      await JellyfinService.authenticate(username, password)
      views.value = await JellyfinService.getViews()
    } catch (e) {
      error.value = 'Ошибка при входе или получении плейлистов'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function selectView(viewId) {
    loading.value = true
    error.value = null
    try {
      items.value = await JellyfinService.getItemsByParent(viewId)
    } catch (e) {
      error.value = 'Ошибка при получении элементов'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    views,
    items,
    loading,
    error,
    login,
    selectView,
    getImageUrl: JellyfinService.getImageUrl,
    getStreamUrl: JellyfinService.getStreamUrl,
  }
})
