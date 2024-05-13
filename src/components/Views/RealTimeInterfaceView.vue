<script setup>
import { ref } from 'vue'
import TimePicker from '../RealTimeInterface/TimePicker.vue'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'
import LeafletMap from '../RealTimeInterface/GlobeMap/LeafletMap.vue'

const currentView = ref('scheduling')
const timeRemaining = ref(20)

const handleViewChange = (view) => {
  currentView.value = view
}

// TO DO: Instead of having a set time, get the actual length of the time
const countdown = setInterval(() => {
  if (currentView.value === 'sessionstarted') {
    timeRemaining.value--
    if (timeRemaining.value === 0) {
      clearInterval(countdown)
    }
  }
}, 1000)

</script>

<template>
  <section>
    <div class="container">
        <TimePicker v-if="currentView === 'scheduling'" @changeView="handleViewChange" />
        <LeafletMap v-if="currentView === 'scheduling'"/>
        <SessionPending v-else-if="currentView === 'sessionpending'" @changeView="handleViewChange" />
        <div v-else-if="currentView === 'sessionstarted'">
            <h2>Real Time Session</h2>
            <p>You are controlling Eltham College telescope 1 in Australia</p>
            <p>Time Remaining in session: {{ timeRemaining }}</p>
            <SessionStarted @changeView="handleViewChange" />
        </div>
    </div>
    </section>
</template>
