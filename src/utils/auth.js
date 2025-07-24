// src/utils/auth.js
import Cookies from 'js-cookie'

// Keys for storing Jellyfin API token and related info in localStorage
const JELLYFIN_API_TOKEN_KEY = 'jellyfin_api_token'
const JELLYFIN_USER_ID_KEY = 'jellyfin_user_id'
const JELLYFIN_DEVICE_ID_KEY = 'jellyfin_device_id'

// Key for storing user credentials (username/password) in cookies
const AUTH_CREDENTIALS_KEY = 'jellyfin_credentials'

/**
 * Saves the Jellyfin API access token, user ID, and device ID to localStorage.
 * This data is used for authenticated API requests after initial login.
 * @param {string} token - The Jellyfin API access token.
 * @param {string} userId - The Jellyfin user ID associated with the token.
 * @param {string} deviceId - The unique device ID used for the session.
 */
export function saveJellyfinAuthToken(token, userId, deviceId) {
  localStorage.setItem(JELLYFIN_API_TOKEN_KEY, token)
  localStorage.setItem(JELLYFIN_USER_ID_KEY, userId)
  localStorage.setItem(JELLYFIN_DEVICE_ID_KEY, deviceId)
  console.log('Jellyfin API token, userId, and deviceId saved to localStorage.')
}

/**
 * Retrieves the Jellyfin API access token, user ID, and device ID from localStorage.
 * @returns {{token: string, userId: string, deviceId: string}|null} An object containing the token, userId, and deviceId, or null if not found.
 */
export function getJellyfinAuthToken() {
  const token = localStorage.getItem(JELLYFIN_API_TOKEN_KEY)
  const userId = localStorage.getItem(JELLYFIN_USER_ID_KEY)
  const deviceId = localStorage.getItem(JELLYFIN_DEVICE_ID_KEY)
  if (token && userId && deviceId) {
    return { token, userId, deviceId }
  }
  return null
}

/**
 * Clears the Jellyfin API access token, user ID, and device ID from localStorage.
 */
export function clearJellyfinAuthToken() {
  localStorage.removeItem(JELLYFIN_API_TOKEN_KEY)
  localStorage.removeItem(JELLYFIN_USER_ID_KEY)
  localStorage.removeItem(JELLYFIN_DEVICE_ID_KEY)
  console.log('Jellyfin API token, userId, and deviceId cleared from localStorage.')
}

/**
 * Saves the base64 encoded username and password to a cookie.
 * This is primarily used for auto-login on page refresh if the API token is not yet established.
 * @param {string} username - The user's Jellyfin username.
 * @param {string} password - The user's Jellyfin password.
 */
export function saveCredentials(username, password) {
  const encoded = btoa(`${username}:${password}`)
  // Store for 7 days. Adjust as needed.
  Cookies.set(AUTH_CREDENTIALS_KEY, encoded, { expires: 7 })
  console.log('User credentials saved to cookie.')
}

/**
 * Retrieves the username and password from the cookie.
 * @returns {{username: string, password: string}|null} An object containing username and password, or null if not found.
 */
export function getCredentials() {
  const encoded = Cookies.get(AUTH_CREDENTIALS_KEY)
  if (!encoded) return null

  try {
    const [username, password] = atob(encoded).split(':')
    console.log('User credentials retrieved from cookie.')
    return { username, password }
  } catch (e) {
    console.error('Error decoding user credentials from cookie:', e)
    return null
  }
}

/**
 * Clears the username and password from the cookie.
 */
export function clearCredentials() {
  Cookies.remove(AUTH_CREDENTIALS_KEY)
  console.log('User credentials cleared from cookie.')
}
