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
const loadMoreClicked = ref({})
const visibleThumbnails = ref({})
const isModalOpen = ref(false)

function openModal (observation) {
  obsPortalDataStore.setSelectedConfiguration(observation)
  isModalOpen.value = true
}

function closeModal () {
  isModalOpen.value = false
  obsPortalDataStore.setSelectedConfiguration(null)
}
// These have to be computed cause they change when the store is updated which is on every page change
const observations = obsPortalDataStore.completedObservations
// const sortedObservations = computed(() => { return Object.values(observations.value).sort((a, b) => new Date(b.start) - new Date(a.start)) })

const totalPages = computed(() => {
  return Math.ceil(obsPortalDataStore.completedObservationsCount / pageSize)
})

// Making only 5 requests at a time (pagination) to avoid slow rendering
const loadThumbnailsForPage = async (page) => {
  loading.value = true
  await obsPortalDataStore.fetchCompletedObservations(page)
  thumbnailsMap.value = {}
  visibleThumbnails.value = {}
  for (const obs of Object.values(observations)) {
    const thumbnails = await getThumbnails('observation_id', obs.id)
    // thumbnailsMap.value[obs.id] = thumbnails
    const formattedThumbnails = thumbnails.map(thumbnail => ({
      url: thumbnail.url,
      frame: thumbnail.frame
    }))
    thumbnailsMap.value[obs.id] = formattedThumbnails
    visibleThumbnails.value[obs.id] = formattedThumbnails.length > 4 ? 4 : formattedThumbnails.length
    loadMoreClicked.value[obs.id] = false
  }
  loading.value = false
}

function loadMore (obsId) {
  // On first click, always add 5 images regardless of how many remain
  if (!loadMoreClicked.value[obsId]) {
    visibleThumbnails.value[obsId] = Math.min(visibleThumbnails.value[obsId] + 4, thumbnailsMap.value[obsId].length)
    loadMoreClicked.value[obsId] = true
  } else {
    // On subsequent click, load all remaining images
    visibleThumbnails.value[obsId] = thumbnailsMap.value[obsId].length
  }
}

const changePage = (page) => {
  currentPage.value = page
  loadThumbnailsForPage(page)
}

function openDatalab (observationId, startDate, proposalId) {
  if (!observationId || !startDate || !proposalId) {
    console.error('Missing required parameters:', { observationId, startDate, proposalId })
    return
  }
  const datalabQueryUrl = `${configurationStore.datalabUrl}projects/?observationId=${observationId}&startDate=${startDate}&proposalId=${proposalId}`
  window.open(datalabQueryUrl, 'datalabWindow')
}

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
  <template v-else>
  <div class="container">
    <div v-for="obs in observations" :key="obs.id">
      <h3 class="startTime">{{ formatDateTime(obs.start, { year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
      <div v-if="!thumbnailsMap[obs.id] || thumbnailsMap[obs.id].length === 0">
        <!-- No thumbnails found -->
        <p>No thumbnails found for this observation</p>
      </div>
      <div v-else>
        <div class="columns is-multiline">
          <div
            class="column is-one-quarter-desktop is-half-tablet"
            v-for="(thumbnail, i) in thumbnailsMap[obs.id].slice(0, visibleThumbnails[obs.id])"
            :key="obs.id + '-' + i">
            <figure class="image is-square">
              <img :src="thumbnail.url" class="thumbnail" @click="handleThumbnailClick(thumbnail.frame)" style="cursor: pointer" />
            </figure>
          </div>
          <v-btn
            v-if="thumbnailsMap[obs.id].length > visibleThumbnails[obs.id]"
            @click="loadMore(obs.id)"
          >
            {{ loadMoreClicked[obs.id] ? 'Load All' : 'Load More' }}
          </v-btn>
        </div>
        <Modal
        :isOpen="isModalOpen"
        :title="'Observation Details'"
        @close="closeModal"
      >
        <ObservationDetailsView v-if="isModalOpen" />
        </Modal>
        <v-btn @click="openDatalab(obs.id, obs.start, obs.proposal)">Open in Datalab</v-btn>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div v-if="totalPages !== 0" class="pagination-controls">
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
    <div v-else-if="totalPages === 0">
      <p>No completed observations found. Book one</p>
    </div>
  </div>
</template>
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
