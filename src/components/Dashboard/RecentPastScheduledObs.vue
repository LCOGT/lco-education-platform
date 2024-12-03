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
const recentCompleted = ref([])

// Filter out scheduled observations that are older than two weeks
const twoWeeksAgo = new Date() - 14 * 24 * 60 * 60 * 1000
const recentObservations = Object.values(completedObservations).filter(observation => new Date(observation.end) > twoWeeksAgo)
const recentCompletedObservations = recentObservations.filter(observation => observation.state === 'COMPLETED')
const recentRealTimeObservations = recentObservations.filter(observation => observation.state === 'PENDING')

const getArchiveData = async (observationId, obsType) => {
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}frames/?observation_id=${observationId}&size=small`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        if (obsType === 'scheduled') {
          recentCompleted.value.push(data.results)
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
  router.push(`/observationdetails/${configuration.id}`)
}

onMounted(() => {
  for (const completedObservation of recentCompletedObservations) {
    getArchiveData(completedObservation.id, 'scheduled')
  }
  for (const realTimeObservation of recentRealTimeObservations) {
    getArchiveData(realTimeObservation.id, 'realtime')
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
      :observations="recentCompleted"
      title="Recent Past Completed Requests"
      :onSelect="selectObservationDetails"
      class="completed-obs"
    />
  </template>
<style>
.real-time-obs {
  order: 1;
}
.completed-obs {
  order: 3;
}
</style>
