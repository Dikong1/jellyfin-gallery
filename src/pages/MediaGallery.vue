<template>
  <div
    class="q-pt-none q-pb-md"
    :class="$q.dark.isActive ? 'bg-secondary text-white' : 'bg-white text-black'"
  >
    <q-tabs
      v-model="activeTab"
      dense
      class="bg-primary text-grey q-mt-none q-mb-md"
      active-color="white"
      indicator-color="transparent"
      align="center"
    >
      <q-tab class="tab" name="homevideos" icon="movie" label="Видео" />
      <q-tab class="tab" name="photos" icon="image" label="Фото"></q-tab>
      <q-tab class="tab" name="books" icon="picture_as_pdf" label="Документы" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="q-px-md">
      <q-tab-panel name="homevideos">
        <MediaContentPanel :folder-id="homeVideosId" />
      </q-tab-panel>
      <q-tab-panel name="photos">
        <PhotosPanel :folder-id="photosId" />
      </q-tab-panel>
      <q-tab-panel name="books">
        <DocumentsPanel :folder-id="booksId" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { getAuth, clearAuth } from 'src/utils/auth'
import MediaContentPanel from '../components/MediaContentPanel.vue'
import DocumentsPanel from '../components/DocumentsPanel.vue'
import PhotosPanel from '../components/PhotosPanel.vue'

const router = useRouter()
const media = useMediaStore()
const activeTab = ref('homevideos')

const homeVideosId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'homevideos')?.Id || null,
  console.log('Home videos ID:', media.views.Items),
)
const photosId = computed(() => {
  const items = media.views.Items?.filter((v) => v.CollectionType === 'homevideos') || []
  return items[1]?.Id || null
})
const booksId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'books')?.Id || null,
)

onMounted(async () => {
  const creds = getAuth()
  if (!creds) return router.push('/auth')

  try {
    await media.login(creds.username, creds.password)
  } catch (err) {
    clearAuth()
    router.push('/auth')
    console.error('Login failed:', err)
  }
})
</script>

<style scoped>
.tab:hover {
  color: #00a4dc !important;
  background-color: inherit !important;
}
</style>
