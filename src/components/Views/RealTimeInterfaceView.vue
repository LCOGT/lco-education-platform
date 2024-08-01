<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'
import { formatCountdown, calculateSessionCountdown } from '../../utils/formatTime.js'

const sessionsStore = useSessionsStore()

const timeRemaining = ref(0)

const selectedSession = sessionsStore.currentSession
const site = computed(() => selectedSession.site)

onMounted(async () => {
  // initiate the handshake and retrieve a token prior to polling
  await sessionsStore.fetchSessionToken()

  sessionsStore.startPolling()

  const countdown = setInterval(() => {
    if (sessionsStore.currentStatus === 'ACTIVE' || sessionsStore.currentStatus === 'INACTIVE' || sessionsStore.currentStatus === 'UNEXPIRED') {
      timeRemaining.value = calculateSessionCountdown(selectedSession)
      if (timeRemaining.value <= 0) {
        clearInterval(countdown)
      }
    }
  }, 1000)
})

onBeforeUnmount(() => {
  sessionsStore.stopPolling()
})
</script>

<template>
  <section>
    <div class="container">
      <div v-if="timeRemaining <= 0 && sessionsStore.currentStatus !== 'UNEXPIRED' && sessionsStore.currentStatus === 'EXPIRED'">
        <!-- temporary message -->
        <p><span class="red-bg px-2 py-2">Session has ended</span></p>
      </div>
      <div v-else-if="sessionsStore.currentStatus === 'INACTIVE' || sessionsStore.currentStatus === 'UNEXPIRED'" class="content">
        <h2>Session Not Started</h2>
        <p>You are controlling the telescope in {{ site }}</p>
        <p><span class="green-bg px-2 py-2">Session starts in {{ formatCountdown(timeRemaining) }}</span></p>
        <SessionPending/>
      </div>
      <div v-else-if="sessionsStore.currentStatus === 'ACTIVE'" class="content">
        <h2>Live Observing Session</h2>
        <p>You are controlling the telescope in {{ site }}</p>
        <p><span class="green-bg px-2 py-2">Time Remaining in session: {{ formatCountdown(timeRemaining) }}</span></p>
        <SessionStarted/>
      </div>
    </div>
  </section>
</template>
