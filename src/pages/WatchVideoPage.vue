<template>
  <q-page class="q-pa-md row q-gutter-md">
    <div class="col-12 col-md-8">
      <q-card flat bordered>
        <q-card-section>
          <video
            ref="videoRef"
            :src="media.getStreamUrl(videoId)"
            controls
            autoplay
            @timeupdate="saveProgress"
            @volumechange="saveVolume"
            @play="markAsPlayed"
            class="full-width"
            style="max-height: 500px"
          />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">{{ videoData?.Name }}</div>
          <div class="text-caption text-grey">
            ▶ {{ videoData?.UserData?.PlayCount + 1 || 1 }} views · 📅
            {{ formatDate(videoData?.DateCreated) }}
          </div>
          <div class="q-mt-sm">{{ videoData?.Overview }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-4">
      <q-list>
        <q-item
          v-for="item in relatedItems"
          :key="item.Id"
          clickable
          v-ripple
          :to="`/watch/${item.Id}`"
        >
          <q-item-section avatar>
            <q-img :src="media.getImageUrl(item)" style="width: 120px; aspect-ratio: 16/9" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.Name }}</q-item-label>
            <q-item-label caption>{{ item.Overview?.slice(0, 80) }}...</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { format } from 'date-fns'

const route = useRoute()
const videoId = route.params.id
const videoRef = ref(null)
const media = useMediaStore()

const videoData = ref(null)
const relatedItems = ref([])
let playMarked = false

const VOLUME_KEY = 'jellyfin-player-volume'
const PROGRESS_KEY = (id) => `jellyfin-progress-${id}`

onMounted(async () => {
  const item = await media.fetchItemDetails(videoId)
  videoData.value = item

  // Optionally fetch related videos from same folder
  if (item?.ParentId) {
    const result = await media.loadFolderItemsPaged(item.ParentId, 1, 20)
    relatedItems.value = result.Items.filter((i) => i.Id !== videoId)
  }

  // Resume position
  const video = videoRef.value
  if (video) {
    const resume = Number(localStorage.getItem(PROGRESS_KEY(videoId))) || 0
    const storedVolume = +localStorage.getItem(VOLUME_KEY)
    if (!isNaN(storedVolume)) video.volume = storedVolume
    video.currentTime = resume
  }
})

async function markAsPlayed() {
  if (playMarked) return
  playMarked = true
  await media.updateUserData(videoId, {
    Played: true,
    PlayCount: (videoData.value?.UserData?.PlayCount || 0) + 1,
    LastPlayedDate: new Date().toISOString(),
    PlaybackPositionTicks: 0,
    PlayedPercentage: 0,
    UnplayedItemCount: 0,
    Rating: 0,
    IsFavorite: false,
    Likes: false,
  })
}

function saveProgress() {
  const video = videoRef.value
  if (video) {
    localStorage.setItem(PROGRESS_KEY(videoId), Math.floor(video.currentTime))
  }
}

function saveVolume() {
  const video = videoRef.value
  if (video) {
    localStorage.setItem(VOLUME_KEY, video.volume.toString())
  }
}

function formatDate(date) {
  return date ? format(new Date(date), 'yyyy-MM-dd') : ''
}
</script>
