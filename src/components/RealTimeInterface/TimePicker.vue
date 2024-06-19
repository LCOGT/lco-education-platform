<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '../../stores/sessions'
import { useUserDataStore } from '../../stores/userData'
import { fetchApiCall } from '../../utils/api'
import LeafletMap from './GlobeMap/LeafletMap.vue'

const router = useRouter()
const sessionsStore = useSessionsStore()
const userDataStore = useUserDataStore()

const apitoken = userDataStore.authToken

const date = ref(null)
const time = ref(null)
const emits = defineEmits(['changeView'])

const toIsoDate = computed(() => {
  if (date.value) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.value.toLocaleDateString('en-US', options)
  }
  return null
})

// TO DO: Get times from API
const times = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

const selectTime = (selectedTime) => {
  time.value = selectedTime
}

const resetSession = () => {
  sessionsStore.selectedSite = null
  sessionsStore.currentSessionId = null
}

const blockRti = async () => {
  // const selectedDate = new Date(date.value).toISOString().split('T')[0]
  // const startDate = `${selectedDate}T${time.value}:00Z`
  // const endDate = `${selectedDate}T${time.value}:50Z`
  const requestBody = {
    proposal: 'LCOSchedulerTest',
    name: 'Test Real Time',
    site: 'tst',
    enclosure: 'doma',
    telescope: '1m0a',
    start: '2024-06-29T00:00:00Z',
    end: '2024-06-29T00:30:00Z'
  }
  await fetchApiCall({ url: 'http://observation-portal-dev.lco.gtn/api/realtime/', method: 'POST', body: requestBody, successCallback: () => router.push('/dashboard'), failCallback: handleError })
}

const handleError = (error) => {
  console.error('API call failed with error:', error)
}

const bookDate = () => {
  const selectedSite = sessionsStore.selectedSite
  if (date.value && time.value && selectedSite) {
    const newSession = {
      date: date.value,
      time: time.value,
      site: selectedSite.site,
      location: {
        latitude: selectedSite.lat,
        longitude: selectedSite.lon
      },
      type: 'realtime'
    }
    sessionsStore.addSession(newSession)
    blockRti()
    // emits('changeView', 'sessionpending')
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
      <p>Select a date and time:</p>
      <div>
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
      <div v-if="toIsoDate && time" class="column">
        <p class="selected-datetime">
          <span v-if="sessionsStore.selectedSite">{{ sessionsStore.selectedSite.site }} Selected for {{ toIsoDate }} at {{ time }}</span>
          <span v-else>Click on a pin to book for {{ toIsoDate }} at {{ time }}</span>
        </p>
        <v-btn variant="tonal" v-if="date && sessionsStore.selectedSite" @click="bookDate" class="blue-bg">Book</v-btn>
      </div>
      <LeafletMap v-if="toIsoDate && time" />
    </div>
  </div>
</template>
