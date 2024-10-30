<script setup>
import { computed } from 'vue'
import { useObsPortalDataStore } from '../../stores/sessions'
import sites from '../../utils/sites.JSON'
import WindyMap from './GlobeMap/WindyMap.vue'

const obsPortalDataStore = useObsPortalDataStore()

const selectedSession = obsPortalDataStore.currentSession

const lat = computed(() => sites[selectedSession.site]?.lat)
const lon = computed(() => sites[selectedSession.site]?.lon)

</script>

<template>
  <div class="content">
    <WindyMap :lat="lat" :lon="lon"/>
  </div>
</template>
