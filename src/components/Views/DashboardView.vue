<script setup>
import MyGallery from '../Images/MyGallery.vue'
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue'
import HomeView from './HomeView.vue'
import { onMounted, ref } from 'vue'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'

const obsPortalDataStore = useObsPortalDataStore()

const homeIsVisible = ref(true)

function closeHomeView () {
  homeIsVisible.value = false
}

onMounted(async () => {
  await obsPortalDataStore.fetchPendingScheduledObservations()
})
</script>

<template>
    <div v-if="homeIsVisible">
        <HomeView @close="closeHomeView"/>
    </div>
    <div class="container">
        <div class="columns">
            <div class="column is-three-fifths">
                <MyGallery />
            </div>
            <div class="column">
                <UpcomingBookings />
            </div>
        </div>
    </div>
</template>
