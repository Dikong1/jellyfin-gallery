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

    <!-- Infinite Scroll Documents -->
    <q-infinite-scroll @load="loadMore" :offset="100" :disable="noMoreItems">
      <!-- Grid View -->
      <div v-if="layout === 'grid'" class="row q-col-gutter-md">
        <div v-for="it in filteredItems" :key="it.Id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="hover-scale row no-wrap q-ma-xs"
            style="height: 150px"
            clickable
            @click="$router.push(`/document/${it.Id}`)"
          >
            <!-- Document cover -->
            <q-icon name="picture_as_pdf" color="red" size="80px" class="q-ma-sm" />

            <!-- Metadata -->
            <q-card-section
              class="column justify-between q-pa-sm"
              style="width: 60%; overflow: hidden"
            >
              <div class="text-subtitle2 ellipsis">{{ it.Name }}</div>

              <div class="text-caption text-grey-7 ellipsis-2-lines">
                {{ details[it.Id]?.Overview || 'Без описания' }}
                <q-tooltip
                  v-if="details[it.Id]?.Overview"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[0, 5]"
                  max-width="300px"
                >
                  {{ details[it.Id].Overview }}
                </q-tooltip>
              </div>

              <div v-if="details[it.Id]?.DateCreated" class="text-caption text-grey-6 q-mt-xs">
                <span>👁 {{ details[it.Id]?.UserData?.PlayCount || 0 }}</span>
                <span class="q-ml-sm"> 📅 {{ formatDate(details[it.Id].DateCreated) }} </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- List View -->
      <div v-else>
        <q-list :dark="$q.dark.isActive" bordered>
          <q-item
            v-for="it in filteredItems"
            :key="it.Id"
            clickable
            class="q-mb-md q-pa-md"
            style="min-height: 140px; border-radius: 12px; transition: box-shadow 0.2s"
            @click="$router.push(`/document/${it.Id}`)"
          >
            <q-item-section avatar top>
              <q-icon name="picture_as_pdf" color="red" size="80px" class="q-mx-auto" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 q-mb-xs">{{ it.Name }}</q-item-label>
              <q-item-label caption v-if="details[it.Id]?.Overview" class="text-body2 q-mb-xs">
                {{ details[it.Id].Overview }}
              </q-item-label>
              <div class="text-caption q-mt-xs">
                <span>👁 {{ details[it.Id]?.UserData?.PlayCount || 0 }}</span>
                <span v-if="details[it.Id]?.DateCreated" class="q-ml-sm">
                  📅 {{ formatDate(details[it.Id].DateCreated) }}
                </span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-infinite-scroll>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'
import { format } from 'date-fns'
import { fetchDetailsBatch } from 'src/utils/fetchDetailsBatch'

const props = defineProps({
  folderId: { type: String, required: false, default: null },
})

const media = useMediaStore()
const layout = ref('grid')
const allItems = ref([])
const details = ref({})
const loadedPages = ref(0)
const noMoreItems = ref(false)
const isFetchingMore = ref(false)

const filteredItems = computed(() => allItems.value)

onMounted(() => {
  console.log('Mounted DocumentPanel with folderId:', props.folderId)
})

watch(
  () => props.folderId,
  () => {
    allItems.value = []
    details.value = {}
    loadedPages.value = 0
    noMoreItems.value = false
  },
  { immediate: true },
)

function loadMore(index, done) {
  if (media.loading || noMoreItems.value) {
    done()
    return
  }

  isFetchingMore.value = true

  const nextPage = loadedPages.value + 1
  media
    .loadFolderItemsPaged(props.folderId, nextPage, media.perPage)
    .then((result) => {
      if (result.Items?.length) {
        allItems.value.push(...result.Items)
        loadedPages.value++

        if (allItems.value.length >= result.TotalRecordCount) {
          noMoreItems.value = true
        }

        return fetchDetailsBatch(result.Items).then((batch) => {
          if (batch) Object.assign(details.value, batch)
        })
      } else {
        done()
      }
    })
    .catch(console.error)
    .finally(() => {
      isFetchingMore.value = false
      done()
    })
}

const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd')
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
</style>
