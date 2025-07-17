<template>
  <q-page class="q-pa-md row q-gutter-md">
    <div class="col-8">
      <q-card flat>
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

    <div class="col q-pt-md">
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
            <q-item-label caption v-if="details[item.Id]?.DateCreated">
              📅 {{ formatDate(details[item.Id].DateCreated) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { format } from 'date-fns'
import { fetchDetailsBatch } from 'src/utils/fetchDetailsBatch'

const route = useRoute()
const videoRef = ref(null)
const media = useMediaStore()

const videoId = ref(route.params.id)
const videoData = ref(null)
const relatedItems = ref([])
const details = ref({})
let playMarked = false

const VOLUME_KEY = 'jellyfin-player-volume'
const PROGRESS_KEY = (id) => `jellyfin-progress-${id}`

async function loadVideo(id) {
  playMarked = false
  const item = await media.fetchItemDetails(id)
  videoData.value = item

  if (item?.ParentId) {
    const result = await media.loadFolderItemsPaged(item.ParentId, 1, 20)
    relatedItems.value = result.Items.filter((i) => i.Id !== id)
    // Fetch details for related items
    details.value = await fetchDetailsBatch(relatedItems.value)
    console.log('Related items:', relatedItems.value)
    console.log('Details map:', details.value)
  }

  await nextTick()
  const video = videoRef.value
  if (video) {
    const resume = Number(localStorage.getItem(PROGRESS_KEY(id))) || 0
    const storedVolume = +localStorage.getItem(VOLUME_KEY)
    if (!isNaN(storedVolume)) video.volume = storedVolume
    video.currentTime = resume
    video.load()
  }
}

onMounted(() => {
  loadVideo(videoId.value)
})

watch(
  () => route.params.id,
  (newId) => {
    videoId.value = newId
    loadVideo(newId)
  },
)

async function markAsPlayed() {
  if (playMarked) return
  playMarked = true
  await media.updateUserData(videoId.value, {
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
    localStorage.setItem(PROGRESS_KEY(videoId.value), Math.floor(video.currentTime))
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
