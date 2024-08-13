<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'
import { useConfigurationStore } from '../../stores/configuration'
import { useSessionsStore } from '../../stores/sessions'

const configurationStore = useConfigurationStore()
const sessionsStore = useSessionsStore()

const status = ref(null)
let pollingInterval = null
const thumbnailsFetched = ref(false)
const imagesDone = ref(false)
const emits = defineEmits(['updateRenderGallery'])

const imagesCaptured = computed(() => {
  return status.value.status.availability === 'Available' && status.value.status.instrument === 'Idle' && status.value.status.progress === 'Ready' && status.value.status.telescope === 'Tracking' && thumbnailsFetched.value === true
})

const fetchTelescopeStatus = async () => {
  const token = sessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + 'status',
    method: 'GET',
    header: headers,
    successCallback: (response) => {
      status.value = response
      if (imagesCaptured.value === true) {
        imagesDone.value = true
      }
    },
    failCallback: (error) => { console.error('Error fetching status:', error) }
  })
}

const handleThumbnailsFetched = (fetched) => {
  if (fetched) {
    thumbnailsFetched.value = true
  }
}

const goBackToSessionStarted = () => {
  emits('updateRenderGallery', false)
}

const sendStopCommand = async () => {
  const token = sessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  await fetchApiCall({ url: configurationStore.rtiBridgeUrl + 'command/stop', method: 'POST', header: headers, successCallback: () => { imagesDone.value = true }, failCallback: (error) => { console.error('API failed with error', error) } })
}

onMounted(() => {
  fetchTelescopeStatus()
  pollingInterval = setInterval(fetchTelescopeStatus, 1000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})

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
              <v-progress-circular indeterminate color="white" v-if="!imagesDone" class="loading"/>
              <PolledThumbnails @thumbnailsFetched="handleThumbnailsFetched"/>
            </div>
        </div>
    </div>
    <button class="button red-bg" @click="sendStopCommand">
    stop
    </button>
    <button :disabled="!imagesDone" class="button blue-bg" @click="goBackToSessionStarted">
      Capture another target
    </button>
</template>
