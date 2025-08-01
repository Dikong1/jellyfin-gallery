<template>
  <div
    class="q-pt-none q-pb-md"
    :class="$q.dark.isActive ? 'bg-secondary text-white' : 'bg-white text-black'"
  >
    <q-tabs
      v-model="activeTab"
      dense
      inline-label
      class="bg-primary text-grey q-mt-none q-mb-xs"
      active-color="white"
      indicator-color="transparent"
      align="center"
      @update:model-value="handleTab"
    >
      <q-tab class="tab" name="videos" icon="movie" :label="$t('video')" />
      <q-tab class="tab" name="photos" icon="image" :label="$t('photos')" />
      <q-tab class="tab" name="books" icon="picture_as_pdf" :label="$t('books')" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" keep-alive swipeable animated class="q-px-md">
      <q-tab-panel name="videos">
        <VideoPanel :folder-id="homeVideosId" />
      </q-tab-panel>
      <q-tab-panel name="photos">
        <AlbumPanel />
      </q-tab-panel>
      <q-tab-panel name="books">
        <DocumentsPanel :folder-id="booksId" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'
import VideoPanel from '../components/VideoPanel.vue'
import DocumentsPanel from '../components/DocumentsPanel.vue'
import AlbumPanel from '../components/AlbumPanel.vue'

const media = useMediaStore()
const activeTab = ref(media.getActiveTab())

const homeVideosId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'movies')?.Id || null,
)

const booksId = computed(
  () => media.views.Items?.find((v) => v.CollectionType === 'books')?.Id || null,
)

function handleTab(tab) {
  media.setActiveTab(tab)
  activeTab.value = tab
}
</script>

<style scoped>
.tab:hover {
  color: #00a4dc !important;
  background-color: inherit !important;
}
</style>
