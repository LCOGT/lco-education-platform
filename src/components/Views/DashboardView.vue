<script setup>
import MyGallery from '../Images/MyGallery.vue'
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue'
import HomeView from './HomeView.vue'
import { ref } from 'vue'

const homeIsVisible = ref(true)

function closeHomeView () {
  homeIsVisible.value = false
}
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
