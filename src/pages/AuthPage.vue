<template>
  <q-page class="q-pa-md flex flex-center column q-gutter-md">
    <q-card
      class="q-pa-lg shadow-3 rounded-borders"
      :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-white'"
      style="width: 320px"
    >
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="56px" class="q-mb-sm">
          <q-icon name="photo_album" />
        </q-avatar>
        <div class="text-h6">{{ $t('welcome') }}</div>
        <div class="text-caption text-grey-7">{{ $t('signIn') }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md q-pt-md">
        <q-input v-model="username" :label="$t('username')" filled :dark="$q.dark.isActive" />
        <q-input
          v-model="password"
          type="password"
          :label="$t('password')"
          filled
          :dark="$q.dark.isActive"
        />
        <q-btn
          :loading="media.loading"
          :label="$t('login')"
          color="primary"
          unelevated
          class="full-width"
          @click="login"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from 'src/stores/useMediaStore'
import { saveAuth } from 'src/utils/auth'

const router = useRouter()
const media = useMediaStore()

const username = ref('')
const password = ref('')

async function login() {
  try {
    await media.login(username.value, password.value)
    saveAuth(username.value, password.value)
    router.push('/gallery')
  } catch (err) {
    media.error.value = 'Login failed: ' + (err.message ? `: ${err.message}` : '')
    console.error('Login error: ', err)
  }
}
</script>
