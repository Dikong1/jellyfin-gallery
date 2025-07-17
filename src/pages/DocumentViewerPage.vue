<template>
  <q-page class="q-px-sm q-pt-none">
    <div v-if="loading" class="row items-center justify-center">
      <q-spinner size="50px" color="primary" />
    </div>

    <PDFViewer
      :source="url"
      :controls="controls"
      class="pdf-viewer"
      zoom="75"
      :filename="filename"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
// import { format } from 'date-fns'
import PDFViewer from 'pdf-viewer-vue'

const route = useRoute()
const media = useMediaStore()
const loading = ref(true)
const docDetails = ref(null)
const url = ref('')
const controls = ref(['zoom', 'catalog', 'switchPage'])
const filename = ref('document.pdf')

onMounted(async () => {
  try {
    const id = route.params.id
    docDetails.value = await media.fetchItemDetails(id)

    const downloadUrl = media.getDocumentUrl(id)

    url.value = downloadUrl + '&filename=' + encodeURIComponent(docDetails.value.Name) + '.pdf'
    console.log('PDF URL:', url.value)

    filename.value = docDetails.value.Name + '.pdf'
  } catch (e) {
    console.error('Error loading PDF:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
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
  width: 99vw;
  max-width: 100vw;
  height: 92vh;
  min-height: 600px;
  margin: 0 auto;
  display: block;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.03);
}
</style>
