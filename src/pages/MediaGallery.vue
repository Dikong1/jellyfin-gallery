<template>
  <div class="q-pa-md">
    <q-input v-model="username" label="Username" outlined class="q-mb-sm" />
    <q-input v-model="password" type="password" label="Password" outlined class="q-mb-md" />
    <q-btn :loading="media.loading" label="Войти" @click="login" color="primary" class="q-mb-md" />
    <q-banner v-if="media.error" dense class="bg-red text-white q-mb-md">{{
      media.error
    }}</q-banner>

    <div class="q-mb-md">
      <q-btn
        v-for="v in media.views"
        :key="v.Id"
        :label="v.Name"
        @click="selectView(v.Id)"
        class="q-mr-sm q-mb-sm"
        color="secondary"
      />
    </div>

    <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3" v-for="it in media.items" :key="it.Id">
      <q-card clickable @click="openVideo(it.Id)">
        <q-img :src="media.getImageUrl(it)" :alt="it.Name" ratio="16/9" />
        <q-card-section class="text-subtitle1">
          {{ it.Name }}
        </q-card-section>
      </q-card>
    </div>
  </div>

  <video v-if="selectedVideoUrl" :src="selectedVideoUrl" controls class="q-mt-md full-width" />
</template>

<script setup>
import { ref } from 'vue'
import { useMediaStore } from 'src/stores/useMediaStore'

const username = ref('')
const password = ref('')
const media = useMediaStore()
const selectedVideoUrl = ref(null)

function login() {
  media.login(username.value, password.value)
}

function selectView(viewId) {
  media.selectView(viewId)
}

function openVideo(id) {
  selectedVideoUrl.value = media.getStreamUrl(id)
}
</script>
