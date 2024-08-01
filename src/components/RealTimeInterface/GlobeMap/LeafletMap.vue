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

// Updates markers on the map based on the available times and selected time
const updateMarkers = (map) => {
  const selectedTime = new Date(props.selectedTime)
  const availableSites = []

  // Iterates over the available times
  Object.keys(props.availableTimes).forEach(dateKey => {
    Object.keys(props.availableTimes[dateKey]).forEach(timeKey => {
      // Converts the time key to a Date object for comparison
      const intervalTime = new Date(timeKey)

      // Checks if the time interval matches the selected time
      if (intervalTime.getTime() === selectedTime.getTime()) {
        // Adds the resources' sites to the available sites array
        props.availableTimes[dateKey][timeKey].resources.forEach(resource => {
          availableSites.push(resource.site)
        })
      }
    })
  })

  // Iterates over all sites and updates markers on the map
  Object.entries(sites).forEach(([site, { lat, lon }]) => {
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

// Updates the markers when the available times or selected time change
watch(() => [props.availableTimes, props.selectedTime], () => {
  if (mapContainer.value) {
    const map = L.map(mapContainer.value).setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)
    updateMarkers(map)
  }
}, { immediate: true })

onMounted(() => {
  const map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)

  updateMarkers(map)
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
