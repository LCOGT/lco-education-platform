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
const errorMessage = ref(null)
const selectedSite = ref(null)
const availableTimes = ref({})
const localTimes = ref([])

const emits = defineEmits(['timeSelected'])

const hasAvailableTimes = computed(() => {
  return Object.keys(availableTimes.value).length > 0
})

// Rounds times from ocs to the nearest 15 minutes
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
    current = new Date(current.getTime() + 15 * 60 * 1000)
  }
  return intervals
}

function processTelescopeAvailability (data) {
  const processedData = {}

  // Loops through each telescope in the input data
  Object.keys(data).forEach(telescope => {
    // Loops through each time range for the current telescope
    data[telescope].forEach(range => {
      // Converts the start and end times to Date objects
      const start = new Date(range[0])
      const end = new Date(range[1])

      const roundedStart = roundToNearest15Minutes(start, 'up')
      const roundedEnd = roundToNearest15Minutes(end, 'down')

      // Generates 15-minute intervals between the rounded start and end times
      generate15MinuteIntervals(roundedStart, roundedEnd).forEach(interval => {
        const dateStr = interval.split('T')[0]
        // Initializes an array for the date if it doesn't exist
        if (!processedData[dateStr]) {
          processedData[dateStr] = []
        }

        // Adds the interval, telescope, and location to the processed data
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

// Filters out duplicate times and returns an array of unique local times
const getUniqueLocaleTimes = (times) => {
  const uniqueTimes = new Set()
  // Iterates over each time object
  times.forEach(({ time }) => {
    const localTime = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // Adds the local time to the set (duplicates will be automatically ignored)
    uniqueTimes.add(localTime)
  })
  return Array.from(uniqueTimes)
}

// Watches the date and updates the available times for that date
watch(date, (newDate) => {
  if (newDate) {
    const dateStr = new Date(newDate).toISOString().split('T')[0]
    const timesForDate = availableTimes.value[dateStr] || []
    localTimes.value = getUniqueLocaleTimes(timesForDate)
  }
})

// Forcefully refreshes the available times for the selected date
// This is used when the user selects a date, then a time, then the map appears
// and they want to change the time but want the same date
const refreshTimes = () => {
  if (date.value) {
    startTime.value = null
    resetSession()
  }
}

const resetSession = () => {
  errorMessage.value = null
  selectedSite.value = null
  sessionsStore.currentSessionId = null
}

const blockRti = async () => {
  // Gets the start and end times for the session
  const start = formatToUTC(date.value, startTime.value)
  const startDateTime = new Date(start)
  const endDateTime = new Date(startDateTime.getTime() + 15 * 60 * 1000)
  const end = endDateTime.toISOString().split('.')[0] + 'Z'

  const requestBody = {
    proposal: 'LCOSchedulerTest',
    name: 'Test Real Time',
    // sometimes the site is not valid, so for now I'm hardcoding 'tst'
    // site: selectedSite.value.site,
    site: 'tst',
    enclosure: 'clma',
    telescope: '2m0a',
    start,
    end
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

// Used to block out dates that are not in the availableTimes object from the date picker
const isDateAllowed = (date) => {
  // Gets the dates from availableTimes
  const availableDates = Object.keys(availableTimes.value)
  const firstDate = new Date(Math.min(...availableDates.map(date => new Date(date))))
  const lastDate = new Date(Math.max(...availableDates.map(date => new Date(date))))
  return date >= firstDate && date <= lastDate
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
        <v-date-picker v-model="date" class="blue-bg" :allowed-dates="isDateAllowed" @click="refreshTimes"/>
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
