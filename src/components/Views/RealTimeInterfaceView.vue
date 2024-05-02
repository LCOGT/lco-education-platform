<script setup>
import { ref } from 'vue'
import TimePicker from '../RealTimeInterface/TimePicker.vue'
import SessionPending from '../RealTimeInterface/SessionPending.vue'
import SessionStarted from '../RealTimeInterface/SessionStarted.vue'

const currentView = ref('scheduling')

const handleViewChange = (view) => {
  currentView.value = view
}

</script>

<template>
    <div>
        <TimePicker v-if="currentView === 'scheduling'" @changeView="handleViewChange" />
        <SessionPending v-else-if="currentView === 'sessionpending'" @changeView="handleViewChange" />
        <SessionStarted v-else-if="currentView === 'sessionstarted'" @changeView="handleViewChange" />
    </div>
</template>
