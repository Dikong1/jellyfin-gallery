<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal class="bg-primary text-white">
      <q-toolbar class="q-px-md q-pt-sm">
        <q-btn flat round dense icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bold">Jellyfin {{ $t('gallery') }}</q-toolbar-title>

        <q-space />
        <q-btn
          @click="switchLanguage('en-US')"
          label="ENG"
          class="q-mr-sm q-pa-xs"
          :color="locale.value === 'en-US' ? 'primary' : 'secondary'"
          style="min-width: 70px"
        />
        <q-btn
          @click="switchLanguage('ru-RU')"
          label="РУС"
          class="q-pa-xs"
          :color="locale.value === 'ru-RU' ? 'primary' : 'secondary'"
          style="min-width: 70px"
        />

        <!-- <q-btn dense round flat icon="search" @click="toSearch" /> -->

        <q-toggle
          v-model="$q.dark.isActive"
          checked-icon="dark_mode"
          unchecked-icon="light_mode"
          class="q-mr-md"
          size="sm"
          :label="$q.dark.isActive ? $t('darkMode.dark') : $t('darkMode.light')"
          style="min-width: 100px"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      ovevrlay
      behavior="mobile"
      :class="$q.dark.isActive ? 'bg-secondary text-white' : 'bg-white text-black'"
    >
      <q-list padding :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        <q-item-label header :class="$q.dark.isActive ? 'text-grey-4' : 'bg-white text-black'">{{
          $t('menu.navigation')
        }}</q-item-label>

        <q-item clickable v-ripple to="/gallery" exact class="text-grey-4">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>{{ $t('menu.home') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div v-if="media.error" class="q-pa-md text-red text-center">
        {{ media.error }}
      </div>
      <router-view v-else v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :search="search" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
// import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useMediaStore } from 'src/stores/useMediaStore'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
// const router = useRouter()
const media = useMediaStore()

const leftDrawerOpen = ref(false)
const search = ref('')
const { locale } = useI18n()

onMounted(async () => {
  const dark = localStorage.getItem('dark')
  if (dark === null || dark === 'true') $q.dark.set(true)

  try {
    await media.initialize()
  } catch (error) {
    console.error('Failed to initialize application:', error)
  }
})

watch(
  () => $q.dark.isActive,
  (val) => {
    localStorage.setItem('dark', val)
  },
)

// function toSearch() {
//   router.push({ name: 'search' })
// }

function switchLanguage(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>
