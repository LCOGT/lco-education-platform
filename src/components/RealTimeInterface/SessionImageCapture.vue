<script setup>
import { ref, onMounted, onUnmounted, computed, defineProps, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'
import { useConfigurationStore } from '../../stores/configuration'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { LottieAnimation } from 'lottie-web-vue'
import BlocksJSON from '@/assets/progress-blocks-bodymovin.json'
import GalaxyJSON from '@/assets/galaxy_loading_pixels.json'

const props = defineProps({
  exposureSettings: {
    type: Array,
    required: true
  }
})

const configurationStore = useConfigurationStore()
const realTimeSessionsStore = useRealTimeSessionsStore()

const status = ref(null)
let pollingInterval = null
const anim = ref(null)
const thumbnailsFetched = ref(false)
const imagesDone = ref(false)
const exposureCount = computed(() => realTimeSessionsStore.exposureCount)

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
        availability: 'Sun up',
        telescope: 'Tracking',
        instrument: 'Exposing',
        progress: 'Error on last observation'
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

const handleThumbnailsFetched = (count) => {
  thumbnailsFetched.value = true
  // Updates store with new count and restarts the progress bar
  realTimeSessionsStore.countThumbnails(count)
  realTimeSessionsStore.initializeProgressTicker()
}

const goBackToSessionStarted = () => {
  realTimeSessionsStore.resetProgress()
  emits('updateRenderGallery', false)
}

const sendStopCommand = async () => {
  const token = realTimeSessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + 'command/stop',
    method: 'POST',
    header: headers,
    successCallback: () => {
      imagesDone.value = true
      realTimeSessionsStore.resetProgress() },
    failCallback: (error) => { console.error('API failed with error', error) }
  })
}

onMounted(() => {
  imagesDone.value = false
  fetchTelescopeStatus()
  pollingInterval = setInterval(fetchTelescopeStatus, 1000)
  anim.value.goToAndPlay(0, true)
  realTimeSessionsStore.initializeProgressTicker()
})

onUnmounted(() => {
  clearInterval(pollingInterval)
  imagesDone.value = false
})

const setCameraState = computed(() => ({
  'status-in-progress': status.value.status.instrument === 'Exposing'
}))

const setTelState = computed(() => ({
  'green': status.value.status.telescope === 'Tracking'
}))

const setProgressState = computed(() => ({
  'status-error': status.value.status.progress === 'Error on last observation'
}))

const setSiteState = computed(() => {
  if (status.value.status.availability !== 'Available') {
    return 'status-error'
  }
  return 'green'
})

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
                    <div :class="setSiteState">
                      <span class="icon-text">
                        <span class="icon is-large">
                          <font-awesome-icon icon="fa-regular fa-location-dot" title="Observatory" />
                        </span>
                        <span>{{ item.availability }}</span>
                      </span>
                    </div>
                    <div :class="setTelState">
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
                    <div :class="setProgressState">
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
            <div v-if="exposureCount > 1" class="thumbnail-counter">
              {{ realTimeSessionsStore.currentThumbnail }} of {{ exposureCount }}
            </div>
            <div class="progress-container">
              <div
                class="progress-bar"
                :style="{ width: realTimeSessionsStore.progressPercent + '%' }"
              />
              </div>

            <button class="button red-bg" @click="sendStopCommand">
            Cancel Observation
            </button>
            <button :disabled="!imagesDone" class="button blue-bg" @click="goBackToSessionStarted">
              Start Another Observation
            </button>
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
</template>

<style scoped>
.progress-container {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
  margin: 1rem 0;
}
.progress-bar {
  height: 100%;
  transition: width 0.5s linear;
  background: linear-gradient(to right, #3b82f6, #10b981);
}
</style>
