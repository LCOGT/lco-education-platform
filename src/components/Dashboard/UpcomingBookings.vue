<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { useUserDataStore } from '../../stores/userData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDate, formatTime } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'

const router = useRouter()
const sessionsStore = useSessionsStore()
const userDataStore = useUserDataStore()
const configurationStore = useConfigurationStore()

// change to bookings and add an icon to show completion
const sortedSessions = computed(() => {
  const now = new Date().getTime()
  // TODO: Show past sessions for a certain amount of time in a separate section
  const twoHoursAgo = now - 120 * 60 * 1000
  const sessions = sessionsStore.sessions.results || []
  return sessions.filter(session => new Date(session.start).getTime() >= twoHoursAgo)
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
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

async function deleteSession (sessionId) {
  sessionsStore.currentSessionId = sessionId
  const token = userDataStore.authToken
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + `realtime/${sessionId}/`,
    method: 'DELETE',
    header: { Authorization: `Token ${token}` },
    successCallback: sessionsStore.sessions.results = sessionsStore.sessions.results.filter(session => session.id !== sessionId),
    failCallback: (error) => { console.error('API call failed with error', error) }
  })
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
            <div><a @click.prevent="selectSession(session.id)" class="date">{{ formatDate(session.start) }}</a></div><div>{{ formatTime(session.start) }}</div>
            <button @click="deleteSession(session.id)" class="deleteButton">x</button>
        </div>
        </div>
        <button class="button red-bg" @click="router.push('/book/realtime')"> Book Slot </button>
    </div>
    <div class="observations">
        <h3>Scheduled Observations</h3>
        <div class="table-summary">
            <div v-for="({id, title, progress}) in observations" :key="id">
                <div>{{ title }}</div><div><progress class="progress is-large is-primary" :value="progress" max="100">{{ progress }}%</progress></div>
            </div>
        </div>
        <button class="button red-bg" @click="router.push('/schedule')">Schedule Observations</button>
    </div>
</template>

<style scoped>
.progress.is-primary{
    --bulma-progress-value-background-color: #A6CE39;
    --bulma-progress-bar-background-color:#262e35;
}
</style>
