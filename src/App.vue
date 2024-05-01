<script setup>
import { ref } from 'vue'
import AboutView from './components/Views/AboutView.vue'
import HomeView from './components/Views/HomeView.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const showNavTabs = ref(false)

function handleObserveClick () {
  showNavTabs.value = true
}

const homeIsVisible = ref(true)

function closeHomeView () {
  homeIsVisible.value = false
}
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
    <a class="navbar-item" href="/">Home</a>
    <a class="navbar-item" href="/">Learn</a>
    <a class="navbar-item" href="/">Observe</a>
    <a class="navbar-item" href="/">DataLab</a>
    <div class="buttons">
      <a class="navbar-item button red-bg" href="/">Login</a>
    </div>
  </div>
</div>
</nav>
  <div v-if="!showNavTabs">
  <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else-if="showNavTabs">
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
