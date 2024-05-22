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
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function parseRa (raString) {
  let coordinates

  // Entry in HMS format
  coordinates = raString.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/)
  if (coordinates) {
    const hours = parseFloat(coordinates[1])
    const minutes = parseFloat(coordinates[2])
    const seconds = parseFloat(coordinates[3])
    return 15 * (hours + minutes / 60 + seconds / 3600)
  }

  // Entry in decimal hours format
  coordinates = raString.match(/([\d.]+)h/)
  if (coordinates) {
    return 15 * parseFloat(coordinates[1])
  }

  // Entry in decimal degrees format
  coordinates = raString.match(/([\d.]+)°/)
  if (coordinates) {
    return parseFloat(coordinates[1])
  }
  return null
}

function parseDec (decString) {
  let coordinates

  // Entry in DMS format
  coordinates = decString.match(/([+-]?\d+)°\s*(\d+)'[\s]*(\d+\.?\d*)"/)
  if (coordinates) {
    const degrees = parseFloat(coordinates[1])
    const arcminutes = parseFloat(coordinates[2])
    const arcseconds = parseFloat(coordinates[3])
    return degrees + (degrees < 0 ? -1 : 1) * (arcminutes / 60 + arcseconds / 3600)
  }

  // Entry in decimal degrees format
  coordinates = decString.match(/([+-]?\d+\.?\d*)°/)
  if (coordinates) {
    return parseFloat(coordinates[1])
  }
  return null
}

function goToRaDec (ra, dec) {
  const raNumber = parseRa(ra)
  const decNumber = parseDec(dec)

  if (aladinInstance && raNumber !== null && decNumber !== null) {
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
