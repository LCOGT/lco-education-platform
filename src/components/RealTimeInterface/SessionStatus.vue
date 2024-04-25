<script setup>
import { ref } from 'vue'
import SessionPending from './SessionPending.vue'
import SessionStarted from './SessionStarted.vue'

const sessionStatus = ref('pending')

const updateSessionStatus = (newStatus) => {
  sessionStatus.value = newStatus
}
</script>

<template>
<div>
  <div v-if="sessionStatus === 'pending'">
    <SessionPending @update-status="updateSessionStatus" />
  </div>
  <div v-else-if="sessionStatus === 'started'">
    <SessionStarted />
  </div>
</div>
</template>
