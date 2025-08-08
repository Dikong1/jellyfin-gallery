import { api } from 'boot/axios'

const JELLYFIN_API_KEY = '207ffa4053e94fb394d6d1ba785ac787'

const JELLYFIN_DEVICE_ID_KEY = 'jellyfin_device_id'

const deviceId = localStorage.getItem(JELLYFIN_DEVICE_ID_KEY) || 'quasar-client-001'
if (!localStorage.getItem(JELLYFIN_DEVICE_ID_KEY)) {
  localStorage.setItem(JELLYFIN_DEVICE_ID_KEY, deviceId)
}

api.defaults.headers['Content-Type'] = 'application/json'
api.defaults.headers['X-Emby-Authorization'] =
  `MediaBrowser Client="QuasarApp", Device="Browser", DeviceId="${deviceId}", Version="1.0.0"`

api.defaults.headers['X-MediaBrowser-Token'] = JELLYFIN_API_KEY

let userId = ''

export const JellyfinService = {
  async initializeService() {
    try {
      console.log('Инициализация сервиса Jellyfin...')

      const r = await api.get('/Users')
      const adminUser = r.data.find((user) => user.Policy?.IsAdministrator)

      if (!adminUser) {
        throw new Error('Не найден админ пользователь с текущим api key.')
      }

      userId = adminUser.Id
      console.log(`Сервис Jellyfin инициализирован. Админ ID: ${userId}`)
    } catch (error) {
      console.error('Ошибка инициализации сервиса Jellyfin:', error)
      throw new Error(`Ошибка инициализации сервиса Jellyfin: ${error.message}`)
    }
  },

  async getViews() {
    if (!userId) {
      throw new Error('Сервис не инициализирован. Админ ID не определен.')
    }
    const r = await api.get(`/UserViews?userid=${userId}`)
    return r.data
  },

  getUserId() {
    return userId
  },

  getApiKey() {
    return JELLYFIN_API_KEY
  },

  async getItemsByParent(parentId, types = 'Video,Audio') {
    if (!userId) {
      throw new Error('Сервис не инициализирован. Админ ID не определен.')
    }
    const r = await api.get(`/Users/${userId}/Items`, {
      params: { ParentId: parentId, IncludeItemTypes: types, Recursive: true },
    })
    return r.data.Items
  },

  async getFolderItemsAdvanced({
    parentId,
    startIndex = 0,
    limit = 100,
    sortBy = ['IsFolder', 'SortName'],
    sortOrder = 'Descending',
    fields = ['PrimaryImageAspectRatio', 'SortName', 'Path', 'ChildCount', 'MediaSourceCount'],
    imageTypeLimit = 1,
  }) {
    if (!userId) {
      throw new Error('Сервис не инициализирован. Админ ID не определен..')
    }
    const r = await api.get(`/Users/${userId}/Items`, {
      params: {
        ParentId: parentId,
        StartIndex: startIndex,
        Limit: limit,
        Fields: fields.join(','),
        ImageTypeLimit: imageTypeLimit,
        SortBy: sortBy.join(','),
        SortOrder: sortOrder,
      },
    })
    return r.data
  },

  async getPlaylistItems(playlistId) {
    const r = await api.get(`/Playlists/${playlistId}/Items`)
    return r.data.Items
  },

  getImageUrl(item) {
    const tag = item.ImageTags?.Primary || item.ImageTags?.Backdrop?.[0]
    const type = item.ImageTags?.Primary ? 'Primary' : 'Backdrop'
    if (!tag) return 'src/assets/no-image.png'

    return `${api.defaults.baseURL}/Items/${item.Id}/Images/${type}?tag=${tag}&quality=90&api_key=${JELLYFIN_API_KEY}`
  },

  getStreamUrl(itemId) {
    return `${api.defaults.baseURL}/Videos/${itemId}/stream?static=true&api_key=${JELLYFIN_API_KEY}`
  },

  getDocumentUrl(itemId, filename = '') {
    return `${api.defaults.baseURL}/Items/${itemId}/Download/${filename}?api_key=${JELLYFIN_API_KEY}`
  },

  async searchItems(term, limit = 100) {
    if (!userId) {
      throw new Error('Service not initialized. User ID is missing.')
    }
    const r = await api.get('/Items', {
      params: {
        userId,
        recursive: true,
        searchTerm: term,
        includeItemTypes: 'Movie',
        fields: 'PrimaryImageAspectRatio,CanDelete,MediaSourceCount',
        imageTypeLimit: 1,
        enableTotalRecordCount: false,
        limit,
      },
    })
    return r.data.Items
  },

  async getItemById(itemId) {
    if (!userId) {
      throw new Error('Сервис не инициализирован. Админ ID не определен.')
    }
    const r = await api.get(`/Users/${userId}/Items/${itemId}`)
    return r.data
  },

  async updateUserData(itemId, data) {
    if (!userId) {
      throw new Error('Сервис не инициализирован. Админ ID не определен.')
    }
    const r = await api.post(`/UserItems/${itemId}/UserData`, {
      ...data,
      ItemId: itemId,
      Key: itemId,
      UserId: userId,
    })
    return r.data
  },
}
