<script setup>
import { ref, onMounted, watch, defineEmits, defineProps } from 'vue'
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
  }
})

const emits = defineEmits(['siteSelected'])

const mapContainer = ref(null)

const createIcon = (iconUrl) => {
  return L.icon({
    iconUrl,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })
}

const mapMarkerAvailable = createIcon(availableIcon)
const mapMarkerUnavailable = createIcon(unavailableIcon)

const updateMarkers = (map) => {
  // Finds the date string that the selected time is in
  const selectedDateStr = Object.keys(props.availableTimes).find(date => {
    const times = props.availableTimes[date]
    return times.some(time => new Date(time.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === props.selectedTime)
  })
  // Filters out the available sites for the selected time
  const availableSites = (props.availableTimes[selectedDateStr] || [])
    .filter(time => new Date(time.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === props.selectedTime)
    .map(time => time.location)
  // Iterates over all sites and updates their markers on the map
  Object.entries(sites).forEach(([site, { lat, lon }]) => {
    // Checks if the site is available for the selected time
    const available = availableSites.includes(site)
    const icon = available ? mapMarkerAvailable : mapMarkerUnavailable
    const popupText = available ? `${site}<br>available` : `${site}<br>unavailable`

    const marker = L.marker([lat, lon], { icon })
    marker.bindPopup(popupText)
    marker.on('click', () => {
      if (available) {
        emits('siteSelected', { site, lat, lon })
      }
    })
    marker.addTo(map)
  })
}

onMounted(() => {
  const map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)

  updateMarkers(map)
})

// Updates the markers when the available times or selected time change
watch(() => [props.availableTimes, props.selectedTime], () => {
  if (mapContainer.value) {
    const map = L.map(mapContainer.value).setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)
    updateMarkers(map)
  }
}, { immediate: true })
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
