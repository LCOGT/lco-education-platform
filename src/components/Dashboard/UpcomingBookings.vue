<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { useObsPortalDataStore } from '../../stores/obsPortalData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDateTime } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'
import oggFlag from '@/assets/Icons/ogg_flag.png'
import cojFlag from '@/assets/Icons/coj_flag.png'
import tfnFlag from '@/assets/Icons/tfn_flag.svg'
import cptFlag from '@/assets/Icons/cpt_flag.svg'
import elpFlag from '@/assets/Icons/elp_flag.png'
import lscFlag from '@/assets/Icons/lsc_flag.png'

const router = useRouter()
const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()
const obsPortalDataStore = useObsPortalDataStore()

const currentPage = ref(1)
const sessionsPerPage = 5

const currentRequestPage = ref(1)
const requestsPerPage = 5

const pendingScheduledRequests = computed(() => obsPortalDataStore.pendingScheduledRequests)

// change to bookings and add an icon to show completion
const sortedSessions = computed(() => {
  const now = new Date().getTime()
  const twoHoursAgo = now - 120 * 60 * 1000
  const sessions = Object.values(obsPortalDataStore.upcomingRealTimeSessions)
  return sessions.filter(session => new Date(session.start).getTime() >= twoHoursAgo)
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
})

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * sessionsPerPage
  const end = start + sessionsPerPage
  return sortedSessions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sortedSessions.value.length / sessionsPerPage)
})

const changePage = (page) => {
  currentPage.value = page
}

const numberOfRequests = computed(() => {
  return Object.keys(obsPortalDataStore.pendingScheduledRequests).length
})

const paginatedRequests = computed(() => {
  const start = (currentRequestPage.value - 1) * requestsPerPage
  const end = start + requestsPerPage
  return Object.values(obsPortalDataStore.pendingScheduledRequests).slice(start, end)
})

const totalRequestPages = computed(() => {
  return Math.ceil(numberOfRequests.value / requestsPerPage)
})

const changeRequestPage = (page) => {
  currentRequestPage.value = page
}

const selectSession = (sessionId) => {
  realTimeSessionsStore.currentSessionId = sessionId
  router.push(`/realtime/${sessionId}`)
}

const siteFlag = (siteid) => {
  switch (siteid) {
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

async function deleteSession (sessionId) {
  realTimeSessionsStore.currentSessionId = sessionId
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + `realtime/${sessionId}/`,
    method: 'DELETE',
    successCallback: () => {
      const updatedSessions = { ...obsPortalDataStore.upcomingRealTimeSessions }
      delete updatedSessions[sessionId]
      obsPortalDataStore.upcomingRealTimeSessions = updatedSessions

      // Check if totalPages has changed
      const newTotalPages = Math.ceil(Object.values(updatedSessions).length / sessionsPerPage)
      if (currentPage.value > newTotalPages) {
        currentPage.value = newTotalPages
      }
    },
    failCallback: (error) => { console.error('API call failed with error', error) }
  })
}

async function viewSelectedObsDetails (requestId) {
  router.push({
    name: 'ScheduledObsDetailsView',
    params: { requestId }
  })
}

onMounted(async () => {
  await obsPortalDataStore.fetchUpcomingRealTimeSessions()
  await obsPortalDataStore.fetchPendingScheduledRequests()
})

</script>

<template>
    <div class="bookings upcoming-real-time">
      <h3 v-if="sortedSessions.length">Upcoming Bookings</h3>
      <h3 v-else>No Real-Time Sessions Booked</h3>
        <table class="table is-fullwidth real-time-table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Date and Time</th>
              <th>Delete</th>
            </tr>
          </thead>
        <tbody v-for="session in paginatedSessions" :key="session.id">
          <tr>
            <td><img :src="siteFlag(session.site)" alt="Site Flag" class="site-flag"/></td>
            <td><a @click.prevent="selectSession(session.id)" class="date">{{ formatDateTime(session.start, { year: 'numeric', month: 'long', day: 'numeric' }) }}</a> {{ formatDateTime(session.start, { hour: 'numeric', minute: 'numeric' }) }}</td>
            <td><button @click="deleteSession(session.id)" class="deleteButton">
              <font-awesome-icon icon="fa-solid fa-trash-can" class="icon red" />
            </button></td>
            </tr>
          </tbody>
        <button v-if="sortedSessions.length > 5 && currentPage!=1" @click="changePage(currentPage - 1)" class="button">Earlier sessions</button>
        <button v-if="sortedSessions.length > 5 && currentPage!=totalPages" @click="changePage(currentPage + 1)" class="button">Later sessions</button>
      </table>
        <button class="button red-bg" @click="router.push('/book/realtime')"> Book Slot </button>
    </div>
    <div class="observations upcoming-obs">
        <h3><span v-if="Object.keys(pendingScheduledRequests).length == 0">No </span>Scheduled Requests</h3>
        <table class="table is-fullwidth">
            <tbody v-for="requestedObservation in paginatedRequests" :key="requestedObservation.id">
              <tr v-for="configuration of requestedObservation.configurations" :key="configuration.id">

                <td class="target-name">{{ configuration.target.name}}</td>
                <td><a @click="viewSelectedObsDetails(requestedObservation.id)">
                  <font-awesome-icon icon="fa-solid fa-eye" class="icon" />
                  </a></td>
                </tr>
              </tbody>
            <button v-if="numberOfRequests > 5 && currentRequestPage!=1" @click="changeRequestPage(currentRequestPage - 1)" class="button">previous</button>
            <button v-if="numberOfRequests > 5 && currentRequestPage!=totalRequestPages" @click="changeRequestPage(currentRequestPage + 1)" class="button">more</button>
            </table>
        <button class="button red-bg" @click="router.push('/schedule')">Schedule Observations</button>
    </div>
</template>
<style scoped>
.target-name {
  cursor: pointer;
}
.progress.is-primary{
    --bulma-progress-value-background-color: #A6CE39;
    --bulma-progress-bar-background-color:#262e35;
}
</style>
