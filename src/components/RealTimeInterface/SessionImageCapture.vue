<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'
import { useConfigurationStore } from '../../stores/configuration'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { LottieAnimation } from 'lottie-web-vue'
import BlocksJSON from '@/assets/progress-blocks-bodymovin.json'
import GalaxyJSON from '@/assets/galaxy_loading_pixels.json'

const configurationStore = useConfigurationStore()
const realTimeSessionsStore = useRealTimeSessionsStore()

const status = ref(null)
let pollingInterval = null
const anim = ref(null)
const thumbnailsFetched = ref(false)
const imagesDone = ref(false)
const emits = defineEmits(['updateRenderGallery'])

const imagesCaptured = computed(() => {
  return status.value.status.availability === 'Available' && status.value.status.instrument === 'Idle' && status.value.status.progress === 'Ready' && status.value.status.telescope === 'Tracking' && thumbnailsFetched.value === true
})

const failedToCaptureImages = computed(() => {
  return status.value.status === 'Unknown'
})

const fetchTelescopeStatus = async () => {
  if (configurationStore.demo) {
    status.value = {
      status: {
        availability: 'Available',
        telescope: 'Tracking',
        instrument: 'Exposing',
        progress: 'Ready'
      }
    }
    imagesDone.value = false
    return
  }
  const token = realTimeSessionsStore.getTokenForCurrentSession
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
  const token = realTimeSessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  await fetchApiCall({ url: configurationStore.rtiBridgeUrl + 'command/stop', method: 'POST', header: headers, successCallback: () => { imagesDone.value = true }, failCallback: (error) => { console.error('API failed with error', error) } })
}

onMounted(() => {
  imagesDone.value = false
  fetchTelescopeStatus()
  pollingInterval = setInterval(fetchTelescopeStatus, 1000)
  anim.value.goToAndPlay(0, true)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
  imagesDone.value = false
})

const setCameraState = computed(() => ({
  'status-in-progress': status.value.status.instrument === 'Exposing'
}))

</script>

<template>
    <div class="columns">
        <div class="column is-one-third">
          <div v-if="status">
            <div v-if="failedToCaptureImages">
                <div class="notification is-danger">
                  <p>Unable to fetch telescope status</p>
                </div>
            </div>
            <div v-else>
                <div v-for="item in status" :key="item" class="image-capture">
                    <div>
                      <span class="icon-text">
                        <span class="icon is-large">
                          <font-awesome-icon icon="fa-regular fa-location-dot" title="Observatory" />
                        </span>
                        <span>{{ item.availability }}</span>
                      </span>
                    </div>
                    <div>
                      <span class="icon-text">
                        <span class="icon is-large">
                          <font-awesome-icon icon="fa-regular fa-telescope" title="Telescope"/>
                        </span>
                        <span>{{ item.telescope }}</span>
                      </span>
                    </div>
                    <div :class="setCameraState">
                      <span class="icon-text">
                        <span class="icon is-large">
                          <font-awesome-icon icon="fa-regular fa-camera-retro" title="Camera" />
                        </span>
                        <span>{{ item.instrument }}</span>
                      </span>
                    </div>
                    <div>
                      <span class="icon-text">
                        <span class="icon is-large">
                          <font-awesome-icon icon="fa-solid fa-list-check" title="Progress"/>
                        </span>
                        <span>{{ item.progress }}</span>
                      </span>
                    </div>
                </div>
              </div>
            </div>
          <div class="column">
            <LottieAnimation v-if="!imagesDone"
              ref="anim"
              :animation-data="GalaxyJSON"
              :loop="true"
              :auto-play="true"
              :speed="1"
              @loopComplete="loopComplete"
              @complete="complete"
              @enterFrame="enterFrame"
              @segmentStart="segmentStart"
              @stopped="stopped"/>
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
