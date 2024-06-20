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
const emits = defineEmits(['changeView'])

const toIsoDate = computed(() => {
  if (date.value) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.value.toLocaleDateString('en-US', options)
  }
  return null
})

// TO DO: Get times from API
const times = ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00']

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
  sessionsStore.selectedSite = null
  sessionsStore.currentSessionId = null
}

const blockRti = async () => {
  const requestBody = {
    proposal: 'LCOSchedulerTest',
    name: 'Test Real Time',
    site: 'tst',
    enclosure: 'doma',
    telescope: '1m0a',
    start: formatToUTC(date.value, startTime.value),
    end: endTime.value
  }
  await fetchApiCall({ url: 'http://observation-portal-dev.lco.gtn/api/realtime/', method: 'POST', body: requestBody, successCallback: () => router.push('/dashboard'), failCallback: handleError })
}

const handleError = (error) => {
  errorMessage.value = 'Failed to book session. Please select another time'
  console.error('API call failed with error:', error)
}

const bookDate = () => {
  const selectedSite = sessionsStore.selectedSite
  if (date.value && startTime.value && selectedSite) {
    const newSession = {
      date: formatToUTC(date.value, startTime.value),
      time: startTime.value,
      site: selectedSite.site,
      location: {
        latitude: selectedSite.lat,
        longitude: selectedSite.lon
      },
      type: 'realtime'
    }
    sessionsStore.addSession(newSession)
    add15Minutes()
    blockRti()
  } else {
    alert('Please fill in all fields to book a session')
  }
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
        <v-btn-group>
          <v-btn v-for="time in times" :key="time" @click="selectTime(time)">{{ time }}</v-btn>
        </v-btn-group>
      </div>
      <div v-if="toIsoDate && startTime" class="column">
        <p class="selected-datetime">
          <span v-if="sessionsStore.selectedSite && !errorMessage">{{ sessionsStore.selectedSite.site }} Selected for {{ toIsoDate }} at {{ startTime }}</span>
          <span v-else-if="!sessionsStore.selectedSite">Click on a pin to book for {{ toIsoDate }} at {{ startTime }}</span>
          <span v-else-if="sessionsStore.selectedSite && errorMessage" class="error">{{ errorMessage }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && sessionsStore.selectedSite" @click="bookDate" class="blue-bg">Book</v-btn>
      </div>
      <LeafletMap v-if="toIsoDate && startTime" />
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
