import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { clearAuth } from 'src/utils/auth'
import router from 'src/router'

const api = axios.create({
  baseURL: 'http://localhost:8096',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      router.push('/auth')
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { axios, api }
