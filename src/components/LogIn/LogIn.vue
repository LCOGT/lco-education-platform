<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchApiCall } from '../../utils/api'
import { useUserDataStore } from '../../stores/userData'

const userDataStore = useUserDataStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const apiUrl = 'https://observe.lco.global/api/'

const storeToken = async (data) => {
  console.log('storeToken', data)
  const authToken = data.token
  console.log('authToken', authToken)
  if (authToken) {
    userDataStore.authToken = authToken
    await fetchApiCall({ url: apiUrl + 'profile/', method: 'GET', successCallback: storeUser, failCallback: handleError })
  }
}

const handleError = (error) => {
  console.error('API call failed with error:', error)
  errorMessage.value = 'Failed to authenticate user'
}

const storeUser = (user) => {
  console.log('user', user)
  userDataStore.username = username.value
  userDataStore.profile = user
  router.push('/dashboard')
}

const login = async () => {
  console.log('here')
  const requestBody = {
    username: username.value,
    password: password.value
  }
  // store an auth token from login credentials
  await fetchApiCall({ url: apiUrl + 'api-token-auth/', method: 'POST', body: requestBody, successCallback: storeToken, failCallback: handleError })
}
</script>

<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
        <button type="submit">Log In</button>
      </form>
    </div>
  </template>
