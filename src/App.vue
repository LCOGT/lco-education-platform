<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AboutView from './components/Views/AboutView.vue'
import { useUserDataStore } from './stores/userData'
import { useConfigurationStore } from './stores/configuration'
import { useIntervalFn } from '@vueuse/core'

const showNavTabs = ref(false)
const route = useRoute()
const router = useRouter()

const userDataStore = useUserDataStore()
const username = computed(() => userDataStore.username)

const configurationStore = useConfigurationStore()
const loadedConfig = computed(() => configurationStore.isConfigLoaded)
const isMobileMenuOpen = ref(false)
const isActive = ref('')
const navBurger = ref('navbar-burger')
const navMenu = ref('navbar-menu')

function handleObserveClick () {
  showNavTabs.value = true
  router.push('/dashboard')
}

const sevenDays = 7 * 24 * 60 * 60 * 1000
const checkAutoLogout = () => {
  const lastLoginTime = userDataStore.lastLoginTime
  if (lastLoginTime && Date.now() - lastLoginTime > sevenDays) {
    logout()
  }
}
// Check for auto logout every hour
useIntervalFn(checkAutoLogout, 60 * 60 * 1000)

function logout () {
  userDataStore.$patch({
    username: '',
    authToken: '',
    profile: {},
    lastLoginTime: null
  })
  router.push('/login')
}

function toggleMobileMenu () {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isActive.value === 'is-active') {
    isActive.value = ''
  } else {
    isActive.value = 'is-active'
  }
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
      configurationStore.neoexchangeUrl = config.neoexchangeUrl
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
      <a role="button" aria-label="menu" aria-expanded="false" :class="[isActive, navBurger]" @click="toggleMobileMenu">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div :class="[isActive, navMenu]">
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link observe-site-menu is-normal">
              Explore
            </a>
            <div class="navbar-dropdown">
              <a href="https://learn.lco.global" class="navbar-item learn-site-item" >
              <span>Learn</span>
              <span class="icon is-small">
                <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
              </span></a>
              <a href="https://datalab.lco.global" class="navbar-item datalab-site-item">
              <span>DataLab</span>
              <span class="icon is-small">
                <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
              </span></a>
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
