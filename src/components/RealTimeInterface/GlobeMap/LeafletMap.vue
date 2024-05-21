<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '../../../stores/sessions'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import availableIcon from '../../../assets/Icons/available_mapmarker.png'
import unavailableIcon from '../../../assets/Icons/unavailable_mapmarker.png'

const sessionsStore = useSessionsStore()

const mapMarkerAvailable = availableIcon
const mapMarkerUnavailable = unavailableIcon

const mapContainer = ref(null)

// Placeholder function to determine availability
const isAvailable = () => Math.random() > 0.5

onMounted(() => {
  const map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  }).addTo(map)

  const customIconAvailable = L.icon({
    iconUrl: mapMarkerAvailable,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })

  const customIconUnavailable = L.icon({
    iconUrl: mapMarkerUnavailable,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })

  const locations = [
    { lat: 34.4208, lng: -119.6982, site: 'Santa Barbara, California' },
    { lat: 35.0844, lng: -106.6504, site: 'Albuquerque, New Mexico' },
    { lat: 21.4389, lng: -158.0001, site: 'Oahu, Hawaii' },
    { lat: -37.8136, lng: 144.9631, site: 'Melbourne, Australia' }
  ]

  locations.forEach(location => {
    const available = isAvailable()
    const icon = available ? customIconAvailable : customIconUnavailable
    const popupText = available ? `${location.site}<br>available` : `${location.site}<br>unavailable`

    const marker = L.marker([location.lat, location.lng], { icon })
    marker.bindPopup(popupText)
    marker.on('click', () => {
      if (available) {
        sessionsStore.selectedSite = { site: location.site, lat: location.lat, lon: location.lng }
      }
    })
    marker.addTo(map)
  })
})
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style>
.map-container {
  height: 80vh;
  width: 100%;
}
</style>
