<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal class="bg-primary text-white">
      <q-toolbar class="q-px-md q-pt-sm">
        <q-btn flat round dense icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bold">Jellyfin {{ $t('gallery') }}</q-toolbar-title>

        <q-space />
        <q-btn @click="switchLanguage('en-US')" label="ENG" class="q-mr-sm q-pa-xs"
               :color="locale.value === 'en-US' ? 'primary' : 'secondary'"
               style="min-width: 70px;"/>
        <q-btn @click="switchLanguage('ru-RU')" label="РУС" class="q-pa-xs"
               :color="locale.value === 'ru-RU' ? 'primary' : 'secondary'" style="min-width: 70px;"/>


        <q-btn dense round flat icon="search" @click="toSearch" />

        <q-toggle
          v-model="$q.dark.isActive"
          checked-icon="dark_mode"
          unchecked-icon="light_mode"
          class="q-mr-md"
          size="sm"
          :label="$q.dark.isActive ? $t('darkMode.dark') : $t('darkMode.light')"
          style="min-width: 100px;"
        />

        <q-btn dense round flat icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      ovevrlay
      behavior="mobile"
      :class="$q.dark.isActive ? 'bg-secondary text-white' : 'bg-white text-black'"
    >
      <q-list padding :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        <q-item-label header :class="$q.dark.isActive ? 'text-grey-4' : 'bg-white text-black'"
        >{{  $t('menu.navigation')  }}</q-item-label
        >

        <q-item clickable v-ripple to="/gallery" exact class="text-grey-4">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>{{  $t('menu.home')  }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :search="search" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { getAuth, clearAuth } from 'src/utils/auth'
import { useMediaStore } from 'src/stores/useMediaStore'
import { useI18n } from 'vue-i18n';

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const media = useMediaStore()

const leftDrawerOpen = ref(false)
const search = ref('')
const isAuthPage = ref(route.path === '/auth')
const { locale } = useI18n();

watch(
  () => route.path,
  (val) => {
    isAuthPage.value = val === '/auth'
  },
)

onMounted(async () => {
  const dark = localStorage.getItem('dark')
  if (dark === null || dark === 'true') $q.dark.set(true)

  const auth = getAuth()
  if (!auth && route.path !== '/auth') {
    return router.push('/auth')
  }

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

function toSearch() {
  router.push({ name: 'search' });
}


function logout() {
  clearAuth()
  router.push('/auth')
}
function switchLanguage(lang) {
  locale.value = lang;
  localStorage.setItem('lang', lang);
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
