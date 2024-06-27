<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'
import sites from '../../utils/sites.JSON'
import LeafletMap from './GlobeMap/LeafletMap.vue'

const router = useRouter()
const sessionsStore = useSessionsStore()

const date = ref(null)
const startTime = ref(null)
const endTime = ref(null)
const errorMessage = ref(null)
const selectedSite = ref(null)
const emits = defineEmits(['changeView'])

const toIsoDate = computed(() => {
  if (date.value) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.value.toLocaleDateString('en-US', options)
  }
  return null
})

// TO DO: Get times from API
const times = ['17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45', '00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30']

const selectTime = (selectedTime) => {
  startTime.value = selectedTime
}

const setEndTime = (startDate, startTime, minutesToAdd) => {
  const combinedDateTime = new Date(startDate)
  const [hours, minutes] = startTime.split(':')
  combinedDateTime.setUTCHours(hours)
  combinedDateTime.setUTCMinutes(minutes)
  combinedDateTime.setUTCMinutes(combinedDateTime.getUTCMinutes() + minutesToAdd)
  return combinedDateTime.toISOString().split('.')[0] + 'Z'
}

const formatToUTC = (date, time) => {
  const combinedDateTime = new Date(date)
  const [hours, minutes] = time.split(':')
  combinedDateTime.setUTCHours(hours)
  combinedDateTime.setUTCMinutes(minutes)
  return combinedDateTime.toISOString().split('.')[0] + 'Z'
}

const add15Minutes = () => {
  if (startTime.value) {
    endTime.value = setEndTime(date.value, startTime.value, 15)
  }
}

const resetSession = () => {
  errorMessage.value = null
  selectedSite.value = null
  sessionsStore.currentSessionId = null
}

const blockRti = async () => {
  add15Minutes()
  const requestBody = {
    proposal: 'LCOSchedulerTest',
    name: 'Test Real Time',
    site: 'tst',
    enclosure: 'doma',
    telescope: '1m0a',
    start: formatToUTC(date.value, startTime.value),
    end: endTime.value
  }
  await fetchApiCall({ url: 'http://observation-portal-dev.lco.gtn/api/realtime/', method: 'POST', body: requestBody, successCallback: bookDate, failCallback: handleError })
}

const handleError = (error) => {
  errorMessage.value = 'Failed to book session. Please select another time'
  console.error('API call failed with error:', error)
}

const bookDate = (response) => {
  if (date.value && startTime.value && selectedSite.value) {
    const newSession = { ...response }
    sessionsStore.addSession(newSession)
    router.push('/dashboard')
  } else {
    alert('Please fill in all fields to book a session')
  }
}

const handleSiteSelection = (site) => {
  selectedSite.value = site
}

watch(date, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    startTime.value = null
    resetSession()
  }
})

watch(startTime, (newTime, oldTime) => {
  if (newTime !== oldTime) {
    resetSession()
  }
})

</script>

<template>
  <h2>Book your real-time session</h2>
  <div class="columns">
    <div class="column is-one-third">
      <p>Select a date and time:</p>
      <div>
        <v-date-picker v-model="date" class="blue-bg" />
      </div>
    </div>
    <div class="column">
      <div v-if="date && startTime == null" class="selected-date">
        <p>Select a time:</p>
        <div class="grid">
          <div class="cell" v-for="time in times" :key="time"><button class="button" @click="selectTime(time)">{{ time }}</button></div>
        </div>
      </div>
      <div v-if="toIsoDate && startTime" class="column">
        <p class="selected-datetime">
          <span v-if="selectedSite && !errorMessage">{{ selectedSite.site }} selected for {{ toIsoDate }} at {{ startTime }}</span>
          <span v-else-if="!selectedSite">Click on a pin to book for {{ toIsoDate }} at {{ startTime }}</span>
          <span v-else-if="selectedSite && errorMessage" class="error">{{ errorMessage }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && selectedSite" @click="blockRti" class="blue-bg">Book</v-btn>
      </div>
      <LeafletMap v-if="toIsoDate && startTime" @siteSelected="handleSiteSelection"/>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
