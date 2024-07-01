<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'

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

const handleViewChange = (view) => {
  currentView.value = view
}

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const calculateTimeRemaining = () => {
  const currentTime = new Date().getTime()
  const remainingSeconds = Math.floor((endTime.value - currentTime) / 1000)
  timeRemaining.value = remainingSeconds > 0 ? remainingSeconds : 0
}

onMounted(() => {
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
        @changeView="handleViewChange"
      />
      <div v-else-if="currentView === 'sessionstarted' || isSessionActive" class="content">
        <h2>Real Time Session</h2>
        <p>You are controlling the telescope in {{ site }}</p>
        <p><span class="green-bg px-2 py-2">Time Remaining in session: {{ formattedTime }}</span></p>
        <SessionStarted @changeView="handleViewChange" />
      </div>
    </div>
  </section>
</template>
