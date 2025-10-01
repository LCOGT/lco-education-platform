<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'
import { formatCountdown, calculateSessionCountdown } from '../../utils/formatTime.js'
import { useConfigurationStore } from '../../stores/configuration'
import sites from '../../utils/sites.JSON'
import oggFlag from '@/assets/Icons/ogg_flag.png'
import cojFlag from '@/assets/Icons/coj_flag.png'
import tfnFlag from '@/assets/Icons/tfn_flag.svg'
import cptFlag from '@/assets/Icons/cpt_flag.svg'
import elpFlag from '@/assets/Icons/elp_flag.png'
import lscFlag from '@/assets/Icons/lsc_flag.png'

const configurationStore = useConfigurationStore()
const realTimeSessionsStore = useRealTimeSessionsStore()

const timeRemaining = ref(0)
const loading = ref(true)
const telname = { '0m4a': 'Delta Rho 0.35m', '0m4b': 'Delta Rho 0.35m', '1m0a': '1 meter', '2m0a': '2 meter' }
const imageSrc = ref('')
const draftTargetsMode = ref(false)

const selectedSession = realTimeSessionsStore.currentSession
const site = computed(() => sites[selectedSession.site]?.name)
const telescope = computed(() => telname[selectedSession.telescope])

const availability = computed(() => realTimeSessionsStore.telescopeAvailability.event_type)
const reason = computed(() => realTimeSessionsStore.telescopeAvailability.event_reason)

let intervalId = null

const availabilityReason = computed(() => {
  let message
  if (reason.value === 'Available' || !reason.value) {
    message = 'Telescope is available for observation'
  } else {
    // Replace underscores with spaces and capitalize first letter
    const formattedReason = reason.value
      ? reason.value.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
      : ''
    message = `Telescope is currently closed for the following reason: ${formattedReason}`
  }
  return message
})

const statusNotExpired = computed(() => {
  return realTimeSessionsStore.currentStatus === 'ACTIVE' || realTimeSessionsStore.currentStatus === 'UNEXPIRED' || realTimeSessionsStore.currentStatus === 'INACTIVE'
})

const statusSessionNotActive = computed(() => {
  if (configurationStore.demo == true) {
    return false
  } else {
    return ((realTimeSessionsStore.currentStatus === 'INACTIVE' || realTimeSessionsStore.currentStatus === 'UNEXPIRED') && timeRemaining.value >= 0)
  }
})

const statusSessionInactive = computed(() => {
  return realTimeSessionsStore.currentStatus === 'INACTIVE'
})

const updateTimeRemaining = () => {
  if (statusNotExpired.value) {
    timeRemaining.value = calculateSessionCountdown(selectedSession)
  }
}

function countdown () {
  const countdown = setInterval(() => {
    updateTimeRemaining()
    if (timeRemaining.value <= 0) {
      clearInterval(countdown)
    }
  }, 1000)
}

const telescopeMessage = computed(() => {
  let msg = ''
  if (availability.value === 'AVAILABLE') {
    msg = 'The telescope is currently available.'
  } else if (availability.value === 'UNAVAILABLE' || availability.value === 'NOT_OK_TO_OPEN') {
    msg = `The telescope is currently unavailable due to ${reason.value}.`
  }
  return msg
}
)

const telescopeMsgState = computed(() => {
  let msgstate = 'notification '
  if (availability.value === 'AVAILABLE') {
    msgstate += 'green-bg'
  } else if (availability.value === 'UNAVAILABLE' || availability.value === 'NOT_OK_TO_OPEN') {
    msgstate += 'is-danger'
  }
  return msgstate
}
)

const siteFlag = computed(() => {
  if (selectedSession) {
    switch (selectedSession.site) {
      case 'ogg':
        return oggFlag
      case 'coj':
        return cojFlag
      case 'tfn':
        return tfnFlag
      case 'cpt':
        return cptFlag
      case 'elp':
        return elpFlag
      case 'lsc':
        return lscFlag
      default:
        return null
    }
  }
  return null
})

const updateImage = () => {
  const baseUrl = `https://lco.global/camera/data/${selectedSession.site}/allsky/lastsnap.jpg`
  imageSrc.value = `${baseUrl}?t=${Date.now()}` // Avoid caching by adding timestamp
}

watch(() => realTimeSessionsStore.currentStatus, (newStatus, oldStatus) => {
  if (newStatus === 'ACTIVE') {
    countdown()
    const fetchTelescopeStatusInterval = setInterval(() => {
      realTimeSessionsStore.fetchTelescopeStatus()
    }, 1000)

    onBeforeUnmount(() => {
      clearInterval(fetchTelescopeStatusInterval)
    })
  }
  else {
    realTimeSessionsStore.resetSessionState()
    timeRemaining.value = 0
    realTimeSessionsStore.updateImageCaptureState(false)
  }
})

onBeforeUnmount(() => {
  realTimeSessionsStore.stopPolling()
  clearInterval(intervalId)
})

onMounted(async () => {
  loading.value = true
  // initiate the handshake and retrieve a token prior to polling
  await realTimeSessionsStore.fetchSessionToken()

  await realTimeSessionsStore.fetchTelescopeStatus()

  realTimeSessionsStore.startPolling()
  countdown()
  const checkTimeRemaining = setInterval(() => {
    clearInterval(checkTimeRemaining)
    loading.value = false
  }, 100)
  updateImage()
  intervalId = setInterval(updateImage, 30000)
})
</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" model-value="20" class="loading"/>
  </template>
  <template v-if="draftTargetsMode">
    <section>
      <div class="container">
       <div v-if="statusSessionNotActive" class="content">
          <h2>Session Not Started</h2>
          <div class="columns">
            <div class="column is-6">
              <p><span class="blue-bg px-2 py-2">Session starts in {{ formatCountdown(timeRemaining) }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="draft-targets">
      <SessionStarted :draft-mode="true" @doneDrafting="draftTargetsMode = false"/>
    </div>
  </template>
  <template v-else-if="!realTimeSessionsStore.isTelescopeAvailable && realTimeSessionsStore.currentStatus === 'ACTIVE'">
    <section>
      <div class="container">
        <div class="content">
          <h2>Telescope Unavailable</h2>
          <p><span class="red-bg px-2 py-2">{{ availabilityReason }}</span></p>
          <SessionPending/>
        </div>
      </div>
    </section>
  </template>
  <template v-else>
    <section>
      <div class="container">
       <div v-if="statusSessionNotActive" class="content">
          <h2>Session Not Started</h2>
          <div class="columns">
            <div class="column is-6">
              <p><span class="blue-bg px-2 py-2">Session starts in {{ formatCountdown(timeRemaining) }}</span></p>
              <div class="icon-text">
                <span class="icon has-text-info">
                  <FontAwesomeIcon icon="fa-regular fa-telescope"  />
                </span>
                <span>{{ telescope }}</span>
              </div>
              <h3>Current Status</h3>
              <div :class="telescopeMsgState">{{ telescopeMessage }}</div>
              <div class="icon-text">
                <span class="icon has-text-info">
                  <FontAwesomeIcon icon="fa-regular fa-location-dot"  />
                </span>
                <span>{{ site }}</span>
                <span><img :src="siteFlag" alt="Site Flag" class="site-flag-sm" />
                </span>
              </div>
              <h3>All Sky Site View</h3>
              <img :src="imageSrc" alt="Site all sky camera" class="site-all-sky-camera" />

            </div>
            <div class="column is-6">
              <v-btn class="blue-bg" @click="draftTargetsMode = true" v-if="statusSessionInactive">Draft Targets</v-btn>
              <!-- <v-btn class="blue-bg" @click="draftTargetsMode = true">Draft Targets</v-btn> -->

              <SessionPending/>
            </div>
          </div>
        </div>
       <div v-else-if="(realTimeSessionsStore.currentStatus === 'ACTIVE' || configurationStore.demo == true)" class="content">
          <h2>Live Observing Session</h2>
          <p>
            <span class="blue-bg px-2 py-2">Time Remaining in session: {{ formatCountdown(timeRemaining) }}</span>
          </p>
          <p>You are controlling the <strong>{{ telescope }}</strong> telescope in <strong>{{ site }}</strong></p>
          <div :class="telescopeMsgState">{{ telescopeMessage }}</div>
          <SessionStarted/>
        </div>
       <div v-else-if="timeRemaining <= 0 && (realTimeSessionsStore.currentStatus === 'EXPIRED' || realTimeSessionsStore.currentStatus === 'INACTIVE')">
          <p><span class="red-bg px-2 py-2">Session has ended</span></p>
        </div>
      </div>
    </section>
  </template>
  </template>

<style scoped>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.slot-info-box {
  background-color: var(--grey-level4);
  border-radius: 8px;
  padding: 1rem;
}
</style>
