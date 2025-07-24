import { api } from 'boot/axios'

const JELLYFIN_API_TOKEN_KEY = 'jellyfin_api_token'
const JELLYFIN_USER_ID_KEY = 'jellyfin_user_id'
const JELLYFIN_DEVICE_ID_KEY = 'jellyfin_device_id'

let deviceId = localStorage.getItem(JELLYFIN_DEVICE_ID_KEY) || 'quasar-client-001'
if (!localStorage.getItem(JELLYFIN_DEVICE_ID_KEY)) {
  localStorage.setItem(JELLYFIN_DEVICE_ID_KEY, deviceId)
}

api.defaults.headers['Content-Type'] = 'application/json'
api.defaults.headers['X-Emby-Authorization'] =
  `MediaBrowser Client="QuasarApp", Device="Browser", DeviceId="${deviceId}", Version="1.0.0"`

let token = localStorage.getItem(JELLYFIN_API_TOKEN_KEY) || ''
let userId = localStorage.getItem(JELLYFIN_USER_ID_KEY) || ''

if (token) {
  api.defaults.headers['X-MediaBrowser-Token'] = token
}

export const JellyfinService = {
  async authenticate(username, password) {
    api.defaults.headers['X-Emby-Authorization'] =
      `MediaBrowser Client="QuasarApp", Device="Browser", DeviceId="${deviceId}", Version="1.0.0"`

    const r = await api.post('/Users/AuthenticateByName', { Username: username, Pw: password })
    const newToken = r.data.AccessToken
    const newUserId = r.data.User.Id

    token = newToken
    userId = newUserId

    localStorage.setItem(JELLYFIN_API_TOKEN_KEY, newToken)
    localStorage.setItem(JELLYFIN_USER_ID_KEY, newUserId)

    api.defaults.headers['X-MediaBrowser-Token'] = newToken

    return { token: newToken, userId: newUserId }
  },

  clearAuthData() {
    token = ''
    userId = ''
    localStorage.removeItem(JELLYFIN_API_TOKEN_KEY)
    localStorage.removeItem(JELLYFIN_USER_ID_KEY)
    delete api.defaults.headers['X-MediaBrowser-Token']
  },

  async getViews() {
    if (!userId || !token) {
      throw new Error('Not authenticated. User ID or Token is missing.')
    }
    const r = await api.get(`/UserViews?userid=${userId}`)
    return r.data
  },

  getUserId() {
    return userId
  },

  getToken() {
    return token
  },

  async getItemsByParent(parentId, types = 'Video,Audio') {
    if (!userId || !token) {
      throw new Error('Not authenticated. User ID or Token is missing.')
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
    if (!userId || !token) {
      throw new Error('User ID is not set. Please authenticate first.')
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
    if (!token) {
      throw new Error('Not authenticated. Token is missing.')
    }
    const r = await api.get(`/Playlists/${playlistId}/Items`)
    return r.data.Items
  },

  getImageUrl(item) {
    const tag = item.ImageTags?.Primary || item.ImageTags?.Backdrop?.[0]
    const type = item.ImageTags?.Primary ? 'Primary' : 'Backdrop'
    if (!tag) return 'src/assets/no-image.png'

    return `${api.defaults.baseURL}/Items/${item.Id}/Images/${type}?tag=${tag}&quality=90&X-MediaBrowser-Token=${token}`
  },

  getStreamUrl(itemId) {
    return `${api.defaults.baseURL}/Videos/${itemId}/stream?static=true&X-MediaBrowser-Token=${token}`
  },

  getDocumentUrl(itemId, filename = '') {
    return `${api.defaults.baseURL}/Items/${itemId}/Download/${filename}?api_key=${token}`
  },

  async searchItems(term, limit = 100) {
    if (!userId || !token) {
      throw new Error('Not authenticated. User ID or Token is missing.')
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
      throw new Error('User ID is not set. Please authenticate first.')
    }
    const r = await api.get(`/Users/${userId}/Items/${itemId}`)
    return r.data
  },

  async updateUserData(itemId, data) {
    if (!userId || !token) {
      throw new Error('Not authenticated. User ID or Token is missing.')
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
