<script setup>
import { ref } from 'vue';
import AboutView from './components/Views/AboutView.vue';

const showNavTabs = ref(false);

function handleObserveClick() {
  showNavTabs.value = true;
}
</script>

<template>
  <div v-if="!showNavTabs">
  <AboutView @observeClicked="handleObserveClick"/>
  </div>
  <div v-else-if="showNavTabs">
   <nav class="navbar">
      <router-link to="/" class="nav-item">Home</router-link>
      <router-link to="/" class="nav-item">Learn</router-link>
      <router-link to="/" class="nav-item">Observe</router-link>
      <router-link to="/" class="nav-item">DataLab</router-link>
    </nav>
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

</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: flex-end;
}
.nav-item {
  margin: 0 1em 0 1em;
  text-decoration: none;
  color: #000;
  text-align: center;
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
