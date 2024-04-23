<script setup>
</script>

<template>
   <nav class="navbar">
      <router-link to="/" class="nav-item">Home</router-link>
      <router-link to="/rti" class="nav-item">RTI</router-link>
      <router-link to="/dashboard" class="nav-item">Dashboard</router-link>
    </nav>
    <router-view/>
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
