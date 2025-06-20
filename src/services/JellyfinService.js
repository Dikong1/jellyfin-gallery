import { api } from 'boot/axios'

const deviceId = 'quasar-client-001'
const host = api.defaults.baseURL

api.defaults.headers['Content-Type'] = 'application/json'
api.defaults.headers['X-Emby-Authorization'] =
  `MediaBrowser Client="QuasarApp", Device="Browser", DeviceId="${deviceId}", Version="1.0.0"`

let token = ''
let userId = ''

export const JellyfinService = {
  async authenticate(username, password) {
    const r = await api.post('/Users/AuthenticateByName', { Username: username, Pw: password })
    token = r.data.AccessToken
    userId = r.data.User.Id
    api.defaults.headers['X-MediaBrowser-Token'] = token
    return { token, userId }
  },

  async getViews() {
    const r = await api.get(`/Users/${userId}/Views`)
    return r.data // contains .Items[]
  },

  async getItemsByParent(parentId, types = 'Video,Audio') {
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
    if (!tag) return 'https://via.placeholder.com/500x281?text=No+Image'

    return `${host}/Items/${item.Id}/Images/${type}?tag=${tag}&quality=90&X-MediaBrowser-Token=${token}`
  },

  getStreamUrl(itemId) {
    return `${host}/Videos/${itemId}/stream?static=true&X-MediaBrowser-Token=${token}`
  },
}
