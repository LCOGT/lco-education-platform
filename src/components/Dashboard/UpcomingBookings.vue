<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useSessionsStore } from '../../stores/sessions'

const router = useRouter()
const sessionsStore = useSessionsStore()

const redirectToBooking = () => {
  router.push('/book/realtime')
}

const redirectToScheduling = () => {
  router.push('/schedule')
}

const allSessions = sessionsStore.getAllSessions

const observations = ref([
  { id: 1, title: 'M83', progress: 10, state: 'scheduled' },
  { id: 2, title: 'NGC891', progress: 30 },
  { id: 3, title: 'Andromeda in RGB', progress: 80 },
  { id: 4, title: 'M16', progress: 30 }
])

</script>

<template>
    <button class="button red-bg" @click="redirectToBooking"> Book Slot </button>
    <div class="bookings">
        <h3>Upcoming Bookings</h3>
        <div class="table-summary">
        <div v-for="session in allSessions" :key="session.id">
            <div><a>{{ session.date }}</a></div><div>{{ session.time }}</div>
        </div>
        </div>
    </div>
    <button class="button red-bg" @click="redirectToScheduling">Schedule Observations</button>

    <div class="observations">
        <h3>Scheduled Observations</h3>
        <div class="table-summary">
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
