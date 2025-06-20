// src/stores/useMediaStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { JellyfinService } from 'src/services/JellyfinService'

export const useMediaStore = defineStore('media', () => {
  const views = ref([]) // library views
  const items = ref([]) // media items in current page
  const totalItems = ref(0) // total items in selected view
  const currentPage = ref(1)
  const perPage = ref(20)

  const loading = ref(false)
  const error = ref(null)

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      await JellyfinService.authenticate(username, password)
      views.value = await JellyfinService.getViews()
      items.value = []
    } catch (e) {
      error.value = 'Ошибка при входе или получении плейлистов'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function selectView(viewId) {
    currentPage.value = 1
    return await loadFolderItemsPaged(viewId, 1, perPage.value)
  }

  async function loadFolderItems(folderId) {
    // legacy method, keep if still used elsewhere
    loading.value = true
    error.value = null
    try {
      const result = await JellyfinService.getItemsByParent(folderId)
      items.value = result
      totalItems.value = result.length
      return result
    } catch (e) {
      error.value = 'Ошибка при загрузке медиа из папки'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function loadFolderItemsPaged(folderId, page = 1, limit = 20) {
    loading.value = true
    error.value = null
    try {
      const startIndex = (page - 1) * limit
      const result = await JellyfinService.getFolderItemsAdvanced({
        parentId: folderId,
        startIndex,
        limit,
      })
      items.value = result.Items
      totalItems.value = result.TotalRecordCount
      currentPage.value = page
      return result
    } catch (e) {
      error.value = 'Ошибка при загрузке данных с пагинацией'
      console.error(e)
      return { Items: [], TotalRecordCount: 0 }
    } finally {
      loading.value = false
    }
  }

  return {
    views,
    items,
    totalItems,
    currentPage,
    perPage,
    loading,
    error,
    login,
    selectView,
    loadFolderItems,
    loadFolderItemsPaged,
    getImageUrl: JellyfinService.getImageUrl,
    getStreamUrl: JellyfinService.getStreamUrl,
  }
})
