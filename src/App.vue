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
    <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
  <div v-if="!showNavTabs">
  <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else-if="showNavTabs">
   <!-- <nav class="navbar">
      <router-link to="/" class="nav-item">Home</router-link>
      <router-link to="/" class="nav-item">Learn</router-link>
      <router-link to="/" class="nav-item">Observe</router-link>
      <router-link to="/" class="nav-item">DataLab</router-link>
    </nav> -->
    <HomeView v-if="homeIsVisible" @close="closeHomeView"/>
    <div>
      <nav class="tabs">
      <router-link to="/dashboard" class="tab">Dashboard</router-link>
      <router-link to="/realtime" class="tab">Real Time</router-link>
      <router-link to="/schedule" class="tab">Schedule</router-link>
      <router-link to="/images" class="tab">Images</router-link>
    </nav>
    <router-view/>
  </div>
</div>
</v-main>
</template>

<style scoped>

html{
  background-color: #3B4249;
}
.v-app-bar {
  background-color: #13181D;
  padding: 10px;
  margin-bottom: 20px;
}
.tabs {
  display: flex;
  justify-content: space-between;
}

.tab {
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
  margin: 1em 1em 0 1em;
  width: 50vw;
  text-decoration: none;
  color: #000;
}

.tab.router-link-active {
  background-color: darkgray;
  color: #000;
}
</style>
