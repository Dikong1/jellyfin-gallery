<template>
  <q-page class="q-pa-md flex flex-center column q-gutter-md">
    <q-card class="q-pa-lg" style="width: 300px">
      <q-card-section class="text-h6">Login</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="username" label="Username" outlined />
        <q-input v-model="password" label="Password" type="password" outlined />
        <q-btn :loading="media.loading" label="Login" color="primary" @click="login" />
        <q-banner v-if="media.error" dense class="bg-red text-white">
          {{ media.error }}
        </q-banner>
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
    media.error = 'Login failed' + (err.message ? `: ${err.message}` : '')
    console.error('Login error:', err)
  }
}
</script>
