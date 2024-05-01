<script setup>
// TO DO: store bookings in pinia store and fetch them here
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const redirectToRTI = () => {
  router.push('/realtime')
}

const items = ref([
  { id: 1, date: 'May 19, 2024', telescope: 'Maui, LCO' },
  { id: 2, date: 'April 3, 2024', telescope: 'Australia, Eltham College' },
  { id: 3, date: 'March 13, 2024', telescope: 'Maui, LCO' },
  { id: 4, date: 'March 12, 2024', telescope: 'Tenerife, LCO' }
])

const observations = ref([
  { id: 1, title: 'M83', progress: 10 },
  { id: 2, title: 'NGC891', progress: 30 },
  { id: 3, title: 'Andromeda in RGB', progress: 80 },
  { id: 4, title: 'M16', progress: 30 }
])

</script>

<template>
    <button class="button red-bg" @click="redirectToRTI"> Book Slot </button>
    <div class="bookings grey-bg">
        <h3 class="upcoming-bookings-text">Upcoming Bookings</h3>
        <div class="booking" v-for="({id, date, telescope}) in items" :key="id">
            <p class="booking-text"><a >{{ date }}</a> - {{ telescope }}</p>
        </div>
    </div>
    <button class="button red-bg">Schedule Observations</button>

    <div class="observations">
        <h3>Scheduled Observations</h3>
        <div class="observation-summary">
            <div v-for="({id, title, progress}) in observations" :key="id">
                <div>{{ title }}</div><div><progress class="progress is-large is-primary" :value="progress" max="100">{{ progress }}%</progress></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.progress.is-primary{
    --bulma-progress-value-background-color: #A6CE39;
    --bulma-progress-bar-background-color:#262e35;
}
</style>
