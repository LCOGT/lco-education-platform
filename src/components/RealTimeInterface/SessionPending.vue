<script setup>
import { onMounted, ref, defineEmits, computed } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import sites from '../../utils/sites.JSON'
import WindyMap from './GlobeMap/WindyMap.vue'

const emits = defineEmits(['changeView'])
const sessionsStore = useSessionsStore()

const countdown = ref(100)

let countdownInterval

const selectedSession = computed(() => {
  return sessionsStore.sessions.results.find(session => session.id === sessionsStore.currentSessionId)
})

const site = computed(() => selectedSession.value?.site)
const lat = computed(() => sites[selectedSession.value?.site]?.lat)
const lon = computed(() => sites[selectedSession.value?.site]?.lon)

// TO DO: Change countdown to actual session time
onMounted(() => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
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
