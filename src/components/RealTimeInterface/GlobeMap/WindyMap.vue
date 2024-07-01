<script setup>
import { computed } from 'vue'
import { useSessionsStore } from '../../../stores/sessions'
import sites from '../../../utils/sites.JSON'

const sessionsStore = useSessionsStore()

const selectedSession = computed(() => {
  return sessionsStore.sessions.results?.find(session => session.id === sessionsStore.currentSessionId)
})

const siteInfo = computed(() => {
  if (selectedSession.value && selectedSession.value.site) {
    return sites[selectedSession.value.site]
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
