<script setup>
import { ref, onMounted, nextTick } from 'vue'
import SchedulingSettings from './SchedulingSettings.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import Calendar from './Calendar.vue'
import { useProposalStore } from '../../stores/proposalManagement.js'

const proposalStore = useProposalStore()

const targetsData = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedProposal = ref()

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
  // Use nextTick to wait for target update
  nextTick(() => {
    const activeTarget = targetsData.value[targetsData.value.length - 1]
    if (activeTarget) {
      activeTarget.exposures = exposures
    } else {
      return
    }
    emitSelections()
  })
}

const handleDateRangeUpdate = (dateRange) => {
  startDate.value = dateRange.start.toISOString().split('T')[0]
  endDate.value = dateRange.end.toISOString().split('T')[0]
  emitSelections()
}

const emits = defineEmits(['selectionsComplete'])
const emitSelections = () => {
  if (targetsData.value.length > 0 && startDate.value && endDate.value && selectedProposal.value) {
    emits('selectionsComplete', {
      targets: targetsData.value,
      startDate: startDate.value,
      endDate: endDate.value,
      proposal: selectedProposal.value
    })
  }
}

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

const step = ref(1)

const handleDisplay = (display) => {
  step.value = display
}

onMounted(() => {
  if (proposalStore.proposalsWithNormalTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithNormalTimeAllocation[0].id
  }
})
</script>

<template>
  <h2>Request an Observation</h2>
  <ProposalDropdown v-if="hasManyProposals && step===1" :isItRealTime="false" @selectionsComplete="(proposal) => { selectedProposal = proposal }"/>
  <SchedulingSettings
    :show-project-field="true"
    :show-title-field="true"
    @targetUpdated="handleTargetUpdate"
    @exposuresUpdated="handleExposuresUpdate"
    @updateDisplay="handleDisplay"
  />
  <Calendar @updateDateRange="handleDateRangeUpdate" v-if="step===3"/>
</template>

<style scoped>

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
