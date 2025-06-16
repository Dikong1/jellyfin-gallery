<template>
  <div class="q-pa-md">
    <!-- Error Banner -->
    <q-banner v-if="media.error" dense class="bg-red text-white q-mb-md">
      {{ media.error }}
    </q-banner>

    <!-- Layout Toggle -->
    <q-btn-toggle
      v-model="layout"
      toggle-color="primary"
      class="q-mb-md"
      :options="[
        { label: 'Grid', value: 'grid', icon: 'grid_view' },
        { label: 'List', value: 'list', icon: 'view_list' },
      ]"
    />

    <!-- Search Bar -->
    <q-input v-model="search" label="Search videos..." dense debounce="300" class="q-mb-md" />

    <!-- Views Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="v in media.views.Items" :key="v.Id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="hover-scale" clickable @click="selectView(v.Id)">
          <q-card-section class="text-h6 text-center">
            <q-icon name="folder" size="lg" class="q-mb-sm" />
            {{ v.Name }}
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pagination Control -->
    <q-pagination
      v-if="pageCount > 1"
      v-model="page"
      :max="pageCount"
      max-pages="5"
      boundary-numbers
      direction-links
      class="q-mb-md"
      color="primary"
    />

    <!-- Media Items Display -->
    <div v-if="media.loading">
      <q-skeleton type="rect" height="200px" v-for="i in 6" :key="i" class="q-mb-md" />
    </div>

    <div v-if="layout === 'grid'" class="row q-col-gutter-md">
      <div v-for="it in pagedItems" :key="it.Id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="hover-scale" clickable @click="openVideo(it.Id)">
          <div style="position: relative">
            <img
              :src="media.getImageUrl(it)"
              :alt="it.Name"
              class="full-width"
              style="aspect-ratio: 16 / 9; object-fit: cover"
            />
            <div class="absolute-bottom q-pa-sm text-white bg-black bg-opacity-50">
              <q-icon name="play_circle" size="24px" class="q-mr-sm" />
              {{ it.Name }}
            </div>
            <q-linear-progress
              v-if="hasSavedProgress(it.Id)"
              :value="getSavedProgress(it.Id)"
              color="accent"
              size="xs"
              class="absolute-bottom"
            />
          </div>
        </q-card>
      </div>
    </div>

    <div v-else>
      <q-list bordered>
        <q-item v-for="it in pagedItems" :key="it.Id" clickable @click="openVideo(it.Id)">
          <q-item-section avatar>
            <img
              :src="media.getImageUrl(it)"
              :alt="it.Name"
              class="full-width"
              style="aspect-ratio: 16 / 9; object-fit: cover; max-width: 120px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ it.Name }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="hasSavedProgress(it.Id)">
            <q-linear-progress :value="getSavedProgress(it.Id)" color="accent" size="xs" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Fullscreen Video Player -->
    <div v-if="selectedVideoUrl" class="fullscreen-video-wrapper">
      <video
        ref="videoRef"
        :src="selectedVideoUrl"
        id="fullscreen-player"
        controls
        autoplay
        @volumechange="handleVolumeChange"
        @timeupdate="saveProgress"
        class="fullscreen-video"
      />
      <q-btn icon="close" color="negative" round class="close-button" @click="closeVideo" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'
import { useRouter } from 'vue-router'
import { getAuth, clearAuth } from 'src/utils/auth'

const router = useRouter()

const search = ref('')
const layout = ref('grid')
const selectedVideoUrl = ref(null)
const selectedVideoId = ref(null)
const media = useMediaStore()
const videoRef = ref(null)

const page = ref(1)
const perPage = 8

const VOLUME_KEY = 'jellyfin-player-volume'
const PROGRESS_KEY = (id) => `jellyfin-progress-${id}`

function selectView(viewId) {
  media.selectView(viewId)
  page.value = 1 // reset page on view change
}

function openVideo(id) {
  selectedVideoId.value = id
  selectedVideoUrl.value = media.getStreamUrl(id)
  const resume = Number(localStorage.getItem(PROGRESS_KEY(id))) || 0

  nextTick(() => {
    const video = videoRef.value
    if (video) {
      const storedVolume = localStorage.getItem(VOLUME_KEY)
      if (storedVolume !== null) video.volume = Number(storedVolume)
      video.currentTime = resume
      video.play()
      if (video.requestFullscreen) video.requestFullscreen()
    }
  })
}

function closeVideo() {
  const video = videoRef.value
  if (video) {
    video.pause()
    saveProgress()
    video.src = ''
  }
  selectedVideoUrl.value = null
  selectedVideoId.value = null
  if (document.fullscreenElement) document.exitFullscreen()
}

function saveProgress() {
  const video = videoRef.value
  if (video && selectedVideoId.value) {
    localStorage.setItem(PROGRESS_KEY(selectedVideoId.value), Math.floor(video.currentTime))
  }
}

function handleVolumeChange() {
  const video = videoRef.value
  if (video) {
    localStorage.setItem(VOLUME_KEY, video.volume.toString())
  }
}

function hasSavedProgress(id) {
  return !!localStorage.getItem(PROGRESS_KEY(id))
}

function getSavedProgress(id) {
  const seconds = Number(localStorage.getItem(PROGRESS_KEY(id))) || 0
  return Math.min(seconds / 3600, 1)
}

const filteredItems = computed(() => {
  return media.items.filter((item) => item.Name.toLowerCase().includes(search.value.toLowerCase()))
})

const pageCount = computed(() => Math.ceil(filteredItems.value.length / perPage))
const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredItems.value.slice(start, start + perPage)
})

function handleKeyboard(e) {
  const video = videoRef.value
  if (!video) return

  if (e.code === 'Space') {
    e.preventDefault()
    video.paused ? video.play() : video.pause()
  } else if (e.code === 'Escape') {
    closeVideo()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeyboard)

  const creds = getAuth()
  if (!creds) return router.push('/auth')

  try {
    await media.login(creds.username, creds.password)
  } catch {
    clearAuth()
    router.push('/auth')
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.fullscreen-video-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}

.close-button {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10000;
}

.hover-scale:hover {
  transform: scale(1.02);
  transition: transform 0.2s;
}
</style>
