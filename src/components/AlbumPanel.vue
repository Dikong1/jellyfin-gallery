<template>
  <q-page>
    <q-breadcrumbs
      class="q-mb-md"
      color="white"
      :class="$q.dark.isActive ? 'text-white' : 'text-black'"
    >
      <q-breadcrumbs-el label="Альбомы" icon="photo_album" />
      <q-breadcrumbs-el v-if="selectedViewId" label="Альбом" />
    </q-breadcrumbs>

    <div v-if="!selectedViewId" class="row q-col-gutter-md q-mb-md">
      <div v-for="v in filteredViews" :key="v.Id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="hover-scale" clickable @click="selectView(v.Id)">
          <q-img :src="media.getImageUrl(v)" :alt="v.Name" class="rounded-borders" />
        </q-card>
      </div>
    </div>
    <div v-else>
      <q-btn flat icon="arrow_back" @click="goBack" class="q-mb-md" />
      <PhotosPanel :folderId="selectedViewId" />
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'
import PhotosPanel from '../components/PhotosPanel.vue'

const media = useMediaStore()
const filteredViews = ref([])
const selectedViewId = ref()

onMounted(() => {
  filteredViews.value = media.views.Items.filter((v) => v.CollectionType === 'homevideos')
})

const selectView = (id) => {
  selectedViewId.value = id
}

const goBack = () => {
  selectedViewId.value = null
}
</script>
