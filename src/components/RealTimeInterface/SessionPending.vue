<script setup>
import { onMounted, ref, defineEmits, computed } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { formatCountdown } from '../../utils/formatTime.js'
import sites from '../../utils/sites.JSON'
import WindyMap from './GlobeMap/WindyMap.vue'

const emits = defineEmits(['changeView'])
const sessionsStore = useSessionsStore()

const countdown = ref('')
const countdownSeconds = ref(0)

let countdownInterval

// move to session store as a getter
const selectedSession = computed(() => {
  return sessionsStore.sessions.results.find(session => session.id === sessionsStore.currentSessionId)
})

const site = computed(() => selectedSession.value?.site)
const lat = computed(() => sites[selectedSession.value?.site]?.lat)
const lon = computed(() => sites[selectedSession.value?.site]?.lon)

onMounted(() => {
  const sessionStartTime = new Date(selectedSession.value?.start).getTime()
  countdownInterval = setInterval(() => {
    const currentTime = new Date().getTime()
    countdownSeconds.value = Math.floor((sessionStartTime - currentTime) / 1000)
    countdown.value = formatCountdown(countdownSeconds.value)
    if (countdownSeconds.value <= 0) {
      clearInterval(countdownInterval)
      emits('changeView', 'sessionstarted')
    }
  }, 1000)
})
</script>

<template>
  <div class="content">
    <h2>Session Not Started</h2>
    <p>You are controlling the telescope in {{ site }}</p>
    <p><span class="green-bg px-2 py-2">Session starts in {{ countdown }}</span></p>
    <WindyMap :lat="lat" :lon="lon"/>
  </div>
</template>
