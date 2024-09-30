<script setup>
import { ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import ScheduledObservations from '../Scheduling/ScheduledObservations.vue'

// TO DO (near future): Save this value in the store
// TO DO (future): Get level depending on course completion
const level = ref('')
const showScheduled = ref(false)

</script>

<template>
  <div class="container">
    <div v-if="!level && !showScheduled" class="level-buttons-wrapper">
      <h2>Schedule an Observation</h2>
      <p>What level are you?</p>
      <v-btn @click="level = 'beginner'" color="indigo" class="level-btns">Beginner</v-btn>
      <v-btn @click="level = 'advanced'" color="indigo" class="level-btns">Advanced</v-btn>
    </div>

    <div v-else-if="level === 'beginner' && !showScheduled">
        <BeginnerScheduling @scheduled="handleSchedule" />
    </div>

    <div v-else-if="level === 'advanced' && !showScheduled">
      <AdvancedScheduling @scheduled="handleSchedule" />
    </div>

    <div v-if="showScheduled">
      <ScheduledObservations />
    </div>
  </div>
</template>

<style scoped>
.level-buttons-wrapper {
  margin: 1em;
  gap: 1em;
}
.level-btns {
  margin: 1em;
}
</style>
