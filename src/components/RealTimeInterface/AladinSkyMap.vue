<script setup>
import { onMounted, ref } from 'vue'
import { initializeAladin } from '../../utils/aladinUtility.js'

const aladinContainer = ref(null)
let aladinInstance = null

onMounted(() => {
  initializeAladin(aladinContainer.value, {
    survey: 'P/DSS2/color',
    fov: 1,
    target: 'M33',
    cooFrame: 'ICRSd',
    showProjectionControl: false,
    showZoomControl: true,
    showFullscreenControl: false,
    showLayersControl: false,
    showGotoControl: false,
    showFrame: false
  })
    .then(aladin => {
      aladinInstance = aladin
      const searchBox = document.querySelector('.aladin-location')
      if (searchBox) {
        searchBox.style.display = 'none'
      }
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function goToRaDec (ra, dec) {
  if (aladinInstance) {
    aladinInstance.gotoRaDec(ra, dec)
  } else {
    console.error('Aladin instance not initialized')
  }
}

function setFov (fov) {
  if (aladinInstance) {
    aladinInstance.setFov(fov)
  } else {
    console.error('Aladin instance not initialized')
  }
}

defineExpose({
  goToRaDec,
  setFov
})
</script>

<template>
  <v-container class="pa-0 aladin-container" fluid>
        <div ref="aladinContainer" class="aladin-map"></div>
  </v-container>
</template>

<style scoped>
.aladin-map {
  height: 31.25em;
  width: 30em;
  background-color: #000;
}
@media (max-width: 1200px) {
  .aladin-map {
    height: 20em;
    width: 19.7em;
  }
}
</style>
