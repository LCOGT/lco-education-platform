<script setup>
import { useRouter } from 'vue-router'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { formatDate } from '../../utils/formatTime.js'

const router = useRouter()
const obsPortalDataStore = useObsPortalDataStore()
const completedObservations = obsPortalDataStore.completedObservations

// Filter out scheduled observations that are older than two weeks
const twoWeeksAgo = new Date() - 14 * 24 * 60 * 60 * 1000
const recentObservations = Object.values(completedObservations).filter(observation => new Date(observation.end) > twoWeeksAgo)
const recentCompletedObservations = recentObservations.filter(observation => observation.state === 'COMPLETED')

const selectObservation = (observationId) => {
  router.push(`/observation/${observationId}`)
}
</script>

<template>
    <template v-if="recentCompletedObservations">
        <div class="bookings">
            <h3>Recent Past Completed Requests</h3>
            <div class="table-summary">
                <div v-for="observation in recentCompletedObservations" :key="observation.id">
                    <div><a @click.prevent="selectObservation(observation.id)">
                        <div v-for="configuration in observation.request.configurations" :key="configuration.id">
                            <p> {{ configuration.target.name.toUpperCase() }} - {{ formatDate(observation.end) }} </p>
                        </div>
                    </a></div>
                </div>
            </div>
        </div>
    </template>
</template>
