<script setup>
import { computed } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import sites from '../../utils/sites.JSON'
import WindyMap from './GlobeMap/WindyMap.vue'
const sessionsStore = useSessionsStore()

const selectedSession = sessionsStore.currentSession

const lat = computed(() => sites[selectedSession.site]?.lat)
const lon = computed(() => sites[selectedSession.site]?.lon)

</script>

<template>
  <div class="content">
    <WindyMap :lat="lat" :lon="lon"/>
  </div>
</template>
