<script setup>
// import HomeView from './components/views/HomeView.vue';
// import RealTimeInterfaceView from './components/views/RealTimeInterfaceView.vue';
</script>

<template>
   <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/rti">RTI</router-link>
    </nav>
    <router-view/>
</template>

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
