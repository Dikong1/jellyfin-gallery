<template>
  <q-page class="q-px-sm q-pt-none">
    <div class="row items-center q-mb-lg justify-between">
      <div class="col-auto">
        <q-btn
          flat
          round
          icon="arrow_back"
          class="back-btn"
          @click="$router.go(-1)"
          :class="$q.dark.isActive ? 'text-white' : 'text-black'"
        />
      </div>
      <div class="col text-center">
        <h4 class="q-mb-none">{{ docDetails?.Name || 'Документ' }}</h4>
        <div class="text-grey-7">
          <span v-if="docDetails?.DateCreated"> 📅 {{ formatDate(docDetails.DateCreated) }} </span>
        </div>
      </div>
      <div class="col-auto"></div>
    </div>

    <div v-if="loading" class="row items-center justify-center">
      <q-spinner size="50px" color="primary" />
    </div>

    <PDFViewer
      :source="url"
      :controls="controls"
      class="pdf-viewer"
      :filename="filename"
      zoom="175"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { format } from 'date-fns'
import PDFViewer from 'pdf-viewer-vue'

const route = useRoute()
const media = useMediaStore()
const loading = ref(true)
const docDetails = ref(null)
const url = ref('')
const controls = ref(['zoom', 'catalog', 'switchPage'])
const filename = ref('Документ')

const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd')

onMounted(async () => {
  try {
    const id = route.params.id
    docDetails.value = await media.fetchItemDetails(id)

    const downloadUrl = media.getDocumentUrl(id)

    url.value = downloadUrl
    filename.value = docDetails.value.Name || 'Документ'
  } catch (e) {
    console.error('Error loading PDF:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.pdf-frame {
  width: 100%;
  max-width: 1000px;
  height: 1200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 0 auto;
  background: #fff;
}

.pdf-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

canvas {
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 100%;
}

.pdf-viewer {
  width: 100%;
  max-width: 70vw;
  height: 90vh;
  justify-self: center;
}
</style>
