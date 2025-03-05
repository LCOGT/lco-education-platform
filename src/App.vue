<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AboutView from './components/Views/AboutView.vue'
import { useUserDataStore } from './stores/userData'
import { useConfigurationStore } from './stores/configuration'

const showNavTabs = ref(false)
const route = useRoute()
const router = useRouter()

const userDataStore = useUserDataStore()
const username = computed(() => userDataStore.username)

const configurationStore = useConfigurationStore()
const loadedConfig = computed(() => configurationStore.isConfigLoaded)

function handleObserveClick () {
  showNavTabs.value = true
  router.push('/dashboard')
}

function logout () {
  userDataStore.username = ''
  userDataStore.authToken = ''
  userDataStore.profile = {}
  router.push('/login')
}

onMounted(async () => {
  try {
    const response = await fetch('/config/config.json')
    if (!response.ok) {
      throw Error('Failed to load configuration')
    }
    const config = await response.json()
    if (config) {
      configurationStore.observationPortalUrl = config.observationPortalUrl
      configurationStore.rtiBridgeUrl = config.rtiBridgeUrl
      configurationStore.thumbnailArchiveUrl = config.thumbnailArchiveUrl
      configurationStore.targetNameUrl = config.targetNameUrl
      configurationStore.datalabUrl = config.datalabUrl
      configurationStore.demo = config.demo
      configurationStore.isConfigLoaded = true
    }
  } catch (error) {
    console.error('Error loading configuration:', error)
  }
})

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      showNavTabs.value = false
    } else {
      showNavTabs.value = true
    }
  },
  { immediate: true }
)

</script>

<template>
  <template v-if="loadedConfig">
  <nav v-if="username" class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <img src="@/assets/ptr_logo.png" alt="Photon Ranch logo"/>
      </router-link>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <div class="dropdown is-hoverable">
          <div class="dropdown-trigger" style="display:flex;align-items:center;">
            <button class="button observe-site-menu is-normal" aria-haspopup="true" aria-controls="ptr-site-menu">
              <span>Observe</span>
              <span class="icon is-small">
                <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
              </span>
            </button>
          </div>
          <div id="ptr-site-menu" class="dropdown-menu"  role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item learn-site-item">Learn</a>
              <a href="#" class="dropdown-item datalab-site-item">Datalab</a>
            </div>
          </div>
        </div>
      </div>
      <div class="navbar-end">
        <router-link class="navbar-item" to="/dashboard">Dashboard</router-link>
        <router-link class="navbar-item" to="/book/realtime">Live Observing</router-link>
        <router-link class="navbar-item" to="/schedule">Schedule</router-link>
        <router-link class="navbar-item" to="/images">Images</router-link>
        <div class="buttons">
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">{{ username }}</a>
            <div class="navbar-dropdown">
            <a class="navbar-item" @click="logout">Log Out</a>
          </div>
        </div>
          <router-link class="navbar-item button red-bg" to="/login" v-if="!username">Login</router-link>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="!showNavTabs">
    <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else>
    <router-view/>
  </div>
</template>
</template>
