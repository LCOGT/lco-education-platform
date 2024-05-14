<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AboutView from './components/Views/AboutView.vue'
import HomeView from './components/Views/HomeView.vue'

const showNavTabs = ref(false)
const homeIsVisible = ref(true)

function handleObserveClick () {
  showNavTabs.value = true
}

function closeHomeView () {
  homeIsVisible.value = false
}

const route = useRoute()

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/dashboard') {
      showNavTabs.value = true
    } else {
      showNavTabs.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="@/assets/ptr_logo.png" alt="Kiosk logo"/>
      </a>
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
        <!-- change these links to actual links-->
        <router-link class="navbar-item" to="/about">About</router-link>
        <router-link class="navbar-item" to="/learn">Learn</router-link>
        <router-link class="navbar-item" to="/observe">Observe</router-link>
        <router-link class="navbar-item" to="/datalab">DataLab</router-link>
        <div class="buttons">
          <router-link class="navbar-item button red-bg" to="/login">Login</router-link>
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
                <li><router-link to="/realtime">Real Time</router-link></li>
                <li><router-link to="/schedule">Schedule</router-link></li>
                <li><router-link to="/images">Images</router-link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <HomeView v-if="homeIsVisible" @close="closeHomeView"/>
    <router-view/>
  </div>
</template>
