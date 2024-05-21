<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import LeafletMap from './GlobeMap/LeafletMap.vue'

const sessionsStore = useSessionsStore()

const date = ref(null)
const time = ref(null)
const emits = defineEmits(['changeView'])

const formattedDate = computed(() => {
  if (date.value) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.value.toLocaleDateString('en-US', options)
  }
  return null
})

// TO DO: Get times from API
const times = ['12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30']

const selectTime = (selectedTime) => {
  time.value = selectedTime
}

const resetSession = () => {
  sessionsStore.selectedSite = null
  sessionsStore.currentSessionId = null
}

const bookDate = () => {
  const selectedSite = sessionsStore.selectedSite
  if (date.value && time.value && selectedSite) {
    const newSession = {
      date: date.value,
      time: time.value,
      location: {
        latitude: selectedSite.lat,
        longitude: selectedSite.lon
      },
      type: 'realtime'
    }
    sessionsStore.addSession(newSession)
    emits('changeView', 'sessionpending')
  } else {
    alert('Please fill in all fields to book a session')
  }
}

watch(date, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    time.value = null
    resetSession()
  }
})

watch(time, (newTime, oldTime) => {
  if (newTime !== oldTime) {
    resetSession()
  }
})

</script>

<template>
  <h2>Book your real-time session</h2>
  <div class="columns">
    <div class="column is-one-third">
      <p class="date-text">Select a date and time:</p>
      <div class="datepicker">
        <v-date-picker v-model="date" class="blue-bg" />
      </div>
    </div>
    <div class="column">
      <div v-if="date && time == null" class="selected-date">
        <p>Select a time:</p>
        <v-btn-group>
          <v-btn v-for="time in times" :key="time" @click="selectTime(time)">{{ time }}</v-btn>
        </v-btn-group>
      </div>
      <div v-if="formattedDate && time" class="column">
        <p class="selected-datetime">
          <span v-if="sessionsStore.selectedSite">{{ sessionsStore.selectedSite.site }} Selected for {{ formattedDate }} at {{ time }}</span>
          <span v-else>Booking for {{ formattedDate }} at {{ time }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && sessionsStore.selectedSite" @click="bookDate" class="blue-bg">Book</v-btn>
      </div>
    </div>
  </div>
  <LeafletMap v-if="formattedDate && time" />
</template>

<style scoped>
.date-text,
.selected-date {
  font-size: 1em;
  text-align: left;
  margin: 1em 0 1em 7em;
}

.datepicker {
  display: flex;
  flex-direction: column;
  max-width: 20%;
  margin-left: 7em;
}
</style>
