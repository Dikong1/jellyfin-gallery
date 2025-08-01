import { defineStore } from 'pinia'
import { ref } from 'vue'
import { JellyfinService } from 'src/services/JellyfinService'

export const useMediaStore = defineStore('media', () => {
  const views = ref([])
  const items = ref([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const perPage = ref(20)
  const searchResults = ref([])
  const detailsMap = ref({})

  const activeTab = ref('videos')

  const loading = ref(false)
  const error = ref(null)

  async function initialize() {
    loading.value = true
    error.value = null
    try {
      await JellyfinService.initializeService()

      views.value = await JellyfinService.getViews()
      items.value = []
      searchResults.value = []
    } catch (e) {
      error.value = 'Ошибка при инициализации или получении библиотеки'
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
    loading.value = true
    error.value = null
    try {
      const result = await JellyfinService.getItemsByParent(folderId)
      items.value = result
      totalItems.value = result.length
      return result
    } catch (e) {
      error.value = 'Ошибка при загрузке медиа'
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
      error.value = 'Ошибка при загрузке с пагинацией'
      console.error(e)
      return { Items: [], TotalRecordCount: 0 }
    } finally {
      loading.value = false
    }
  }

  async function search(term) {
    loading.value = true
    error.value = null
    try {
      const result = await JellyfinService.searchItems(term)
      searchResults.value = result
    } catch (e) {
      error.value = 'Ошибка при поиске'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchItemDetails(itemId) {
    if (detailsMap.value[itemId]) {
      return detailsMap.value[itemId]
    }
    loading.value = true
    error.value = null
    try {
      const itemDetails = await JellyfinService.getItemById(itemId)
      detailsMap.value[itemId] = itemDetails
      return itemDetails
    } catch (e) {
      error.value = 'Ошибка при получении деталей'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function setActiveTab(tab) {
    activeTab.value = tab
  }

  return {
    views,
    items,
    totalItems,
    currentPage,
    perPage,
    searchResults,
    loading,
    error,
    initialize,
    selectView,
    loadFolderItems,
    loadFolderItemsPaged,
    search,
    fetchItemDetails,
    async updateUserData(itemId, data) {
      return await JellyfinService.updateUserData(itemId, data)
    },
    getImageUrl: JellyfinService.getImageUrl,
    getStreamUrl: JellyfinService.getStreamUrl,
    getDocumentUrl: JellyfinService.getDocumentUrl,
    getActiveTab: () => activeTab.value,
    setActiveTab,
  }
})
