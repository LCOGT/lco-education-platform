<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'
import { formatCountdown } from '../../utils/formatTime.js'

const sessionsStore = useSessionsStore()

const currentView = ref('')
const timeRemaining = ref(0)

const selectedSession = computed(() => {
  return sessionsStore.sessions.results.find(session => session.id === sessionsStore.currentSessionId)
})

const site = computed(() => selectedSession.value?.site)
const startTime = computed(() => new Date(selectedSession.value?.start).getTime())
const endTime = computed(() => new Date(selectedSession.value?.end).getTime())

const isSessionActive = computed(() => {
  const currentTime = new Date().getTime()
  return currentTime >= startTime.value && currentTime <= endTime.value
})

const calculateTimeRemaining = () => {
  const currentTime = new Date().getTime()
  const remainingSeconds = Math.floor((endTime.value - currentTime) / 1000)
  timeRemaining.value = remainingSeconds > 0 ? remainingSeconds : 0
}

onMounted(() => {
  // have a const be sessionstarted and sessionpending and assign it to currentView
  currentView.value = isSessionActive.value ? 'sessionstarted' : 'sessionpending'

  if (currentView.value === 'sessionstarted') {
    calculateTimeRemaining()
  }

  const countdown = setInterval(() => {
    if (currentView.value === 'sessionstarted') {
      calculateTimeRemaining()
      if (timeRemaining.value === 0) {
        clearInterval(countdown)
      }
    }
  }, 1000)
})
</script>

<template>
  <section>
    <div class="container">
      <SessionPending
        v-if="currentView === 'sessionpending' && !isSessionActive"
        @changeView="currentView = $event"
      />
      <div v-else-if="currentView === 'sessionstarted' || isSessionActive" class="content">
        <h2>Real Time Session</h2>
        <p>You are controlling the telescope in {{ site }}</p>
        <p><span class="green-bg px-2 py-2">Time Remaining in session: {{ formatCountdown(timeRemaining) }}</span></p>
        <SessionStarted @changeView="currentView = $event" />
      </div>
    </div>
  </section>
</template>
