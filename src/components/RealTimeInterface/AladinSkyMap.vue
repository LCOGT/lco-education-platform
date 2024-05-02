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
    showLocation: false,
    showFrame: false
  })
    .then(aladin => {
      aladinInstance = aladin
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function parseRa (raString) {
  const coordinates = raString.toString().match(/(\d+.*)h\s(\d+.*)m\s(\d+.*)s/)
  if (!coordinates) return null

  const hours = Number(coordinates[1], 10)
  const minutes = Number(coordinates[2], 10)
  const seconds = Number(coordinates[3], 10)

  return 15 * (hours + minutes / 60 + seconds / 3600)
}

function parseDec (decString) {
  const coordinates = decString.toString().match(/([+-]?\d+.*)°\s(\d+.*)['′]\s(\d+.*)[″"].*/)
  if (!coordinates) return null

  const degrees = Number(coordinates[1], 10)
  const arcminutes = Number(coordinates[2], 10)
  const arcseconds = Number(coordinates[3], 10)

  return degrees + (degrees < 0 ? -1 : 1) * (arcminutes / 60 + arcseconds / 3600)
}

function goToRaDec (ra, dec) {
  const raNumber = parseRa(ra)
  const decNumber = parseDec(dec)

  if (aladinInstance && raNumber && decNumber) {
    // Aladin's built-in method to go to a specific RA/DEC
    aladinInstance.gotoRaDec(raNumber, decNumber)
  } else {
    console.error('Invalid RA/DEC values or Aladin instance not initialized')
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
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <div ref="aladinContainer" class="aladin-map"></div>
      </v-col>
    </v-row>
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
