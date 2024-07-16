<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'
import { computed } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { formatDate } from '../../utils/formatTime.js'

const sessionsStore = useSessionsStore()

const observations = computed(() => {
  const now = new Date()
  // Current time minus 16 minutes
  const cutoffTime = new Date(now.getTime() - 16 * 60 * 1000)
  if (sessionsStore.sessions.results) {
    return sessionsStore.sessions.results
      .filter(obs => new Date(obs.start) < cutoffTime)
      .slice().sort((a, b) => {
        return new Date(b.start) - new Date(a.start)
      })
  } else {
    return []
  }
})

</script>

<template>
    <div class="container" v-for="obs in observations" :key="obs.id">
        <h3>{{ formatDate(obs.start) }}</h3>
        <div class="columns is-multiline">
            <div class="column is-one-quarter-desktop is-half-tablet" v-for="id in obs" :key="id">
            <figure class="image is-square">
                <img :src="thumbnail" class="thumbnail" />
            </figure>
        </div>
    </div>
    </div>
</template>
