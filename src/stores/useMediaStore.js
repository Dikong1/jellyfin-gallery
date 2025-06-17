// src/stores/useMediaStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { JellyfinService } from 'src/services/JellyfinService'

export const useMediaStore = defineStore('media', () => {
  const views = ref([]) // holds result of JellyfinService.getViews()
  const items = ref([]) // holds media items for current view
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
      throw e
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

  async function loadFolderItems(folderId) {
    loading.value = true
    error.value = null
    try {
      const result = await JellyfinService.getItemsByParent(folderId)
      items.value = result
      return result
    } catch (e) {
      error.value = 'Ошибка при загрузке медиа из папки'
      console.error(e)
      return []
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
    loadFolderItems,
    getImageUrl: JellyfinService.getImageUrl,
    getStreamUrl: JellyfinService.getStreamUrl,
  }
})
