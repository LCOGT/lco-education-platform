<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { useObsPortalDataStore } from '../../stores/obsPortalData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDateTime } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'

const router = useRouter()
const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()
const obsPortalDataStore = useObsPortalDataStore()

const pendingRequestGroups = computed(() => {
  return obsPortalDataStore.pendingRequestGroups
})

// change to bookings and add an icon to show completion
const sortedSessions = computed(() => {
  const now = new Date().getTime()
  // TODO: Show past sessions for a certain amount of time in a separate section
  const twoHoursAgo = now - 120 * 60 * 1000
  const sessions = Object.values(obsPortalDataStore.upcomingRealTimeSessions)
  return sessions.filter(session => new Date(session.start).getTime() >= twoHoursAgo)
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
})

const selectSession = (sessionId) => {
  realTimeSessionsStore.currentSessionId = sessionId
  router.push(`/realtime/${sessionId}`)
}

async function deleteSession (sessionId) {
  realTimeSessionsStore.currentSessionId = sessionId
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + `realtime/${sessionId}/`,
    method: 'DELETE',
    successCallback: () => {
      const updatedSessions = { ...obsPortalDataStore.upcomingRealTimeSessions }
      delete updatedSessions[sessionId]
      obsPortalDataStore.upcomingRealTimeSessions = updatedSessions
    },
    failCallback: (error) => { console.error('API call failed with error', error) }
  })
}

onMounted(async () => {
  await obsPortalDataStore.fetchUpcomingRealTimeSessions()
  await obsPortalDataStore.fetchPendingRequestGroups()
})

</script>

<template>
    <div class="bookings upcoming-real-time">
      <h3 v-if="sortedSessions.length">Upcoming Bookings</h3>
      <h3 v-else>No Real-Time Sessions Booked</h3>
        <div class="table-summary">
        <div v-for="session in sortedSessions" :key="session.id">
            <div><a @click.prevent="selectSession(session.id)" class="date">{{ formatDateTime(session.start, { year: 'numeric', month: 'long', day: 'numeric' }) }}</a></div><div>{{ formatDateTime(session.start, { hour: 'numeric', minute: 'numeric' }) }}</div>
            <button @click="deleteSession(session.id)" class="deleteButton">x</button>
        </div>
        </div>
        <button class="button red-bg" @click="router.push('/book/realtime')"> Book Slot </button>
    </div>
    <div class="observations upcoming-obs">
        <h3><span v-if="!pendingRequestGroups">No </span>Pending Requests</h3>
        <div class="table-summary">
            <div v-for="requestGroup in pendingRequestGroups" :key="requestGroup.id">
              <div v-for="request in requestGroup.request.configurations" :key="request.id">
                {{ request.target.name}}
                <!-- TO DO: Define progress and get progress from api -->
                <div><progress class="progress is-large is-primary" :value="progress" max="100">{{ progress }}%</progress></div>
              </div>
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
