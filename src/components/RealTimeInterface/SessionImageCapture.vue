<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'

const status = ref(null)
let pollingInterval = null
const telescopeStatusApiUrl = 'http://rti-bridge-dev.lco.gtn/status'

const fetchTelescopeStatus = async () => {
  await fetchApiCall({ url: telescopeStatusApiUrl, method: 'GET', successCallback: (response) => { status.value = response }, failCallback: (error) => { console.error('Error fetching status:', error) } })
}

onMounted(() => {
  fetchTelescopeStatus()
  pollingInterval = setInterval(fetchTelescopeStatus, 1000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})
// add button that's disabled when images are not done and enabled when images are done to go back to session started

</script>

<template>
    <div class="columns">
        <div class="column">
            <div v-if="status">
                <div v-for="item in status" :key="item">
                    <p>Observatory: {{ item.availability }}</p>
                    <p>Telescope: {{ item.telescope }}</p>
                    <p>Camera: {{ item.instrument }}</p>
                    <p>Progress: {{ item.progress }}</p>
                </div>
            </div>
            <PolledThumbnails />
        </div>
    </div>
</template>
