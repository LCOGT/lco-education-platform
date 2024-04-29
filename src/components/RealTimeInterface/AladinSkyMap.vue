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
    showFullscreenControl: false,
    showGotoControl: false,
    showSimbadPointerControl: true
  })
    .then(aladin => {
      aladinInstance = aladin
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function parseRa (raString) {
  const coordinates = raString.toString().match(/(\d+.*)h (\d+.*)m (\d+.*)s/)
  if (!coordinates) return null

  const hours = parseInt(coordinates[1], 10)
  const minutes = parseInt(coordinates[2], 10)
  const seconds = parseInt(coordinates[3], 10)

  return 15 * (hours + minutes / 60 + seconds / 3600)
}

function parseDec (decString) {
  const coordinates = decString.toString().match(/([+-]?\d+.*)°\s(\d+.*)['′]\s(\d+.*)[″"].*/)
  if (!coordinates) return null

  const degrees = parseInt(coordinates[1], 10)
  const arcminutes = parseInt(coordinates[2], 10)
  const arcseconds = parseInt(coordinates[3], 10)

  return degrees + (degrees < 0 ? -1 : 1) * (arcminutes / 60 + arcseconds / 3600)
}

function goToRaDec (ra, dec) {
  const raNumber = parseRa(ra)
  const decNumber = parseDec(dec)

  if (aladinInstance && raNumber && decNumber) {
    aladinInstance.gotoRaDec(raNumber, decNumber)
  } else {
    console.error('Invalid RA/DEC values or Aladin instance not initialized')
  }
}

defineExpose({
  goToRaDec
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
