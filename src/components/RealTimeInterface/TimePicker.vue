<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import LeafletMap from './GlobeMap/LeafletMap.vue'
import WindyMap from './GlobeMap/WindyMap.vue'

const date = ref(null)
const time = ref(null)
const selectedSite = ref(null)
const selectedSiteLat = ref(null)
const selectedSiteLon = ref(null)
const emits = defineEmits(['changeView', 'siteSelected'])

// Automatically format the date whenever it changes
const formattedDate = computed(() => {
  if (date.value) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.value.toLocaleDateString('en-US', options)
  }
  return null
})

// Watch for changes in the date and reset the time if it changes
watch(date, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    time.value = null
  }
})

// Dummy data for available times
const times = ['12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30']

const selectTime = (selectedTime) => {
  time.value = selectedTime
}

// TO DO: change the status dynamically
const bookDate = () => {
  emits('changeView', 'sessionpending')
  emits('siteSelected', { site: selectedSite.value, lat: selectedSiteLat.value, lon: selectedSiteLon.value })
}

const handleSiteSelected = (data) => {
  selectedSite.value = data.site
  selectedSiteLat.value = data.lat
  selectedSiteLon.value = data.lon
}
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
          <span v-if="selectedSite">{{ selectedSite }} selected for {{ formattedDate }} at {{ time }}</span>
          <span v-else>booking for {{ formattedDate }} at {{ time }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && selectedSite" @click="bookDate" class="blue-bg">Book</v-btn>
      </div>
    </div>
  </div>
  <LeafletMap v-if="formattedDate && time" @siteSelected="handleSiteSelected" />
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
