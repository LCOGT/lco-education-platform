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
const selectedProposal = ref('')
const step = ref(1)

const handleProposalSelection = (proposal) => {
  // Only advance step if still on step 1
  if (step.value === 1) {
    selectedProposal.value = proposal
    step.value = 2 // Move to the next step
  } else {
    // Just update the proposal without advancing steps
    selectedProposal.value = proposal
  }
}

const handleTargetUpdate = (targetUpdate) => {
  // If an index was passed and it exists in targetsData, update that entry.
  if (targetsData.value[targetUpdate.index]) {
    targetsData.value[targetUpdate.index] = {
      ...targetsData.value[targetUpdate.index],
      name: targetUpdate.name,
      ra: targetUpdate.ra,
      dec: targetUpdate.dec
    }
  } else {
    // Fallback: look for an existing target with the same name and update it.
    const existingTarget = targetsData.value.find(t => t.name === targetUpdate.name)
    if (existingTarget) {
      existingTarget.ra = targetUpdate.ra
      existingTarget.dec = targetUpdate.dec
    } else {
      // If no match, push a new target.
      targetsData.value.push({
        ...targetUpdate,
        exposures: []
      })
    }
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

const handleDisplay = (display) => {
  step.value = display
  emits('updateDisplay', display)
}

onMounted(() => {
  if (proposalStore.proposalsWithNormalTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithNormalTimeAllocation[0].id
    step.value = 2
  }
})
</script>

<template>
  <ProposalDropdown v-if="hasManyProposals && step===1" :isItRealTime="false" @selectionsComplete="handleProposalSelection"/>
  <SchedulingSettings v-if="selectedProposal && step!== 1"
    :show-project-field="true"
    :show-title-field="true"
    @targetUpdated="handleTargetUpdate"
    @exposuresUpdated="handleExposuresUpdate"
    @updateDisplay="handleDisplay"
  />
  <Calendar @updateDateRange="handleDateRangeUpdate" v-if="step===4"/>
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
