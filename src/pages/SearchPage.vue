<template>
  <q-page
    class="q-pa-md"
    :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-dark'"
  >
    <q-separator spaced />
    <div class="text-h5 text-weight-medium q-mb-md">Медиа в {{ viewName || 'Галерее' }}</div>

    <!-- Поле для поиска -->
    <q-input
      v-model="searchQuery"
      label="Поиск"
      debounce="300"
      placeholder="Введите название для поиска..."
      class="q-mb-md"
    />

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

    <div class="row q-col-gutter-md">
      <div
        v-for="item in pagedItems"
        :key="item.Id"
        class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
      >
        <q-card class="hover-scale shadow-2" clickable @click="openVideo(item.Id)">
          <div style="position: relative">
            <img
              :src="media.getImageUrl(item)"
              :alt="item.Name || 'Media item image'"
              class="full-width"
              style="aspect-ratio: 16/9; object-fit: cover"
            />
            <div class="absolute-bottom bg-black bg-opacity-50 text-white q-pa-sm">
              <q-icon name="play_circle" class="q-mr-sm" />
              {{ item.Name }}
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!media.loading && items.length === 0"
      class="q-mt-lg text-center"
      :class="$q.dark.isActive ? 'bg-grey-8 text-white' : 'bg-grey-3 text-dark'"
    >
      <q-icon name="mood_bad" size="md" class="q-mb-sm" />
      <div>Не найдены элементы в плэйлисте</div>
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'

const route = useRoute()
const media = useMediaStore()

const items = ref([])
const page = ref(1)
const perPage = 8
const viewName = ref('')
const searchQuery = ref('')

const pageCount = computed(() => Math.ceil(filteredItems.value.length / perPage))


const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item =>
    item.Name.toLowerCase().includes(query)
  )
})


const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredItems.value.slice(start, start + perPage)
})

onMounted(async () => {
  const viewId = route.params.id
  const views = media.views.Items || []
  const selectedView = views.find((v) => v.Id === viewId)
  viewName.value = selectedView?.Name || 'Unknown View'

  items.value = await media.loadFolderItems(viewId)
})

function openVideo(id) {
  const url = media.getStreamUrl(id)
  window.open(url, '_blank')
}
</script>

<style scoped>
.tab:hover {
  color: #00a4dc !important;
  background-color: inherit !important;
}
</style>
