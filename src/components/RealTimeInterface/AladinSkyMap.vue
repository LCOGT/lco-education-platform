<script setup>
import { onMounted, ref, watch } from 'vue'
import { initializeAladin } from '../../utils/aladinUtility.js'
import { useSkyCoordinatesStore } from '../../stores/skyCoordinates'

const skyCoordinatesStore = useSkyCoordinatesStore()
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
      // Updates the SkyCoordinates store on click of the map and aladin will render the ra and dec selected
      aladin.on('positionChanged', () => {
        const position = aladin.getRaDec()
        const [ra, dec] = position
        skyCoordinatesStore.setCoordinates(ra, dec)
      })
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function goToRaDec (ra, dec) {
  if (aladinInstance) {
    aladinInstance.gotoRaDec(ra, dec)
    skyCoordinatesStore.setCoordinates(ra, dec)
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

// user clicks on the map to change the coordinates --> update the store --> update the map
watch(
  () => [skyCoordinatesStore.ra, skyCoordinatesStore.dec],
  ([ra, dec]) => {
    if (aladinInstance && ra !== null && dec !== null) {
      aladinInstance.gotoRaDec(ra, dec)
    }
  }
)
</script>

<template>
  <v-container class="pa-0 aladin-container" fluid>
    <h2>Archive Image from DSS</h2>
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
