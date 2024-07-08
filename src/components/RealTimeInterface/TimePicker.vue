<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'
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
const times = ['10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30']

const selectTime = (selectedTime) => {
  startTime.value = selectedTime
}

const setEndTime = (startDate, startTime, minutesToAdd) => {
  const combinedDateTime = new Date(startDate)
  const [hours, minutes] = startTime.split(':')
  combinedDateTime.setHours(hours)
  combinedDateTime.setMinutes(minutes)
  combinedDateTime.setMinutes(combinedDateTime.getMinutes() + minutesToAdd)
  return combinedDateTime.toISOString().split('.')[0] + 'Z'
}

const formatToUTC = (date, time) => {
  const combinedDateTime = new Date(date)
  const [hours, minutes] = time.split(':')
  combinedDateTime.setHours(hours)
  combinedDateTime.setMinutes(minutes)
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
    enclosure: 'clma',
    telescope: '2m0a',
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
