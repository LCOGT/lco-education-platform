<script setup>
import { ref } from 'vue'
import AboutView from './components/Views/AboutView.vue'
import HomeView from './components/Views/HomeView.vue'

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
    <a class="navbar-item button" href="/">Login</a>
  </div>
</div>
</nav>
  <div v-if="!showNavTabs">
  <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else-if="showNavTabs">
  <section class="hero">
    <div class="container">
        <div class="columns">
            <div class="column is-one-quarter">
                <h1>Observe</h1>
            </div>
            <div class="column">
                <div class="tabs is-left">
                <ul>
                  <li class="is-active"><a>Dashboard</a></li>
                  <li><a>Real-Time</a></li>
                  <li><a>Schedule</a></li>
                  <li><a>Images</a></li>
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
