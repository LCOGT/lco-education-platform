<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'

const status = ref(null)
let pollingInterval = null
const statusApiUrl = 'http://rti-bridge-dev.lco.gtn/status'

const fetchStatus = async () => {
  await fetchApiCall({ url: statusApiUrl, method: 'GET', successCallback: (response) => { status.value = response }, failCallback: (error) => { console.error('Error fetching status:', error) } })
}

onMounted(() => {
  fetchStatus()
  // Iconify the responses with hover text as text response

  pollingInterval = setInterval(fetchStatus, 1000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})
// add button that's disabled when images are not done and enabled when images are done to go back to session started

</script>

<template>
    <div class="columns">
        <div class="column is-one-third">
            <div v-if="status">
                <div v-for="item in status" :key="item" class="image-capture-grid">
                    <div>
                      <FontAwesomeIcon icon="fa-regular fa-location-dot" title="Observatory" />
                      <span>{{ item.availability }}</span>
                    </div>
                    <div>
                      <font-awesome-icon icon="fa-regular fa-telescope" title="Telescope"/>
                      <span>{{ item.telescope }}</span>
                    </div>
                    <div>
                      <font-awesome-icon icon="fa-regular fa-camera-retro" title="Camera" />
                      <span>{{ item.instrument }}</span>
                    </div>
                    <div>
                      <font-awesome-icon icon="fa-solid fa-list-check" title="Progress"/>
                      <span>{{ item.progress }}</span>
                    </div>
                </div>
            </div>
            <div class="column">
              <PolledThumbnails />
            </div>
        </div>
    </div>
</template>
