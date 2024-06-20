<!-- <script setup>
import { onMounted, ref, defineProps } from 'vue'
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
    showLayersControl: true,
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
</style> -->

<script setup>
import { onMounted, ref } from 'vue'
import { initializeAladin } from '../../utils/aladinUtility.js'

const aladinContainer = ref(null)
let aladinInstance = null
let overlay = null
const polygonCoords = ref([])

onMounted(() => {
  initializeAladin(aladinContainer.value, {
    survey: 'P/DSS2/color',
    fov: 1,
    target: 'M33',
    cooFrame: 'ICRSd',
    showProjectionControl: false,
    showZoomControl: true,
    showFullscreenControl: false,
    showLayersControl: true,
    showGotoControl: false,
    showFrame: false
  })
    .then(aladin => {
      aladinInstance = aladin

      overlay = A.graphicOverlay({ color: 'cyan' })
      aladin.addOverlay(overlay)

      const searchBox = document.querySelector('.aladin-location')
      if (searchBox) {
        searchBox.style.display = 'none'
      }

      aladin.on('click', event => {
        const raDec = aladin.pix2world(event.x, event.y)
        if (raDec) {
          addPoint(raDec[0], raDec[1])
        }
      })
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})

function addPoint (ra, dec) {
  polygonCoords.value.push([ra, dec])
  drawPolygon()
}

function drawPolygon () {
  if (overlay) {
    overlay.removeAll()
    const polygon = A.polyline(polygonCoords.value, { color: 'cyan' })
    overlay.add(polygon)
  } else {
    console.error('Overlay not initialized')
  }
}

function getPolygonPoints () {
  console.log(polygonCoords.value)
  return polygonCoords.value
}

function clearPolygon () {
  polygonCoords.value = []
  if (overlay) {
    overlay.removeAll()
  }
}

</script>

<template>
  <v-container class="pa-0 aladin-container" fluid>
    <div ref="aladinContainer" class="aladin-map"></div>
    <v-btn @click="clearPolygon">Clear Polygon</v-btn>
    <v-btn @click="console.log(getPolygonPoints())">Get Polygon Points</v-btn>
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
