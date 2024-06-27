<script setup>
import { ref, computed } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'

const sessionsStore = useSessionsStore()

const currentView = ref('sessionpending')
const timeRemaining = ref(20)

const selectedSession = computed(() => {
  return sessionsStore.sessions.results.find(session => session.id === sessionsStore.currentSessionId)
})

const site = computed(() => selectedSession.value?.site)

const handleViewChange = (view) => {
  currentView.value = view
}

// TO DO: Instead of having a set time, get the actual length of the time
const countdown = setInterval(() => {
  if (currentView.value === 'sessionstarted') {
    timeRemaining.value--
    if (timeRemaining.value === 0) {
      clearInterval(countdown)
    }
  }
}, 1000)
</script>

<template>
  <section>
    <div class="container">
      <SessionPending
        v-if="currentView === 'sessionpending'"
        @changeView="handleViewChange"
      />
      <div v-else-if="currentView === 'sessionstarted'" class="content">
        <h2>Real Time Session</h2>
        <p>You are controlling the telescope in {{  site }}</p>
        <p><span class="green-bg px-2 py-2">Time Remaining in session: {{ timeRemaining }}</span></p>
        <SessionStarted @changeView="handleViewChange" />
      </div>
    </div>
  </section>
</template>
