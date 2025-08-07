<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Calendar from './Calendar.vue'
import SchedulingSettings from './SchedulingSettings.vue'
import ProposalDropdown from '../Global/ProposalDropdown.vue'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { useConfigurationStore } from '../../stores/configuration.js'
import { calculateSchedulableTargets } from '../../utils/visibility.js'
import targets from '../../utils/targets.min.json'
import { fetchApiCall } from '../../utils/api'
import galaxyIcon from '@/assets/Icons/galaxy.png'
import starClusterIcon from '@/assets/Icons/star-cluster.png'
import supernovaIcon from '@/assets/Icons/supernova.png'
import nebulaIcon from '@/assets/Icons/nebula.png'
import marsIcon from '@/assets/Icons/mars.png'
import jupiterIcon from '@/assets/Icons/Jupiter.png'
import saturnIcon from '@/assets/Icons/Saturn.png'
import uranusIcon from '@/assets/Icons/uranus.png'
import neptuneIcon from '@/assets/Icons/neptune.png'
import moonIcon from '@/assets/Icons/moon.png'
import asteroidIcon from '@/assets/Icons/asteroid.png'

const emits = defineEmits(['selectionsComplete', 'clearErrorMessage', 'showButton'])
const proposalStore = useProposalStore()
const configurationStore = useConfigurationStore()

const beginner = ref()
const dateRange = ref()
const objectSelection = ref('')
const selectedCategory = ref('')
const targetSelection = ref('')
const targetSelected = ref(false)
const targetList = ref({})
const exposureSettings = ref([])
const defaultSettings = ref([])
const loading = ref(false)
const selectedTargets = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedProposal = ref()
const displayedTargets = ref([])
const totalLoaded = ref(3)
const currentStep = ref(1)
const simbadResponse = ref({})
const schemeRequest = ref('')

const categories = ref([
  {
    location: 'Deep Space',
    options: [
      { name: 'Galaxy', icon: galaxyIcon, shortname: 'galaxies' },
      { name: 'Star Cluster', icon: starClusterIcon, shortname: 'clusters' },
      { name: 'Supernova', icon: supernovaIcon, shortname: 'supernovae' },
      { name: 'Nebula', icon: nebulaIcon, shortname: 'nebulae' }
    ]
  },
  {
    location: 'Our Solar System',
    options: [
      { name: 'Mars', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '499', availability: null, filters: [{ exposure: 1, name: 'rp' }], icon: marsIcon },
      { name: 'Jupiter', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '599', availability: null, filters: [{ exposure: 0.2, name: 'up' }], icon: jupiterIcon },
      { name: 'Saturn', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '699', availability: null, filters: [{ exposure: 0.5, name: 'up' }], icon: saturnIcon },
      { name: 'Uranus', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '799', availability: null, filters: [{ exposure: 5, name: 'rp' }], icon: uranusIcon },
      { name: 'Neptune', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '899', availability: null, filters: [{ exposure: 5, name: 'rp' }], icon: neptuneIcon },
      { name: 'Pluto', type: 'dwarf', scheme: 'MPC_MINOR_PLANET', command: '999', availability: null, filters: [{ exposure: 5, name: 'rp' }], icon: moonIcon },
      { name: 'Ceres', type: 'dwarf', scheme: 'MPC_MINOR_PLANET', command: '134340', availability: null, filters: [{ exposure: 10, name: 'V' }], icon: asteroidIcon }
    ]
  }
])

const handleProposalSelection = (proposal) => {
  // Only advance step if still on step 1
  if (currentStep.value === 1) {
    selectedProposal.value = proposal
    nextStep()
  } else {
    // Just update the proposal without advancing steps
    selectedProposal.value = proposal
  }
}

const nextStep = () => {
  currentStep.value += 1
}

const previousStep = () => {
  loading.value = false
  beginner.value = ''
  exposureSettings.value = []
  emits('clearErrorMessage')
  if (currentStep.value > 1) currentStep.value -= 1
  // Handles specific cases for going back: when user goes from a selected target to seeing the 3 targets
  // or when user goes from selecting a non-sidereal target back
  // non-sidereal target flow follows a different flow
  if (selectedCategory.value === 'Non-sidereal target') {
    targetSelected.value = false
    targetSelection.value = ''
    objectSelection.value = ''
    selectedCategory.value = ''
    displayedTargets.value = []
    currentStep.value = 3
  }
  if (currentStep.value === 4) {
    if (!objectSelection.value || !objectSelection.value.targets) {
      displayedTargets.value = objectSelection.value.slice(0, 3)
    }
  }
}

const getNonSiderealRequestBodyDetails = async (name, scheme) => {
  await fetchApiCall({
    url: `https://simbad2k.lco.global/${name}?target_type=NON_SIDEREAL&scheme=${scheme}`,
    method: 'GET',
    successCallback: (response) => {
      simbadResponse.value = response
      schemeRequest.value = scheme
      emitSelections()
    }
  })
}

const handleObjectSelection = (shortname, name, location, scheme) => {
  if (location === 'Our Solar System') {
    // Find the selected option object from the options array
    const solarSystemCategory = categories.value.find(cat => cat.location === 'Our Solar System')
    const selectedOption = solarSystemCategory.options.find(opt => opt.name === name)
    selectedCategory.value = 'Non-sidereal target'
    getNonSiderealRequestBodyDetails(name, scheme)
    handleTargetSelection(selectedOption)
    currentStep.value = 5
  } else {
    objectSelection.value = targetList.value[shortname]
    selectedCategory.value = name
    displayedTargets.value = objectSelection.value.slice(0, 3)
    totalLoaded.value = 3
    nextStep()
  }
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
    target: selectedCategory.value === 'Non-sidereal target' ? simbadResponse.value : targetSelection.value,
    scheme: selectedCategory.value === 'Non-sidereal target' ? schemeRequest.value : null,
    settings: exposureSettings.value,
    startDate: startDate.value,
    endDate: endDate.value,
    proposal: selectedProposal.value,
    isSidereal: selectedCategory.value !== 'Non-sidereal target'
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
  if (selectedCategory.value !== 'Non-sidereal target') {
    emitSelections()
  }
  nextStep()
}

const getSchedulableTargets = (startDate, endDate) => {
  loading.value = true
  targetList.value = calculateSchedulableTargets(targets, startDate, endDate)
  loading.value = false
}

const getNonSiderealAvailability = (ephemeris) => {
  const thresholdInDegrees = 60
  const solarSystemCategory = categories.value.find(cat => cat.location === 'Our Solar System')
  if (!solarSystemCategory) return {}

  const availabilityMap = {}

  for (const [objectName, ephemerides] of Object.entries(ephemeris)) {
    const isItschedulable = ephemerides.some(ephemeris => parseFloat(ephemeris.elong) > thresholdInDegrees)
    availabilityMap[objectName] = isItschedulable
    const option = solarSystemCategory.options.find(opt => opt.name === objectName)
    if (option) {
      option.availability = isItschedulable
    }
  }
}

const getNonSiderealEphemeris = async (start, end) => {
  let nonSiderealAvailability = {}
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + `get_ephemeris/?start_date=${start}&end_date=${end}`,
    method: 'GET',
    successCallback: (response) => {
      nonSiderealAvailability = getNonSiderealAvailability(response)
    },
    failCallback: () => {
      const solarSystemCategory = categories.value.find(cat => cat.location === 'Our Solar System')
      if (solarSystemCategory) {
        solarSystemCategory.options.forEach(opt => {
          opt.availability = false
        })
      }
    }
  })
  return nonSiderealAvailability
}

const getSchedulableNonSiderealTargets = async (start, end) => {
  // start and end are in YYYY-MM-DD format
  const startDateStr = new Date(start).toISOString().split('T')[0]
  const endDateStr = new Date(end).toISOString().split('T')[0]
  await getNonSiderealEphemeris(startDateStr, endDateStr)
}

const handleDateRangeUpdate = (newDateRange) => {
  dateRange.value = newDateRange
  getSchedulableTargets(newDateRange.start, newDateRange.end)
  startDate.value = newDateRange.start.toISOString().split('.')[0]
  endDate.value = newDateRange.end.toISOString().split('.')[0]
  getSchedulableNonSiderealTargets(startDate.value, endDate.value)
  nextStep()
}

const resetSelections = () => {
  objectSelection.value = ''
  selectedCategory.value = ''
  targetSelection.value = ''
  targetSelected.value = false
  beginner.value = ''
  previousStep()
}

const letMeChoose = () => {
  beginner.value = false
  exposureSettings.value = []
  emitSelections()
  emits('showButton', false)
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
  emits('showButton', exposures.length > 0)
}

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

onMounted(async () => {
  if (proposalStore.proposalsWithNormalTimeAllocation.length === 1) {
    selectedProposal.value = proposalStore.proposalsWithNormalTimeAllocation[0].id
    currentStep.value = 2
  }
})

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading" />
  </template>
  <div class="container">
    <div v-if="currentStep === 1">
      <ProposalDropdown v-if="hasManyProposals" :isItRealTime="false" @selectionsComplete="handleProposalSelection" />
    </div>
    <div v-if="currentStep > 1" class="navigation-buttons">
      <p v-if="selectedProposal">Project: {{ selectedProposal }}</p>
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
            :key="option.shortname || option.name"
            @click="option.availability === false ? null : handleObjectSelection(option.shortname, option.name, category.location, option.scheme)"
            class="button suggestion"
            :class="{ 'disabled': option.availability === false }"
            :style="option.availability === false ? 'pointer-events: none; opacity: 0.5;' : ''"
          >
            <span>
              <img :src="option.icon" alt="icon" />
            </span>
            <span>{{ option.name }}</span>
        </a>
        </div>
      </div>
    </div>

    <div v-if="displayedTargets && currentStep === 4">
      <h3>Requesting an Observation of a <span class="blue">{{ selectedCategory }}</span></h3>
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
      <div v-if="targetSelected || (selectedCategory && !objectSelection.targets)" class="content">
        <h2>
          Requesting an observation of
          <span v-if="targetSelection"> a </span>
          <span v-if="selectedCategory" class="selection blue">
            {{ selectedCategory }}
            <span v-if="targetSelection"> - {{ targetSelection.name }}</span>
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
      </div>
      <div v-if="beginner === true && (targetSelected || (selectedCategory && !objectSelection.targets))" class="grey-bg content px-2 py-2">
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
      <div v-if="beginner === false && (targetSelected || (selectedCategory && !objectSelection.targets))" class="grey-bg content px-2 py-2">
        <SchedulingSettings
          :show-project-field="false"
          :show-title-field="false"
          :target="targetSelection?.name"
          :ra="targetSelection?.ra"
          :dec="targetSelection?.dec"
          @exposuresUpdated="handleExposuresUpdate"
        />
      </div>
    </div>
  </div>
  <button v-if="currentStep!==1" @click="previousStep" class="button">Previous Step</button>
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
.disabled {
  background-color: #e0e0e0 !important;
  color: #888 !important;
  cursor: not-allowed !important;
}
</style>
