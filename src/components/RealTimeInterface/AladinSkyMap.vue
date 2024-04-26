<script setup>
import { onMounted, ref } from 'vue'
import { initializeAladin } from '../../utils/aladinUtility.js'

const aladinContainer = ref(null)

onMounted(() => {
  initializeAladin(aladinContainer.value, {
    survey: 'P/DSS2/color',
    fov: 1,
    target: 'M33',
    cooFrame: 'ICRSd',
    showFullscreenControl: false,
    showGotoControl: false,
    showSimbadPointerControl: true
  })
    .then(aladin => {
      console.log('Aladin initialized:', aladin)
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})
</script>

<template>
  <v-container class="pa-0 aladin-container" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <div ref="aladinContainer" class="aladin-map"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.aladin-map {
  height: 500px;
  background-color: #000;
}
</style>
