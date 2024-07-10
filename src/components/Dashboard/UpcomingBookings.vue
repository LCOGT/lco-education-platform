<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'

const router = useRouter()
const sessionsStore = useSessionsStore()

const redirectToBooking = () => {
  router.push('/book/realtime')
}

const redirectToScheduling = () => {
  router.push('/schedule')
}

const sortedSessions = computed(() => {
  const now = new Date().getTime()
  // TODO: Show past sessions for a certain amount of time in a separate section
  const twoHoursAgo = now - 120 * 60 * 1000
  if (sessionsStore.sessions.results === undefined) {
    return []
  } else {
    return sessionsStore.sessions.results.filter(session => new Date(session.start).getTime() >= twoHoursAgo)
      .slice()
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }
})

const observations = ref([
  { id: 1, title: 'M83', progress: 10, state: 'scheduled' },
  { id: 2, title: 'NGC891', progress: 30 },
  { id: 3, title: 'Andromeda in RGB', progress: 80 },
  { id: 4, title: 'M16', progress: 30 }
])

const selectSession = (sessionId) => {
  sessionsStore.currentSessionId = sessionId
  router.push(`/realtime/${sessionId}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  const options = { hour: 'numeric', minute: 'numeric' }
  return date.toLocaleTimeString('en-US', options)
}

onMounted(() => {
  sessionsStore.fetchSessions()
})

</script>

<template>
    <div class="bookings">
      <h3 v-if="sortedSessions.length">Upcoming Bookings</h3>
      <h3 v-else>No Real-Time Sessions Booked</h3>
        <div class="table-summary">
        <div v-for="session in sortedSessions" :key="session.id">
            <div><a @click.prevent="selectSession(session.id)">{{ formatDate(session.start) }}</a></div><div>{{ formatTime(session.start) }}</div>
        </div>
        </div>
        <button class="button red-bg" @click="redirectToBooking"> Book Slot </button>
    </div>
    <div class="observations">
        <h3>Scheduled Observations</h3>
        <div class="table-summary">
            <div v-for="({id, title, progress}) in observations" :key="id">
                <div>{{ title }}</div><div><progress class="progress is-large is-primary" :value="progress" max="100">{{ progress }}%</progress></div>
            </div>
        </div>
        <button class="button red-bg" @click="redirectToScheduling">Schedule Observations</button>
    </div>
</template>

<style scoped>
.progress.is-primary{
    --bulma-progress-value-background-color: #A6CE39;
    --bulma-progress-bar-background-color:#262e35;
}
</style>
