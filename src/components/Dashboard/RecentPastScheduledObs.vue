<script setup>
import { useRouter } from 'vue-router'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { useConfigurationStore } from '../../stores/configuration.js'
import { onMounted, ref } from 'vue'
import { fetchApiCall } from '../../utils/api.js'
import ObservationList from './ObservationList.vue'

const router = useRouter()
const obsPortalDataStore = useObsPortalDataStore()
const completedObservations = obsPortalDataStore.completedObservations
const configurationStore = useConfigurationStore()
const recentRTI = ref([])
const recentScheduledObservations = ref([])

// Filter out scheduled observations that are older than two weeks
const twoWeeksAgo = new Date() - 24 * 24 * 60 * 60 * 1000
const recentObservations = Object.values(completedObservations).filter(observation => new Date(observation.end) > twoWeeksAgo)
const recentCompletedObservations = recentObservations.filter(observation => observation.state === 'COMPLETED')
// Talk to Matt or Mark about switching observation state for real time observations
const recentRealTimeObservations = recentObservations.filter(observation => observation.state === 'PENDING' && observation.observation_type === 'REAL_TIME')

const getThumbnailsForObservation = async (observationId, obsType) => {
  console.log('observationId', observationId)
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}frames/?observation_id=${observationId}&size=small`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        if (obsType === 'scheduled') {
          recentScheduledObservations.value.push(data.results)
        } else if (obsType === 'realtime') {
          recentRTI.value.push(data.results)
        }
      }
    },
    failCallback: (error) => {
      console.error('Error fetching thumbnails for session:', observationId, error)
    }
  })
}

const selectObservationDetails = (configuration) => {
  obsPortalDataStore.setSelectedConfiguration(configuration)
  console.log('selected configuration', configuration)
  router.push(`/observationdetails/${configuration.id}`)
}

onMounted(() => {
  for (const completedObservation of recentCompletedObservations) {
    getThumbnailsForObservation(completedObservation.id, 'scheduled')
  }
  for (const realTimeObservation of recentRealTimeObservations) {
    getThumbnailsForObservation(realTimeObservation.id, 'realtime')
  }
})
</script>
<template>
    <ObservationList
      :observations="recentRTI"
      title="Recent Past Real-Time Requests"
      :onSelect="selectObservationDetails"
      class="real-time-obs"
    />
    <ObservationList
      :observations="recentScheduledObservations"
      title="Recent Past Completed Requests"
      :onSelect="selectObservationDetails"
      class="completed-obs"
    />
  </template>
