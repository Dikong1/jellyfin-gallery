<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-primary text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          v-if="showDrawer"
        />
        <q-avatar square class="q-ml-sm">
          <q-icon name="photo_album" />
        </q-avatar>
        <q-toolbar-title>Jellyfin Gallery</q-toolbar-title>
        <q-space />
        <q-toggle
          v-model="$q.dark.isActive"
          checked-icon="dark_mode"
          unchecked-icon="light_mode"
          class="q-ml-md"
          size="sm"
          :label="$q.dark.isActive ? 'Dark' : 'Light'"
          dense
        />
        <q-btn v-if="showDrawer" flat icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="showDrawer"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-white text-black'"
    >
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        <q-item to="/gallery" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="photo_library" />
          </q-item-section>
          <q-item-section>Галерея</q-item-section>
        </q-item>

        <q-item-label header>Views</q-item-label>
        <q-item
          v-for="view in media.views.Items"
          :key="view.Id"
          clickable
          v-ripple
          :to="`/view/${view.Id}`"
        >
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>{{ view.Name }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { getAuth, clearAuth } from 'src/utils/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const leftDrawerOpen = ref(false)
const media = useMediaStore()
const router = useRouter()
const route = useRoute()

const showDrawer = computed(() => route.path !== '/auth')

onMounted(async () => {
  const saved = localStorage.getItem('dark')
  $q.dark.set(saved !== 'false')

  const auth = getAuth()
  if (!auth && route.path !== '/auth') return router.push('/auth')

  try {
    if (auth) await media.login(auth.username, auth.password)
  } catch {
    clearAuth()
    router.push('/auth')
  }
})

watch(
  () => $q.dark.isActive,
  (val) => {
    localStorage.setItem('dark', val)
  },
)

function logout() {
  clearAuth()
  router.push('/auth')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
