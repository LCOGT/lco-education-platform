<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import SchedulingSettings from './SchedulingSettings.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import Calendar from './Calendar.vue'
import CadenceSettings from './CadenceSettings.vue'
import StepNavigation from '../Global/StepNavigation.vue'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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

const canAddCadence = computed(() =>
  step.value === 5 &&
  targetsData.value.length === 1 &&
  targetsData.value[0].exposures &&
  targetsData.value[0].exposures.length > 0
)
const canAddAnotherTarget = computed(() => targetsData.value.length === 0 || cadenceSelection.value === 'none' || cadenceSelection.value === null || canAddCadence.value === false)
const showReviewSelections = computed(() =>
  step.value === 5 &&
  targetsData.value.length > 0 &&
  startDate.value &&
  endDate.value &&
  targetsData.value.every(target => target.exposures.length > 0)
)
// For step 5, if there are multiple targets, we want to use the wide layout for selected targets to give more room for exposure settings
const useWideSelectedTargetsLayout = computed(() =>
  step.value === 5 && targetsData.value.length > 1
)

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
  <div v-if="step === 2" class="object-selection">
    <h3 class="section-title">Select Object Type</h3>
    <div class="object-selection-buttons">
      <div class="button btn" @click="handleObjectSelection('nonsidereal')">Solar System Object</div>
      <div class="button btn" @click="handleObjectSelection('sidereal')">Outer Space Object</div>
    </div>
  </div>
  <Calendar @updateDateRange="handleDateRangeUpdate" v-if="step === 3"/>
  <div v-if="selectedProposal && step >= 4" class="advanced-layout">
    <SchedulingSettings
      class="advanced-settings"
      :class="{ 'advanced-settings--wide': useWideSelectedTargetsLayout }"
      :current-step="step"
      :show-project-field="true"
      :show-title-field="true"
      :start-date="startDate"
      :end-date="endDate"
      :object-type="selectedObject"
      :can-add-another-target="canAddAnotherTarget"
      :use-wide-selected-targets-layout="useWideSelectedTargetsLayout"
      @targetUpdated="handleTargetUpdate"
      @exposuresUpdated="handleExposuresUpdate"
      @updateDisplay="handleDisplay"
      @targetListUpdated="targetsData = [...$event]"
      @cadenceSelection="handleCadenceSelection"
    />
    <div v-if="canAddCadence" class="advanced-sidebar">
      <CadenceSettings
        class="advanced-panel"
        :start-date="startDate"
        :end-date="endDate"
        @buildCadencePayload="handleCadencePayload"
        @cadenceValid="val => { isCadenceValid = val; emits('cadenceValid', val) }"
        @cadenceSelection="val => { cadenceSelection = val; emits('cadenceSelection', val); handleCadenceSelection(val) }"
      />
    </div>
  </div>
  <div v-if="showReviewSelections" class="grey-bg content px-2 py-2 review-selections">
    <h4>Review Your Selections</h4>
        <div class="columns">
          <div class="column is-half">
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-gear" class="blue review-icon" />
              </span>
              <span>Any 0.35m telescope</span>
            </span>
            <p></p>
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-calendar-days" class="blue review-icon" />
              </span>
              <span>Between {{ startDate }} and {{ endDate }}</span>
            </span>
          </div>
          <div class="column">
            <div class="icon-text review-details">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-sliders" class="blue review-icon" />
              </span>
              <div class="icon-text-list review-list">
                <ul>
                  <li v-for="(target, idx) in targetsData" :key="idx">
                    {{ target.name }}:
                    <span v-for="(settings, sIdx) in target.exposures" :key="sIdx">
                      {{ settings.count }} x {{ settings.exposureTime }}s with {{ settings.filter }} filter<span v-if="sIdx < target.exposures.length - 1">, </span>
                    </span>
                  </li>
                </ul>
                <div v-if="cadencePayload && cadencePayload.period && cadencePayload.jitter" class="cadence-summary">
                  <ul><li>Cadence settings: a period of {{ cadencePayload.period }} hour<span v-if="cadencePayload.period > 1">s</span> with a {{ cadencePayload.jitter }} hour jitter</li></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  <StepNavigation
    :show-previous="step >= 2"
    :show-next="step >= 3 && step < 5"
    :disable-next-step-btn="disableNextStepBtn"
    @previous="handleDisplay(step - 1)"
    @next="handleDisplay(step + 1)"
    class="step-nav"
  />
</template>

<style scoped>
.section-title {
  margin-top: 0;
  margin-bottom: 1rem;
}
.btn {
  margin: 0.5em;
}
.object-selection {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.object-selection-buttons {
  display: flex;
  flex-wrap: wrap;
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
.advanced-layout {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 3.75rem;
  row-gap: 2rem;
  align-items: start;
  margin-top: 0;
  padding-top: 0.75rem;
}
.advanced-settings {
  grid-column: 1 / span 2;
  min-width: 0;
}
.advanced-settings--wide {
  grid-column: 1 / -1;
}
.advanced-settings :deep(.columns) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 3.75rem;
  row-gap: 2rem;
  margin: 0;
  align-items: start;
}
.advanced-settings :deep(.column.is-one-third) {
  width: auto;
  flex: 1 1 auto;
  padding: 0;
}
.advanced-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  padding-top: 0;
}
.advanced-panel {
  width: 100%;
}
.step-nav {
  z-index: 100;
}
.review-selections {
  margin-top: 1.25rem;
  margin-bottom: 0;
  padding-bottom: 0.75rem !important;
}
.review-icon {
  font-size: 1.35rem;
}
.review-details {
  align-items: flex-start;
}
.review-list ul {
  list-style: none;
  margin: 0;
  padding-left: 0;
}
.review-list li {
  margin: 0;
  line-height: 1.35;
}
.review-list li + li,
.cadence-summary {
  margin-top: 0.35rem;
}

@media (max-width: 1023px) {
  .advanced-layout {
    grid-template-columns: 1fr;
  }

  .advanced-settings {
    grid-column: auto;
  }

  .advanced-settings :deep(.columns) {
    grid-template-columns: 1fr;
  }
}
</style>
