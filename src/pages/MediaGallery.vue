<template>
  <div
    class="q-pt-none q-pb-md"
    :class="$q.dark.isActive ? 'bg-secondary text-white' : 'bg-white text-black'"
  >
    <q-tabs
      v-model="activeTab"
      dense
      class="bg-primary text-white q-mt-none q-mb-md"
      active-color="white"
      indicator-color="white"
      align="center"
    >
      <q-tab name="homevideos" icon="movie" label="Видео" />
      <q-tab name="books" icon="picture_as_pdf" label="Документы" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="q-px-md">
      <q-tab-panel name="homevideos">
        <component :is="mediaPanel" :folder-id="homeVideosId" />
      </q-tab-panel>
      <q-tab-panel name="books">
        <component :is="mediaPanel" :folder-id="booksId" />
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

const router = useRouter()
const media = useMediaStore()
const activeTab = ref('homevideos')

const homeVideosId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'homevideos')?.Id || null,
)
const booksId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'books')?.Id || null,
)

const mediaPanel = MediaContentPanel

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
