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

const apiUrl = 'http://observation-portal-dev.lco.gtn/api/'

const storeToken = async (data) => {
  const authToken = data.token
  if (authToken) {
    userDataStore.authToken = authToken
    await fetchApiCall({ url: apiUrl + 'profile/', method: 'GET', successCallback: storeUser, failCallback: () => { errorMessage.value = 'Failed to authenticate user' } })
  }
}

const storeUser = (user) => {
  userDataStore.username = username.value
  userDataStore.profile = user
  router.push('/dashboard')
}

const login = async () => {
  const requestBody = {
    username: username.value,
    password: password.value
  }
  // store an auth token from login credentials
  await fetchApiCall({ url: apiUrl + 'api-token-auth/', method: 'POST', body: requestBody, successCallback: storeToken, failCallback: () => { errorMessage.value = 'Failed to authenticate user' } })
}
</script>

<template>
    <section class="section">
      <div class="container">
      <h1>Login</h1>
    <div class="card">
  <div class="card-content">
    <div class="content">
      <form @submit.prevent="login">

        <div class="field">
          <label class="label">Username</label>
          <div class="control has-icons-left has-icons-right">
            <input type="text" id="username" v-model="username" class="input" required>
            <span class="icon is-small is-left">
              <i class="fas fa-user"></i>
            </span>
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control has-icons-left has-icons-right">
            <input type="password" id="password" v-model="password" class="input" required>
            <span class="icon is-small is-left">
                <i class="fa-sharp fa-solid fa-key"></i>
            </span>
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <input type="submit" id="login-btn" class="button is-link" value="Log me in">
          </div>
          <div class="control">
            <button class="button is-link is-light">Cancel</button>
          </div>
        </div>
        <p class="small">By logging in, you agree to <a href="https://lco.global/observatory/termsofservice/" target="_blank">the Las Cumbres Observatory terms of use</a>.</p>
      </form>

    </div>
  </div>
</div>
</div>
</section>
</template>
