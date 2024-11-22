<script setup>
import { useRouter } from 'vue-router'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { onMounted } from 'vue'
import ObservationList from './ObservationList.vue'

const router = useRouter()
const obsPortalDataStore = useObsPortalDataStore()
const completedObservations = obsPortalDataStore.completedObservations

// Filter out scheduled observations that are older than two weeks
const twoWeeksAgo = new Date() - 14 * 24 * 60 * 60 * 1000
const recentObservations = Object.values(completedObservations).filter(observation => new Date(observation.end) > twoWeeksAgo)
const recentCompletedObservations = recentObservations.filter(observation => observation.state === 'COMPLETED')
const recentRealTimeObservations = recentObservations.filter(observation => observation.state === 'PENDING')
const recentRealTimeObservationsWithConfigurations = recentRealTimeObservations.filter(observation => observation.request.configurations.length > 0)

const selectCompletedObservation = (observationId) => {
  router.push(`/observation/${observationId}`)
}

const selectRealTimeObservation = (observationId) => {
  router.push(`/realtime/${observationId}`)
}

onMounted(() => {
  console.log('recent real time obs', recentRealTimeObservations)
})
</script>
<template>
    <ObservationList
      :observations="recentCompletedObservations"
      title="Recent Past Completed Requests"
      :onSelect="selectCompletedObservation"
    />
    <ObservationList
      :observations="recentRealTimeObservationsWithConfigurations"
      title="Recent Past Real-Time Requests"
      :onSelect="selectRealTimeObservation"
    />
  </template>
