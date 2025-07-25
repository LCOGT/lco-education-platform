<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchApiCall } from '../../utils/api'
import { useUserDataStore } from '../../stores/userData'
import { useConfigurationStore } from '../../stores/configuration'
import { useProposalStore } from '../../stores/proposalManagement'

const userDataStore = useUserDataStore()
const configurationStore = useConfigurationStore()
const proposalStore = useProposalStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const observationPortalUrl = configurationStore.observationPortalUrl

const storeAPIToken = async (data) => {
  const authToken = data.token
  if (authToken) {
    userDataStore.authToken = authToken
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${authToken}`
    }
    await fetchApiCall({ url: observationPortalUrl + 'profile/', method: 'GET', header: headers, successCallback: storeUser, failCallback: () => { errorMessage.value = 'Failed to retrieve user profile' } })
  }
}

const storeUser = (user) => {
  userDataStore.username = user.username
  userDataStore.profile = user
  proposalStore.fetchProposals()
  userDataStore.lastLoginTime = Date.now()
  router.push('/dashboard')
}

const login = async () => {
  errorMessage.value = ''
  userDataStore.$patch({
    username: '',
    authToken: '',
    profile: Object.create(null),
    lastLoginTime: null
  })
  const requestBody = {
    username: username.value,
    password: password.value
  }
  // store an auth token from login credentials
  await fetchApiCall({ url: observationPortalUrl + 'api-token-auth/', method: 'POST', body: requestBody, successCallback: storeAPIToken, failCallback: () => { errorMessage.value = 'Failed to authenticate user' } })
}

onMounted(() => {
  userDataStore.$patch({
    username: '',
    authToken: '',
    profile: Object.create(null),
    lastLoginTime: null
  })
})
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
        <p v-if="errorMessage">{{ errorMessage }}</p>
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
