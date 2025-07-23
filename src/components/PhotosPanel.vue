<template>
  <div>
    <!-- Layout Toggle -->
    <q-btn-toggle
      v-model="layout"
      toggle-color="primary"
      class="q-mb-md"
      :options="[
        { label: 'Сетка', value: 'grid', icon: 'grid_view' },
        { label: 'Список', value: 'list', icon: 'view_list' },
      ]"
    />

    <!-- Infinite Scroll -->
    <q-infinite-scroll @load="loadMore" :offset="100" :disable="noMoreItems">
      <!-- Grid View -->
      <div v-if="layout === 'grid'" class="row q-col-gutter-md">
        <div v-for="photo in allPhotos" :key="photo.Id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card class="hover-scale" clickable @click="openPhoto(photo)">
            <div class="photo-grid-img-wrapper">
              <img :src="media.getImageUrl(photo)" :alt="photo.name" class="photo-grid-img" />
            </div>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2 ellipsis">{{ photo.Name }}</div>
              <div class="text-caption text-grey-7 ellipsis-2-lines">
                {{ details[photo.Id]?.Overview || 'Без описания' }}
                <q-tooltip
                  v-if="details[photo.Id]?.Overview"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[0, 5]"
                  max-width="300px"
                >
                  {{ details[photo.Id].Overview }}
                </q-tooltip>
              </div>
              <div v-if="details[photo.Id]?.DateCreated" class="text-caption text-grey-6 q-mt-xs">
                <span>📅 {{ formatDate(details[photo.Id].DateCreated) }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- List View -->
      <div v-else>
        <q-list :dark="$q.dark.isActive" bordered>
          <q-item v-for="photo in allPhotos" :key="photo.Id" clickable @click="openPhoto(photo)">
            <q-item-section avatar>
              <q-img
                :src="media.getImageUrl(photo)"
                ratio="16/9"
                class="rounded-borders"
                style="max-width: 120px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 q-mb-xs">{{ photo.Name }}</q-item-label>
              <q-item-label caption v-if="details[photo.Id]?.Overview" class="text-body2 q-mb-xs">
                {{ details[photo.Id].Overview }}
              </q-item-label>
              <div class="text-caption q-mt-xs">
                <span v-if="details[photo.Id]?.DateCreated">
                  📅 {{ formatDate(details[photo.Id].DateCreated) }}
                </span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-infinite-scroll>

    <!-- Lightbox or modal for photo preview -->
    <q-dialog v-model="showDialog" backdrop-filter="blur(5px)">
      <img
        :src="selectedPhotoUrl"
        alt="Выбранное изображение"
        style="max-width: 90vw; max-height: 90vh"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'
import { format } from 'date-fns'
import { fetchDetailsBatch } from 'src/utils/fetchDetailsBatch'

const props = defineProps({
  folderId: { type: String, required: false, default: null },
})

const media = useMediaStore()
const layout = ref('grid')
const allPhotos = ref([])
const details = ref({})
const loadedPages = ref(0)
const noMoreItems = ref(false)
const showDialog = ref(false)
const selectedPhotoUrl = ref(null)
const isFetchingMore = ref(false)

onMounted(() => {
  console.log('Mounted PhotosPanel with folderId:', props.folderId)
})

watch(
  () => props.folderId,
  () => {
    allPhotos.value = []
    details.value = {}
    loadedPages.value = 0
    noMoreItems.value = false
  },
  { immediate: true },
)

function formatDate(date) {
  return format(new Date(date), 'yyyy-MM-dd')
}

async function loadMore(index, done) {
  if (media.loading || noMoreItems.value) {
    done()
    return
  }

  isFetchingMore.value = true

  const nextPage = loadedPages.value + 1

  try {
    const result = await media.loadFolderItemsPaged(props.folderId, nextPage, media.perPage)

    if (result.Items?.length) {
      allPhotos.value.push(...result.Items)
      loadedPages.value++

      if (allPhotos.value.length >= result.TotalRecordCount) {
        noMoreItems.value = true
      }

      const batch = await fetchDetailsBatch(result.Items)
      if (batch) {
        Object.assign(details.value, batch)
      }
    } else {
      noMoreItems.value = true
    }
  } catch (error) {
    console.error('Error loading folder items:', error)
  } finally {
    isFetchingMore.value = false
    done()
  }
}

function openPhoto(photo) {
  selectedPhotoUrl.value = media.getImageUrl(photo)
  showDialog.value = true
}
</script>

<style scoped>
.hover-scale:hover {
  transform: scale(1.02);
  transition: transform 0.2s;
}

.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-grid-img-wrapper {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  overflow: hidden;
}

.photo-grid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
