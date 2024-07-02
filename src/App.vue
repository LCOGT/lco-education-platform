<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AboutView from './components/Views/AboutView.vue'
import { useUserDataStore } from './stores/userData'

const showNavTabs = ref(false)
const route = useRoute()
const router = useRouter()

const userDataStore = useUserDataStore()
const username = userDataStore.username

function handleObserveClick () {
  showNavTabs.value = true
  router.push('/dashboard')
}

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
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <img src="@/assets/ptr_logo.png" alt="Kiosk logo"/>
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
        <!-- navbar items -->
      </div>
      <div class="navbar-end">
        <router-link class="navbar-item" to="/about">About</router-link>
        <router-link class="navbar-item" to="/learn">Learn</router-link>
        <router-link class="navbar-item" to="/observe">Observe</router-link>
        <router-link class="navbar-item" to="/datalab">DataLab</router-link>
        <div class="buttons">
          <router-link class="navbar-item button red-bg" to="/login" v-if="!username">Login</router-link>
          <span class="navbar-item" v-if="username">{{ username }}</span>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="!showNavTabs">
    <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else>
    <section class="hero">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-one-quarter">
            <h1>Observe  <FontAwesomeIcon icon="fa-solid fa-chevron-right" class="blue small" /></h1>
          </div>
          <div class="column">
            <div class="tabs is-left">
              <ul>
                <li><router-link to="/dashboard" class="is-active">Dashboard</router-link></li>
                <li><router-link to="/book/realtime">Book Real Time Observation</router-link></li>
                <li><router-link to="/schedule">Schedule</router-link></li>
                <li><router-link to="/images">Images</router-link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <router-view/>
  </div>
</template>
