<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Calendar from './Calendar.vue'
import SchedulingSettings from './SchedulingSettings.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import { fetchApiCall } from '../../utils/api.js'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { calculateSchedulableTargets } from '../../utils/visibility.js'
import targets from '../../utils/targets.min.json'
import { ca } from 'date-fns/locale'

const emits = defineEmits(['selectionsComplete', 'showButton'])
const proposalStore = useProposalStore()

const beginner = ref()
const dateRange = ref()
const objectSelection = ref('')
const objectSelected = ref(false)
const targetSelection = ref('')
const targetSelected = ref(false)
const targetList = ref({})
const targetsByType = ref([])
const exposureSettings = ref([])
const defaultSettings = ref([])
const loading = ref(false)
const selectedTargets = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedProposal = ref()
const displayedTargets = ref([])
const totalLoaded = ref(3)
const allCategoryTargets = ref({})
const currentStep = ref(1)

const nextStep = () => {
  currentStep.value += 1
}

const previousStep = () => {
  loading.value = false
  // Prevents `Submit my request` button from showing when going back
  emits('showButton', false)
  if (currentStep.value > 1) currentStep.value -= 1
  // Handles specific cases for going back: when user goes from a selected target to seeing the 3 targets
  if (currentStep.value === 4) {
    if (!objectSelection.value || !objectSelection.value.targets) {
      displayedTargets.value = objectSelection.value.slice(0, 3)
    }
  }
}

const categories = ref([
  {
    location: 'Deep Space',
    options: [
      { name: 'Galaxy', icon: require('@/assets/Icons/galaxy.png'), shortname: 'galaxies' },
      { name: 'Star Cluster', icon: require('@/assets/Icons/star-cluster.png'), shortname: 'clusters' },
      { name: 'Supernova', icon: require('@/assets/Icons/supernova.png'), shortname: 'supernovae' },
      { name: 'Nebula', icon: require('@/assets/Icons/nebula.png'), shortname: 'nebulae' }
    ]
  }
])

const handleObjectSelection = (shortname, name) => {
  objectSelection.value = targetList.value[shortname]
  objectSelected.value = name

  displayedTargets.value = objectSelection.value.slice(0, 3)
  totalLoaded.value = 3
  nextStep()
}

const shuffleTargets = () => {
  const currentCategoryTargets = objectSelection.value || []
  if (currentCategoryTargets.length === 0) return

  // Shuffle the full list of targets for this category and take the first 3
  const shuffled = [...currentCategoryTargets].sort(() => Math.random() - 0.5).slice(0, 3)
  displayedTargets.value = shuffled.map(target => ({
    name: target.name,
    desc: target.desc,
    filters: target.filters,
    ra: target.ra,
    dec: target.dec
  }))
}

const loadMoreTargets = () => {
  const currentCategoryTargets = objectSelection.value || []
  if (currentCategoryTargets.length === 0) return

  // Calculate the new total to load, up to a maximum of 15 or the total number of targets
  const maxNumberOfTargets = 15
  const newTotalLoaded = Math.min(totalLoaded.value + 3, currentCategoryTargets.length, maxNumberOfTargets)
  displayedTargets.value = currentCategoryTargets.slice(0, newTotalLoaded).map(target => ({
    name: target.name,
    desc: target.desc,
    filters: target.filters,
    ra: target.ra,
    dec: target.dec
  }))
  totalLoaded.value = newTotalLoaded
}

const emitSelections = () => {
  emits('selectionsComplete', {
    target: targetSelection.value,
    settings: exposureSettings.value,
    startDate: startDate.value,
    endDate: endDate.value,
    proposal: selectedProposal.value
  })
}

const handleTargetSelection = (target) => {
  targetSelection.value = target
  targetSelected.value = true
  defaultSettings.value = target.filters.map(filter => ({
    filter: filter.name,
    exposureTime: filter.exposure,
    saved: true
  }))
  exposureSettings.value = [...defaultSettings.value]
  emitSelections()
  nextStep()
}

const getSchedulableTargets = (startDate, endDate) => {
  loading.value = true
  targetList.value = calculateSchedulableTargets(targets, startDate, endDate)
  loading.value = false
}

const handleDateRangeUpdate = (newDateRange) => {
  dateRange.value = newDateRange
  startDate.value = newDateRange.start.toISOString().split('.')[0]
  endDate.value = newDateRange.end.toISOString().split('.')[0]
  getSchedulableTargets(newDateRange.start, newDateRange.end)
  nextStep()
}

const resetSelections = () => {
  objectSelection.value = ''
  objectSelected.value = false
  targetSelection.value = ''
  targetSelected.value = false
  beginner.value = ''
  emits('showButton', false)
  previousStep()
}

const letMeChoose = () => {
  beginner.value = false
  exposureSettings.value = []
  emitSelections()
  emits('showButton', true)
}

const useDefaults = () => {
  beginner.value = true
  exposureSettings.value.splice(0)
  exposureSettings.value.push(...defaultSettings.value)
  emits('showButton', true)
}

const handleExposuresUpdate = (exposures) => {
  exposureSettings.value = exposures
  emitSelections()
}

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

onMounted(() => {
  if (proposalStore.proposalsWithNormalTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithRealTimeAllocation[0].id
  }
})

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading" />
  </template>
  <div class="container">
    <div v-if="!dateRange || currentStep === 1">
      <ProposalDropdown v-if="hasManyProposals" :isItRealTime="false" @selectionsComplete="(proposal) => { selectedProposal = proposal; nextStep() }" />
    </div>
    <Calendar v-if="selectedProposal && currentStep === 2" @updateDateRange="handleDateRangeUpdate" />
    <div v-if="currentStep === 3 && categories && categories.length > 0" class="content">
      <h2>Schedule an Observation</h2>
      <p>What do you want to take pictures of?</p>
      <div v-for="category in categories" :key="category.location" class="content">
        <h4>{{ category.location }}</h4>
        <div class="buttons">
          <a
            v-for="option in category.options"
            :key="option.shortname"
            @click="handleObjectSelection(option.shortname, option.name)"
            class="button suggestion"
          >
          <span>
            <img :src=option.icon alt='icon' />
          </span>
          <span>{{ option.name }}</span>
        </a>
        </div>
      </div>
    </div>

    <div v-if="displayedTargets && currentStep === 4">
      <h3>Requesting an Observation of a <span class="blue">{{ objectSelected}}</span></h3>
      <div class="columns is-column-gap-3">
        <div v-for="target in displayedTargets" :key="target.name" @click="handleTargetSelection(target)" class="column">
          <div class="card target-highlight is-clickable">
            <header class="card-header">
              <p class="card-header-title">{{ target.name }}</p>
            </header>
            <div class="card-content">
              <div class="content">{{ target.desc }}</div>
            </div>
          </div>
        </div>
      </div>
      <button class="button" @click="resetSelections">Different targets</button>
      <button class="button" @click="shuffleTargets">Shuffle Targets</button>
      <button class="button" v-if="totalLoaded < selectedTargets.length && totalLoaded < 15" @click="loadMoreTargets">Load More Targets</button>
    </div>
    <div v-if="currentStep === 5">
      <div v-if="targetSelected || (objectSelected && !objectSelection.targets)" class="content">
        <h2>
          Requesting an observation of
          <span v-if="objectSelection.targets"> a </span>
          <span class="selection blue">
            {{ objectSelection.object }}
            <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span>
          </span>
        </h2>
        <p>How do you want to set up your observation?</p>
        <div class="field is-grouped">
          <p class="control">
            <button class="button" @click="letMeChoose">Let Me Choose</button>
          </p>
          <p class="control">
            <button class="button" @click="useDefaults">I'm OK with Defaults</button>
          </p>
        </div>
        <button class="button" @click="resetSelections">Different targets</button>
      </div>
      <div v-if="beginner === true && (targetSelected || (objectSelected && !objectSelection.targets))" class="grey-bg content px-2 py-2">
        <h4>Photon Ranch will schedule this for you</h4>
        <div class="columns">
          <div class="column is-half">
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-gear" class="blue fa-2xl" />
              </span>
              <span>Any 0.35m telescope</span>
            </span>
            <p></p>
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-calendar-days" class="blue fa-2xl" />
              </span>
              <span>Between {{ startDate }} and {{ endDate }}</span>
            </span>
          </div>
          <div class="column">
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-sliders" class="blue fa-2xl" />
              </span>
              <span class="icon-text-list">
                <ul>
                  <li>{{ exposureSettings.length }} color images</li>
                  <li v-for="(setting, index) in exposureSettings" :key="index">
                    {{ setting.exposureTime }}s with {{ setting.filter }} filter
                  </li>
                </ul>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div v-if="beginner === false && (targetSelected || (objectSelected && !objectSelection.targets))" class="grey-bg content px-2 py-2">
        <SchedulingSettings
          :show-project-field="false"
          :show-title-field="false"
          :target="targetSelection?.name"
          @exposuresUpdated="handleExposuresUpdate"
        />
      </div>
    </div>
    <div v-if="currentStep > 1" class="navigation-buttons">
      <button @click="previousStep" class="button">Back</button>
    </div>
  </div>
</template>
<style scoped>
.loading {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.suggestion {
  display: inline-block !important;
  min-width:100px;
  span {
    display:block;
  }
}
</style>
