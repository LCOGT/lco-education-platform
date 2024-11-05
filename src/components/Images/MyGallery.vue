<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useObsPortalDataStore } from '../../stores/obsPortalData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDate } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'

const configurationStore = useConfigurationStore()
const obsPortalDataStore = useObsPortalDataStore()

const thumbnailsMap = ref({})
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 5

const filteredSessions = computed(() => {
  const now = new Date()
  // Choosing 16 minutes because each session is 15 minutes long and this way we can show the last session once it's completed
  const sixteenMinutes = 16 * 60 * 1000
  const cutoffTime = new Date(now.getTime() - sixteenMinutes)
  // Object.values returns an array of all the values of the object
  const sessions = Object.values(obsPortalDataStore.completedObservations)
  const filtered = sessions
    .filter(session => new Date(session.start) < cutoffTime)
    .sort((a, b) => new Date(b.start) - new Date(a.start))
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredSessions.value.length / pageSize)
})

const getThumbnails = async (observationId) => {
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}thumbnails/?observation_id=${observationId}&size=large`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        thumbnailsMap.value[observationId] = data.results.map(result => result.url)
      }
    },
    failCallback: (error) => {
      console.error('Error fetching thumbnails for session:', observationId, error)
    }
  })
}

const loadSessionsForPage = async (page) => {
  loading.value = true
  // Calculate the start and end index for the current page
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const sessions = filteredSessions.value.slice(startIndex, endIndex)
  // Clear the thumbnails map for the current page
  thumbnailsMap.value = {}

  for (const session of sessions) {
    // Initialize the thumbnails array for the session
    thumbnailsMap.value[session.id] = []
    await getThumbnails(session.id)
  }

  loading.value = false
}

const changePage = (page) => {
  currentPage.value = page
  loadSessionsForPage(page)
}

const sessionsWithThumbnails = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Only include sessions that have urls in thumbnailsMap
  return filteredSessions.value.slice(startIndex, endIndex).filter(
    session => thumbnailsMap.value[session.id] && thumbnailsMap.value[session.id].length > 0
  )
})

function openDatalab (observationId, startDate, proposalId) {
  if (!observationId || !startDate || !proposalId) {
    console.error('Missing required parameters:', { observationId, startDate, proposalId })
    return
  }
  const datalabQueryUrl = `${configurationStore.datalabUrl}projects/?observationId=${observationId}&startDate=${startDate}&proposalId=${proposalId}`
  window.open(datalabQueryUrl, 'datalabWindow')
}

// Without the watcher for filteredSessions, the thumbnails would not be fetched when the number of sessions changes
watch(filteredSessions, (newSessions, oldSessions) => {
  if (newSessions.length !== oldSessions.length) {
    loadSessionsForPage(currentPage.value)
  }
})

onMounted(() => {
  loadSessionsForPage(currentPage.value)
})

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading"/>
  </template>
  <div class="container">
    <div v-for="obs in sessionsWithThumbnails" :key="obs.id">
      <h3 class="startTime">{{ formatDate(obs.start) }}</h3>
      <div class="columns is-multiline">
        <div
          class="column is-one-quarter-desktop is-half-tablet"
          v-for="(thumbnailUrl, i) in thumbnailsMap[obs.id]"
          :key="obs.id + '-' + i">
          <figure class="image is-square">
            <img :src="thumbnailUrl" class="thumbnail" />
          </figure>
        </div>
      </div>
      <v-btn @click="openDatalab(obs.id, obs.start, obs.proposal)">Open in Datalab</v-btn>
    </div>
    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button
        v-if="currentPage > 1"
        @click="changePage(currentPage - 1)"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        v-if="currentPage < totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.loading {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
button {
  margin: 0 0.5rem;
}
</style>
