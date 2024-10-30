<script setup>
import { computed } from 'vue'
import { useObsPortalDataStore } from '../../../stores/sessions'
import sites from '../../../utils/sites.JSON'

const obsPortalDataStore = useObsPortalDataStore()

const selectedSession = obsPortalDataStore.currentSession

const siteInfo = computed(() => {
  if (selectedSession && selectedSession.site) {
    return sites[selectedSession.site]
  }
  return null
})

const iframeSrc = computed(() => {
  if (siteInfo.value) {
    return `https://embed.windy.com/embed2.html?lat=${siteInfo.value.lat}&lon=${siteInfo.value.lon}&zoom=7&level=surface&overlay=clouds&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&detailLat=${siteInfo.value.lat}&detailLon=${siteInfo.value.lon}&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`
  }
  return ''
})
</script>

<template>
    <div class="windy-container">
      <iframe
        style="width: 100%; height: 100%;"
        :src="iframeSrc"
        frameborder="0"
      ></iframe>
    </div>
  </template>

<style scoped>
.windy-container {
height: 80vh;
width: 100%;
}
</style>
