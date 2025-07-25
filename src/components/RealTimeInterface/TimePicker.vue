<script setup>
import { ref, watch, defineEmits, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { fetchApiCall } from '../../utils/api'
import { formatToUTC, formatDateTime } from '../../utils/formatTime.js'
import { useConfigurationStore } from '../../stores/configuration'
import { useProposalStore } from '../../stores/proposalManagement.js'
import LeafletMap from './GlobeMap/LeafletMap.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import sites from '../../utils/sites.JSON'
import oggFlag from '@/assets/Icons/ogg_flag.png'
import cojFlag from '@/assets/Icons/coj_flag.png'
import tfnFlag from '@/assets/Icons/tfn_flag.svg'
import cptFlag from '@/assets/Icons/cpt_flag.svg'
import elpFlag from '@/assets/Icons/elp_flag.png'
import lscFlag from '@/assets/Icons/lsc_flag.png'

const router = useRouter()
const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()
const proposalStore = useProposalStore()

const date = ref(null)
const dateStr = computed(() => { return date.value.toDateString() })
const startTime = ref(null)
const errorMessage = ref(null)
const selectedSite = ref(null)
const availableTimes = ref({})
const localTimes = ref([])
const selectedProposal = ref()
const timeInterval = 15
const today = ref(new Date())
const oneWeekFromNow = new Date()
oneWeekFromNow.setDate(today.value.getDate() + 7)
const bookingInProgess = ref(null)

const emits = defineEmits(['timeSelected'])

// Loads template only after the obs portal has returned available times
const hasAvailableTimes = computed(() => {
  return Object.keys(availableTimes.value).length > 0
})
// Rounds times from the obs portal to the nearest 15 minutes (for now) because they are in time ranges
function roundToNearestMinutes (date, direction = 'up', minutes = timeInterval) {
  const ms = 1000 * 60 * minutes
  const roundedDate = new Date(Math[direction === 'up' ? 'ceil' : 'floor'](date.getTime() / ms) * ms)
  return roundedDate
}
// Because we get availability in ranges, we need to generate all the 15 minute intervals within those ranges
function generateTimeIntervals (startDate, endDate) {
  const intervals = []
  let current = new Date(startDate)
  while (current < endDate) {
    intervals.push(new Date(current))
    current = new Date(current.getTime() + timeInterval * 60 * 1000)
  }
  return intervals
}
// Processes the telescope availability data from the obs portal
function processTelescopeAvailability (data) {
  const processedData = {}
  // Iterates over the data object to extract the telescope availability ranges
  Object.keys(data).forEach(telescope => {
    // Iterates over the ranges for each telescope
    data[telescope].forEach(range => {
      const start = new Date(range[0])
      const end = new Date(range[1])
      const roundedStart = roundToNearestMinutes(start, 'up', timeInterval)
      const roundedEnd = roundToNearestMinutes(end, 'down', timeInterval)
      // Generates time intervals between the start and end times
      generateTimeIntervals(roundedStart, roundedEnd).forEach(interval => {
        const dateStr = interval.toDateString()
        const time = interval
        // Splits the telescope identifier into size, enclosure, and site
        const [telescopeSize, enclosure, site] = telescope.split('.')
        // Initializes an object for the date if it doesn't exist
        if (!processedData[dateStr]) {
          processedData[dateStr] = {}
        }
        // Initializes an object for the time if it doesn't exist
        if (!processedData[dateStr][time]) {
          processedData[dateStr][time] = { resources: [] }
        }
        // Adds telescope details to the resources array
        processedData[dateStr][time].resources.push({
          site,
          enclosure,
          telescope: telescopeSize
        })
      })
    })
  })
  // group the available‑times for the selected date by site
  // processedData looks like this:
  // // This is the selected date
  // { Fri Aug 02 2024: {
  // // This is the first time interval
  // Thu Aug 01 2024 11:00:00 GMT-0700 (Pacific Daylight Time): {
  //     "resources": [
  //         {
  //             "site": "coj",
  //             "enclosure": "clma",
  //             "telescope": "0m4a"
  //         },
  //         {
  //             "site": "coj",
  //             "enclosure": "clma",
  //             "telescope": "0m4b"
  //         },
  //         {
  //             "site": "cpt",
  //             "enclosure": "aqwa",
  //             "telescope": "0m4a"
  //         }
  //     ]
  //    },
  // // next time interval
  // Thu Aug 01 2024 11:15:00 GMT-0700 (Pacific Daylight Time): {
  // etc...
  return processedData
}
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
  realTimeSessionsStore.currentSessionId = null
}

const blockRti = async () => {
  bookingInProgess.value = true
  // Gets the start and end times for the session
  const start = formatToUTC(startTime.value)
  const startDateTime = new Date(start)
  const endDateTime = new Date(startDateTime.getTime() + timeInterval * 60 * 1000)
  const end = endDateTime.toISOString().split('.')[0] + 'Z'
  let enclosure = null
  let telescope = null
  // The following code is temporary since the user cannot select telescope and enclosure
  // Finds the matching entry in availableTimes
  const dateString = dateStr.value
  // Get the available time entries for the selected date
  const timeEntries = availableTimes.value[dateString]
  if (timeEntries) {
    Object.keys(timeEntries).forEach(timeKey => {
      const timeObj = new Date(timeKey)
      // Checks if the time matches the selected start time
      if (timeObj.getTime() === startDateTime.getTime()) {
        // Gets the resources available at this time
        const resources = timeEntries[timeKey].resources
        // Finds the resource that matches the selected site
        const matchedResource = resources.find(resource => resource.site === selectedSite.value.site)
        if (matchedResource) {
          // Gets enclosure and telescope from matchedResource
          enclosure = matchedResource.enclosure
          telescope = matchedResource.telescope
        }
      }
    })
  }
  if (!enclosure || !telescope) {
    bookingInProgess.value = false
    errorMessage.value = 'Failed to find a matching telescope and enclosure for the selected site and time'
    return
  }
  const requestBody = {
    proposal: selectedProposal.value,
    name: `Live-${startDateTime.toISOString().split('T')[0].replace(/-/g, '')}-${selectedSite.value.site}`,
    site: selectedSite.value.site,
    enclosure,
    telescope,
    start,
    end
  }
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + 'realtime/',
    method: 'POST',
    body: requestBody,
    successCallback: bookDate,
    failCallback: (e) => {
      bookingInProgess.value = false
      if (e.non_field_errors && e.non_field_errors[0]?.includes('Not enough realtime')) {
        errorMessage.value = 'This project does not have any live observing credit. Choose another project.'
      } else {
        errorMessage.value = 'Failed to book session. Please select another time'
      }
    }
  })
}

const bookDate = () => {
  if (date.value && startTime.value && selectedSite.value) {
    router.push('/dashboard')
  }
}

const siteTimes = computed(() => {
  const dateKey = dateStr.value
  const daySlots = availableTimes.value[dateKey] || {}
  const groupedSiteTimes = {}
  // Iterates over the available times (dayslots) for the selected date
  // timeKey is the time in ISO format (e.g. Thu Apr 24 2025 21:45:00 GMT-0700 (Pacific Daylight Time))
  // and resources are the telescopes available per site (e.g. {site: 'tfn', enclosure: 'aqwa', telescope: '0m4a'}, {site: 'tfn', enclosure: 'aqwa', telescope: '0m4b'})
  Object.entries(daySlots).forEach(([timeKey, { resources }]) => {
    const slot = new Date(timeKey)
    resources.forEach(({ site }) => {
      // If the site is not already in the grouped object, create a new Set for it
      if (!groupedSiteTimes[site]) groupedSiteTimes[site] = new Set()
      // Adds the timestamp to the Set (automatically deduplicating [some sites have multiple telescopes and therefore more of the same time availability. So say, for example, 2 telescopes are available at 10:00, we only want to show that time once])
      groupedSiteTimes[site].add(slot.getTime())
    })
  })
  // convert sets back into sorted arrays of Date
  return Object.fromEntries(
    // Converts the grouped object into an array of entries, where each entry is an array containing the site and an array of times
    Object.entries(groupedSiteTimes).map(([site, timesSet]) => {
      const arr = Array.from(timesSet)
        .map(ms => new Date(ms))
        .sort((a, b) => a - b)
      return [site, arr]
    })
  )
})

function onTimeClick (site, time) {
  selectedSite.value = { site, lat: sites[site].lat, lon: sites[site].lon }
  startTime.value = time
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

function displaySiteName (site) {
  if (site) {
    return sites[site]?.name
  } else {
    return 'No site selected'
  }
}

const siteFlag = computed(() => {
  if (selectedSite.value) {
    switch (selectedSite.value.site) {
      case 'ogg':
        return oggFlag
      case 'coj':
        return cojFlag
      case 'tfn':
        return tfnFlag
      case 'cpt':
        return cptFlag
      case 'elp':
        return elpFlag
      case 'lsc':
        return lscFlag
      default:
        return null
    }
  }
  return null
})

// Handles both resetting the session and updating localTimes.value when the date changes
watch(date, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    startTime.value = null
    resetSession()
    const dateStr = newDate.toDateString()
    localTimes.value = Object.keys(availableTimes.value[dateStr] || {}).map(time => new Date(time))
  }
})

onMounted(() => {
  getAvailableTimes()
  if (proposalStore.proposalsWithRealTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithRealTimeAllocation[0].id
  }
})

</script>

<template>
    <h2>Book your live observing session</h2>
    <ProposalDropdown
      v-if="!selectedProposal"
      :isItRealTime="true"
      @selectionsComplete="(proposal) => { selectedProposal = proposal }"
    />
    <div class="columns">
      <div v-if="selectedProposal" class="column is-one-third">
        <h4>Select a date and time:</h4>
        <div>
          <VDatePicker
            v-model="date"
            mode="date"
            :min-date="today"
            :max-date="oneWeekFromNow"
            is-required
            @update:model-value="refreshTimes"
            expanded
          />
        </div>
        <div v-if="startTime" class="column">
          <div class="card highlight-box">
              <header class="card-header">
                <h4 class="card-header-title">Ready to book?</h4>
              </header>
              <div class="card-content">
                <div class="content">

                  <div class="media">
                    <div class="media-left">
                      <figure class="image" style="max-width:50px">
                        <img
                          :src=siteFlag
                          alt="Flag"
                        />
                      </figure>
                    </div>
                  <div class="media-content">
                  <p class="selected-datetime">
                    <span v-if="selectedSite && !errorMessage">

                      {{ displaySiteName(selectedSite.site) }} selected for
                      <time :datetime=date>{{ formatDateTime(date, { year: 'numeric', month: 'long', day: 'numeric' }) }} at
                      {{ startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</time>
                    </span>
                    <span v-else-if="selectedSite && errorMessage" class="error">{{ errorMessage }}</span>
                  </p>
                  </div>
                  </div>
                <div v-if="!bookingInProgess">
                  <div class="buttons">
                    <button
                      v-if="date && selectedSite"
                      @click="blockRti"
                      class="button blue-bg"
                    >
                      Book
                    </button>
                  </div>
                </div>
                <div v-else>
                  <v-progress-circular indeterminate color="white" model-value="20" class="loading" />
                </div>
              </div>
            </div>
            </div>
          </div>
      </div>
      <div class="column">
        <div v-if="date">
          <div v-for="(times, site) in siteTimes" :key="site" class="site-times">
            <h3>{{ displaySiteName(site) }}</h3>
            <div class="grid">
              <button
                class="button"
                v-for="time in times"
                :key="time.toISOString()"
                :class="{ 'is-selected': startTime && selectedSite?.site === site && time.getTime() === startTime.getTime() }"
                @click="onTimeClick(site, time)"
              >
                {{ time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </button>
            </div>
          </div>
          <LeafletMap
            :availableTimes="availableTimes"
            :selectedTime="startTime?.toISOString()"
            :highlightedSite="selectedSite?.site"
          />
        </div>
      </div>
    </div>
</template>

<style scoped>
.error {
  color: red;
}
.button.is-selected {
  background-color: rgb(77, 170, 233);
  color: white;
}
</style>
