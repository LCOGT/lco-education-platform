<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import SchedulingSettings from './SchedulingSettings.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import Calendar from './Calendar.vue'
import CadenceSettings from './CadenceSettings.vue'
import StepNavigation from '../Global/StepNavigation.vue'
import { useProposalStore } from '../../stores/proposalManagement.js'

const proposalStore = useProposalStore()

const targetsData = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedProposal = ref('')
const selectedObject = ref('')
const step = ref(1)
const cadencePayload = ref(null)
const isCadenceValid = ref(false)
const cadenceSelection = ref('none')

// const canAddCadence = computed(() => targetsData.value.length === 1 && step.value === 5)
const canAddCadence = computed(() =>
  step.value === 5 &&
  targetsData.value.length === 1 &&
  targetsData.value[0].exposures &&
  targetsData.value[0].exposures.length > 0
)
const canAddAnotherTarget = computed(() => targetsData.value.length === 0 || cadenceSelection.value === 'none' || cadenceSelection.value === null || canAddCadence.value === false)

const emits = defineEmits(['selectionsComplete', 'cadenceValid'])

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
      dec: targetUpdate.dec,
      simbadResponse: selectedObject.value === 'nonsidereal' ? targetUpdate.simbadResponse : {}
    }
  } else {
    // Fallback: look for an existing target with the same name and update it.
    const existingTarget = targetsData.value.find(t => t.name === targetUpdate.name)
    if (existingTarget) {
      existingTarget.ra = targetUpdate.ra
      existingTarget.dec = targetUpdate.dec
      existingTarget.simbadResponse = selectedObject.value === 'nonsidereal' ? targetUpdate.simbadResponse : {}
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
  step.value = 4
}

const emitSelections = () => {
  let isThisACadenceRequest = false
  const payload = {
    targets: targetsData.value,
    startDate: startDate.value,
    endDate: endDate.value,
    proposal: selectedProposal.value,
    objectType: selectedObject.value
  }
  if (cadencePayload.value) {
    payload.cadence = cadencePayload.value
    isThisACadenceRequest = true
  }

  const isComplete =
    step.value === 5 &&
    targetsData.value.length > 0 &&
    startDate.value &&
    endDate.value &&
    selectedProposal.value &&
    targetsData.value.every(target => target.exposures.length > 0)

  emits('selectionsComplete', { ...payload, complete: isComplete, isCadenceRequest: isThisACadenceRequest })
}

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

const handleDisplay = (display) => {
  step.value = display
  emitSelections()
  emits('updateDisplay', display)
}

const handleObjectSelection = (object) => {
  selectedObject.value = object
  step.value = 3
  emitSelections()
}

const handleCadencePayload = (payload) => {
  cadencePayload.value = payload
  emitSelections()
}

const handleCadenceSelection = (val) => {
  cadenceSelection.value = val
  emits('cadenceSelection', val)
  if (val === 'none' || targetsData.value.length === 0) {
    cadencePayload.value = null
    isCadenceValid.value = false
    emitSelections()
  }
}

const disableNextStepBtn = computed(() => {
  if (step.value === 1 && !selectedProposal.value) return true
  if (step.value === 2 && !selectedObject.value) return true
  if (step.value === 3 && (!startDate.value || !endDate.value)) return true
  if (step.value === 4 && targetsData.value.length === 0) return true
  if (step.value === 5) return true
  return false
})

onMounted(() => {
  if (proposalStore.proposalsWithNormalTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithNormalTimeAllocation[0].id
    step.value = 2
  }
})

</script>

<template>
  <ProposalDropdown v-if="hasManyProposals && step === 1" :isItRealTime="false" @selectionsComplete="handleProposalSelection"/>
  <div v-if="step === 2" class="field is-horizontal">
    <div class="button btn" @click="handleObjectSelection('nonsidereal')">Solar System Object</div>
    <div class="button btn" @click="handleObjectSelection('sidereal')">Outer Space Object</div>
  </div>
  <Calendar @updateDateRange="handleDateRangeUpdate" v-if="step === 3"/>
  <SchedulingSettings v-if="selectedProposal && step >= 4"
    :current-step="step"
    :show-project-field="true"
    :show-title-field="true"
    :start-date="startDate"
    :end-date="endDate"
    :object-type="selectedObject"
    :can-add-another-target="canAddAnotherTarget"
    @targetUpdated="handleTargetUpdate"
    @exposuresUpdated="handleExposuresUpdate"
    @updateDisplay="handleDisplay"
    @targetListUpdated="targetsData = [...$event]"
    @cadenceSelection="handleCadenceSelection"
  />
    <CadenceSettings
      v-if="canAddCadence"
      :start-date="startDate"
      :end-date="endDate"
      @buildCadencePayload="handleCadencePayload"
      @cadenceValid="val => { isCadenceValid = val; emits('cadenceValid', val) }"
      @cadenceSelection="val => { cadenceSelection = val; emits('cadenceSelection', val); handleCadenceSelection(val) }"
    />
  <StepNavigation
  :show-previous="step >= 2"
  :show-next="step >= 3 && step < 5"
  :disable-next-step-btn="disableNextStepBtn"
  @previous="handleDisplay(step - 1)"
  @next="handleDisplay(step + 1)"

  />
</template>

<style scoped>
.btn {
  margin: 0.5em;
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
