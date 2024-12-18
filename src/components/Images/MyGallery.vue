<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useObsPortalDataStore } from '../../stores/obsPortalData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDateTime } from '../../utils/formatTime.js'
import { getThumbnails } from '../../utils/thumbnailsUtils.js'
import { fetchApiCall } from '../../utils/api.js'
import Modal from '../Global/Modal.vue'
import ObservationDetailsView from '../Views/ObservationDetailsView.vue'

const configurationStore = useConfigurationStore()
const obsPortalDataStore = useObsPortalDataStore()

const thumbnailsMap = ref({})
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 5

const isModalOpen = ref(false)
const selectedObservation = ref(null)

function openModal (observation) {
  selectedObservation.value = observation
  obsPortalDataStore.setSelectedConfiguration(observation)
  isModalOpen.value = true
}

function closeModal () {
  isModalOpen.value = false
  selectedObservation.value = null
  obsPortalDataStore.setSelectedConfiguration(null)
}

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

const loadThumbnailsForPage = async (page) => {
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
    const thumbnails = await getThumbnails('observation_id', session.id)
    if (thumbnails.length > 0) {
      thumbnailsMap.value[session.id] = thumbnails.map(thumbnail => ({
        url: thumbnail.url,
        frame: thumbnail.frame
      }))
    }
  }
  loading.value = false
}

const changePage = (page) => {
  currentPage.value = page
  loadThumbnailsForPage(page)
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
    loadThumbnailsForPage(currentPage.value)
  }
})

const handleThumbnailClick = async (frameId) => {
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}frames/${frameId}`,
    method: 'GET',
    successCallback: (frameDetails) => {
      if (frameDetails) {
        openModal(frameDetails)
      }
    },
    failCallback: (error) => {
      console.error('Error fetching frame details:', error)
    }
  })
}

onMounted(() => {
  loadThumbnailsForPage(currentPage.value)
})

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading"/>
  </template>
  <div class="container">
    <div v-for="obs in sessionsWithThumbnails" :key="obs.id">
      <h3 class="startTime">{{ formatDateTime(obs.start, { year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
      <div class="columns is-multiline">
        <div
          class="column is-one-quarter-desktop is-half-tablet"
          v-for="(thumbnail, i) in thumbnailsMap[obs.id]"
          :key="obs.id + '-' + i">
          <figure class="image is-square">
            <img :src="thumbnail.url" class="thumbnail" @click="handleThumbnailClick(thumbnail.frame)" style="cursor: pointer" />
          </figure>
        </div>
      </div>
      <Modal
      :isOpen="isModalOpen"
      :title="'Observation Details'"
      @close="closeModal"
    >
      <ObservationDetailsView v-if="selectedObservation" />
    </Modal>
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
