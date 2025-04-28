<script setup>
import { ref, onMounted, defineProps, watch } from 'vue'
import sites from '../../../utils/sites.JSON'
import availableIcon from '../../../assets/Icons/available_mapmarker.png'
import unavailableIcon from '../../../assets/Icons/unavailable_mapmarker.png'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  availableTimes: {
    type: Object,
    required: true
  },
  selectedTime: {
    type: String,
    required: true
  },
  highlightedSite: {
    type: String,
    required: false
  }
})

const mapContainer = ref(null)
const map = ref(null)
const markersLayer = ref(null)

onMounted(() => {
  map.value = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map.value)
  markersLayer.value = L.layerGroup().addTo(map.value)
  updateMarkers()
})

function updateMarkers () {
  Object.entries(sites).forEach(([site, { lat, lon }]) => {
    const iconUrl = site === props.highlightedSite
      ? availableIcon
      : unavailableIcon

    // This replaces createIcon function
    L.marker([lat, lon], { icon: L.icon({ iconUrl, iconSize: [30, 42], iconAnchor: [15, 42] }) })
      .addTo(markersLayer.value)
  })
}

// Updates the markers when the selected time from a different site changes
watch(() => props.highlightedSite, (newSite) => {
  markersLayer.value.clearLayers()
  updateMarkers()
})

</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style>
.map-container {
  height: 40vh;
  width: 100%;
}
</style>
