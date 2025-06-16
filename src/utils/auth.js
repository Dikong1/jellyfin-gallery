import Cookies from 'js-cookie'

const AUTH_KEY = 'jellyfin-auth'

export function saveAuth(username, password) {
  const encoded = btoa(`${username}:${password}`)
  Cookies.set(AUTH_KEY, encoded, { expires: 7 }) // 7 days
}

export function getAuth() {
  const encoded = Cookies.get(AUTH_KEY)
  if (!encoded) return null

  try {
    const [username, password] = atob(encoded).split(':')
    return { username, password }
  } catch {
    return null
  }
}

export function clearAuth() {
  Cookies.remove(AUTH_KEY)
}
