<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'
import { formatCountdown, calculateSessionCountdown } from '../../utils/formatTime.js'

const sessionsStore = useSessionsStore()

const timeRemaining = ref(0)
const loading = ref(true)

const selectedSession = sessionsStore.currentSession
const site = computed(() => selectedSession.site)
const telescope = computed(() => selectedSession.telescope)

const statusNotExpired = computed(() => {
  return sessionsStore.currentStatus === 'ACTIVE' || sessionsStore.currentStatus === 'UNEXPIRED' || sessionsStore.currentStatus === 'INACTIVE'
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

watch(() => sessionsStore.currentStatus, (newStatus, oldStatus) => {
  if (newStatus === 'ACTIVE') {
    countdown()
  } else {
    sessionsStore.resetSessionState()
    timeRemaining.value = 0
    sessionsStore.updateImageCaptureState(false)
  }
})

onBeforeUnmount(() => {
  sessionsStore.stopPolling()
})

onMounted(async () => {
  loading.value = true
  // initiate the handshake and retrieve a token prior to polling
  await sessionsStore.fetchSessionToken()

  sessionsStore.startPolling()
  countdown()
  const checkTimeRemaining = setInterval(() => {
    // if (timeRemaining.value > 0 && (sessionsStore.currentStatus === 'ACTIVE' || sessionsStore.currentStatus === 'UNEXPIRED' || sessionsStore.currentStatus === 'INACTIVE')) {
    clearInterval(checkTimeRemaining)
    loading.value = false
    // } else if (sessionsStore.currentStatus === 'EXPIRED' || timeRemaining.value <= 0) {
    // clearInterval(checkTimeRemaining)
    // loading.value = false
    // }
  }, 100)
})
</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" model-value="20" class="loading"/>
  </template>
  <template v-else>
    <section>
      <div class="container">
       <div v-if="(sessionsStore.currentStatus === 'INACTIVE' || sessionsStore.currentStatus === 'UNEXPIRED') && timeRemaining >= 0" class="content">
          <h2>Session Not Started</h2>
          <p>You are controlling the {{ telescope }} telescope in {{ site }}</p>
          <p><span class="green-bg px-2 py-2">Session starts in {{ formatCountdown(timeRemaining) }}</span></p>
          <SessionPending/>
        </div>
       <div v-else-if="sessionsStore.currentStatus === 'ACTIVE'" class="content">
          <h2>Live Observing Session</h2>
          <p>You are controlling the {{ telescope }} telescope in {{ site }}</p>
          <p><span class="green-bg px-2 py-2">Time Remaining in session: {{ formatCountdown(timeRemaining) }}</span></p>
          <SessionStarted/>
        </div>
       <div v-else-if="timeRemaining <= 0 && (sessionsStore.currentStatus === 'EXPIRED' || sessionsStore.currentStatus === 'INACTIVE')">
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
</style>
