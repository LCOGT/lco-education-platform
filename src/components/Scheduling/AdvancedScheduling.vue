<script setup>
import { ref } from 'vue'
import SchedulingSettings from './SchedulingSettings.vue'
import Calendar from './Calendar.vue'

const targetsData = ref([])
const startDate = ref('')
const endDate = ref('')

// Handle each target update and store it in the array
const handleTargetUpdate = (target) => {
  const existingTarget = targetsData.value.find(t => t.name === target.name)
  if (existingTarget) {
    // Update the existing target's RA/Dec if the name matches
    existingTarget.ra = target.ra
    existingTarget.dec = target.dec
  } else {
    // Push new target if it doesn't exist in the array
    targetsData.value.push({
      ...target,
      exposures: []
    })
  }
  emitSelections()
}

const handleExposuresUpdate = (exposures) => {
  const activeTarget = targetsData.value[targetsData.value.length - 1]
  if (activeTarget) {
    activeTarget.exposures = exposures
  }
  emitSelections()
}

const handleDateRangeUpdate = (dateRange) => {
  startDate.value = dateRange[0].toISOString().split('T')[0]
  endDate.value = dateRange[1].toISOString().split('T')[0]
  emitSelections()
}

const emits = defineEmits(['selectionsComplete'])
const emitSelections = () => {
  if (targetsData.value.length > 0 && startDate.value && endDate.value) {
    emits('selectionsComplete', {
      targets: targetsData.value,
      startDate: startDate.value,
      endDate: endDate.value
    })
  }
}
</script>

<template>
  <h2>Photon Ranch</h2>
  <h4>Scheduling Observations</h4>

  <SchedulingSettings
    :show-project-field="true"
    :show-title-field="true"
    @targetUpdated="handleTargetUpdate"
    @exposuresUpdated="handleExposuresUpdate"
  />

  <Calendar @updateDateRange="handleDateRangeUpdate" />
</template>

<style scoped>
h2 {
  margin-top: 1em;
}
.input-wrapper {
  margin: 1em;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.p-text {
  margin-right: 1em;
  font-size: 1.2em;
  cursor: default;
}
.scheduling-inputs {
  padding: 0.5em;
  box-sizing: border-box;
  border: 1px solid gray;
  border-radius: 0.2em;
}
</style>
