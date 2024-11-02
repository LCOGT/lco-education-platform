<script setup>
import { computed } from 'vue'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import sites from '../../utils/sites.JSON'
import WindyMap from './GlobeMap/WindyMap.vue'

const realTimeSessionsStore = useRealTimeSessionsStore()

const selectedSession = realTimeSessionsStore.currentSession

const lat = computed(() => sites[selectedSession.site]?.lat)
const lon = computed(() => sites[selectedSession.site]?.lon)

</script>

<template>
  <div class="content">
    <WindyMap :lat="lat" :lon="lon"/>
  </div>
</template>
