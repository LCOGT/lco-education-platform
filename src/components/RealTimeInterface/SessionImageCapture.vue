<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PolledThumbnails from './PolledThumbnails.vue'
import { fetchApiCall } from '../../utils/api.js'
import { useConfigurationStore } from '../../stores/configuration'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { LottieAnimation } from 'lottie-web-vue'
import BlocksJSON from '@/assets/progress-blocks-bodymovin.json'
import GalaxyJSON from '@/assets/galaxy_loading_pixels.json'

const props = defineProps({
  exposureTime: { type: Number, required: true },
  exposureCount: { type: Number, required: true }
})

const configurationStore = useConfigurationStore()
const realTimeSessionsStore = useRealTimeSessionsStore()

const status = ref(null)
let pollingInterval = null
let progressTimer = null
const remainingExposures = ref(props.exposureCount)
const anim = ref(null)
const thumbnailsFetched = ref(false)
const imagesDone = ref(false)
const elapsedTime = ref(0)

const emits = defineEmits(['updateRenderGallery'])

const imagesCaptured = computed(() => {
  return status.value.status.availability === 'Available' && status.value.status.instrument === 'Idle' && status.value.status.progress === 'Ready' && status.value.status.telescope === 'Tracking' && thumbnailsFetched.value === true && remainingExposures.value === 1
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
// Total time is exposureTime plus an extra 5 seconds for thumbnails delay
const totalTime = computed(() => props.exposureTime + 5)
// Calculate progress as a percentage (clamped to 100)
const progressPercent = computed(() => {
  return Math.min((elapsedTime.value / totalTime.value) * 100, 100)
})

// const startExposureCycle = () => {
//   if (!status.value || !status.value.status || status.value.status.availability !== 'Available') {
//     return
//   }
//   elapsedTime.value = 0
//   imagesDone.value = false
//   while (remainingExposures.value > 1) {
//     progressTimer = setInterval(() => {
//       if (elapsedTime.value < totalTime.value) {
//         elapsedTime.value++
//       } else {
//         clearInterval(progressTimer)
//         remainingExposures.value -= 1
//       }
//     }, 1000)
//   }
// }

const startExposureCycle = () => {
  // Only run if the telescope is available.
  if (!status.value || !status.value.status || status.value.status.availability !== 'Available') {
    return
  }
  elapsedTime.value = 0
  imagesDone.value = false
  if (progressTimer) clearInterval(progressTimer)
  if (status.value.status.instrument === 'Exposing' || status.value.status.instrument === 'Configuring' || status.value.status.instrument === 'Reading out') {
    progressTimer = setInterval(() => {
      if (elapsedTime.value < totalTime.value) {
        elapsedTime.value++
      } else {
        clearInterval(progressTimer)
        remainingExposures.value = remainingExposures.value - 1
        if (remainingExposures.value > 0) {
          setTimeout(() => {
            startExposureCycle()
            // Optionally, re-fetch status here if needed:
            fetchTelescopeStatus()
          }, 1000) // Short delay before restarting
        } else {
          imagesDone.value = true
        }
      }
    }, 1000)
  }
}

watch(
  () => status.value?.status?.instrument,
  (newStatus) => {
    if (newStatus === 'Exposing' || newStatus === 'Configuring' || newStatus === 'Reading out') {
      // When available, start the exposure cycle if not already started
      startExposureCycle()
    } else {
      // If not available, clear the timer so the progress bar stops
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
      }
    }
  }
)

onMounted(() => {
  imagesDone.value = false
  fetchTelescopeStatus()
  pollingInterval = setInterval(fetchTelescopeStatus, 1000)
  anim.value.goToAndPlay(0, true)
  remainingExposures.value = props.exposureCount
  startExposureCycle()
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
            <button class="button red-bg" @click="sendStopCommand">
            Cancel Observation
            </button>
            <button :disabled="!imagesDone" class="button blue-bg" @click="goBackToSessionStarted">
              Start Another Observation
            </button>
          </div>
          <span v-if="props.exposureCount-remainingExposures!==props.exposureCount">{{ props.exposureCount-remainingExposures+1 }} of {{ props.exposureCount }}</span>
          <div class="progress-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
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
  height: 20px;
  background-color: red; /* background indicates remaining time */
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}
.progress-bar {
  height: 100%;
  background-color: green; /* fills in as time passes */
  transition: width 1s linear;
}
</style>
