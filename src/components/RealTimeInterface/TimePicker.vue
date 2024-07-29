<script setup>
import { ref, watch, defineEmits, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'
import { formatToUTC, formatDate, formatTime } from '../../utils/formatTime.js'
import { useConfigurationStore } from '../../stores/configuration'
import LeafletMap from './GlobeMap/LeafletMap.vue'

const router = useRouter()
const sessionsStore = useSessionsStore()
const configurationStore = useConfigurationStore()

const date = ref(null)
const startTime = ref(null)
const endDate = ref(null)
const errorMessage = ref(null)
const selectedSite = ref(null)
const availableTimes = ref({})
const localTimes = ref([])

const emits = defineEmits(['timeSelected'])

const hasAvailableTimes = computed(() => {
  return Object.keys(availableTimes.value).length > 0
})

// Rounding times from ocs to the nearest 15 minutes
function roundToNearest15Minutes (date, direction = 'up') {
  // 15 minutes in milliseconds
  const ms = 1000 * 60 * 15
  const roundedDate = new Date(Math[direction === 'up' ? 'ceil' : 'floor'](date.getTime() / ms) * ms)
  return roundedDate
}

// Because we get availability in ranges, we need to generate all the 15 minute intervals within those ranges
function generate15MinuteIntervals (startDate, endDate) {
  const intervals = []
  let current = new Date(startDate)
  while (current <= endDate) {
    intervals.push(current.toISOString())
    // Add 15 minutes in milliseconds
    current = new Date(current.getTime() + 15 * 60 * 1000)
  }
  return intervals
}

function processTelescopeAvailability (data) {
  const processedData = {}

  // Loop through each telescope in the input data
  Object.keys(data).forEach(telescope => {
    // Loop through each time range for the current telescope
    data[telescope].forEach(range => {
      // Convert the start and end times to Date objects
      const start = new Date(range[0])
      const end = new Date(range[1])

      const roundedStart = roundToNearest15Minutes(start, 'up')
      const roundedEnd = roundToNearest15Minutes(end, 'down')

      // Generate 15-minute intervals between the rounded start and end times
      generate15MinuteIntervals(roundedStart, roundedEnd).forEach(interval => {
        const dateStr = interval.split('T')[0]
        // Initialize an array for the date if it doesn't exist
        if (!processedData[dateStr]) {
          processedData[dateStr] = []
        }

        // Add the interval, telescope, and location to the processed data
        processedData[dateStr].push({
          time: interval,
          telescope,
          location: telescope.split('.')[2]
        })
      })
    })
  })

  return processedData
}

const convertToLocaleTimes = (times) => {
  const uniqueTimes = new Set()
  times.forEach(({ time }) => {
    const localTime = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    uniqueTimes.add(localTime)
  })
  return Array.from(uniqueTimes)
}

watch(date, (newDate) => {
  if (newDate) {
    const dateStr = new Date(newDate).toISOString().split('T')[0]
    const timesForDate = availableTimes.value[dateStr] || []
    localTimes.value = convertToLocaleTimes(timesForDate)
  }
})

const setEndDate = (startDate, startTime, minutesToAdd) => {
  const combinedDateTime = new Date(startDate)
  const [hours, minutes] = startTime.split(':')
  combinedDateTime.setHours(hours)
  combinedDateTime.setMinutes(minutes)
  combinedDateTime.setMinutes(combinedDateTime.getMinutes() + minutesToAdd)
  return combinedDateTime.toISOString().split('.')[0] + 'Z'
}

const resetSession = () => {
  errorMessage.value = null
  selectedSite.value = null
  sessionsStore.currentSessionId = null
}

const blockRti = async () => {
  endDate.value = setEndDate(date.value, startTime.value, 15)
  const requestBody = {
    proposal: 'LCOSchedulerTest',
    name: 'Test Real Time',
    site: 'tst',
    enclosure: 'clma',
    telescope: '2m0a',
    start: formatToUTC(date.value, startTime.value),
    end: endDate.value
  }
  await fetchApiCall({ url: configurationStore.observationPortalUrl + 'realtime/', method: 'POST', body: requestBody, successCallback: bookDate, failCallback: () => { errorMessage.value = 'Failed to book session. Please select another time' } })
}

const bookDate = () => {
  if (date.value && startTime.value && selectedSite.value) {
    router.push('/dashboard')
  }
}

async function getAvailableTimes () {
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + 'realtime/availability/',
    method: 'GET',
    successCallback: (responseData) => { availableTimes.value = processTelescopeAvailability(responseData) },
    failCallback: (error) => { console.error('API call failed with error', error) }
  })
}

// Checks if a date is today or in the future
const isDateAllowed = (date) => {
  const today = new Date()
  // Reset today's time to midnight
  today.setHours(0, 0, 0, 0)
  return date >= today
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
    emits('timeSelected', newTime)
  }
})

onMounted(() => {
  getAvailableTimes()
})
</script>

<template>
  <template v-if="hasAvailableTimes">
  <h2>Book your live observing session</h2>
  <div class="columns">
    <div class="column is-one-third">
      <p>Select a date and time:</p>
      <div>
        <v-date-picker v-model="date" class="blue-bg" :allowed-dates="isDateAllowed" />
      </div>
    </div>
    <div class="column">
      <div v-if="date && startTime == null" class="selected-date">
        <p>Select a time:</p>
        <div class="grid">
          <div class="cell" v-for="time in localTimes" :key="time">
            <button class="button" @click="startTime = time">{{ time }}</button>
          </div>
        </div>
      </div>
      <div v-if="startTime" class="column">
        <p class="selected-datetime">
          <span v-if="selectedSite && !errorMessage">{{ selectedSite.site }} selected for {{ formatDate(date) }} at {{ startTime }}</span>
          <span v-else-if="!selectedSite">Click on a pin to book for {{ formatDate(date) }} at {{ startTime }}</span>
          <span v-else-if="selectedSite && errorMessage" class="error">{{ errorMessage }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && selectedSite" @click="blockRti" class="blue-bg">Book</v-btn>
      </div>
      <LeafletMap v-if="startTime" :availableTimes="availableTimes" :selectedTime="startTime" @siteSelected="selectedSite = $event" />
    </div>
  </div>
</template>
</template>

<style scoped>
.error {
  color: red;
}
</style>
