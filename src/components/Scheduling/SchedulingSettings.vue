<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useConfigurationStore } from '../../stores/configuration.js'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { getFilterList } from '../../utils/populateInstrumentsUtils.js'
import { fetchApiCall } from '../../utils/api.js'
import { raToDegrees, decToDegrees } from '../../utils/convertRaDec.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  showProjectField: {
    type: Boolean,
    default: true
  },
  showTitleField: {
    type: Boolean,
    default: true
  },
  target: {
    type: String,
    default: ''
  },
  ra: {
    type: Number
  },
  dec: {
    type: Number
  },
  startDate: {
    type: String
  },
  endDate: {
    type: String
  },
  objectType: {
    type: String
  },
  canAddAnotherTarget: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['exposuresUpdated', 'targetUpdated', 'updateDisplay'])

const configurationStore = useConfigurationStore()
const proposalStore = useProposalStore()

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

const targetList = ref([{ name: '', exposures: [], ra: '', dec: '', raInput: '', decInput: '', simbadResponse: {} }])
const activeTargetIndex = ref(0)
const targetError = ref('')
const isTargetConfirmed = ref(false)
const filterList = ref([])
const currentStep = ref(4)

const targetInput = reactive({
  name: '',
  ra: '',
  dec: '',
  simbadResponse: {}
})

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

const addExposuresEnabled = computed(() => settings.filter && settings.exposureTime && settings.count)
const addTargetEnabled = computed(() => targetList.value[activeTargetIndex.value]?.exposures.length > 0)

const filteredTargets = computed(() => {
  return targetList.value.filter(target => target.exposures.length > 0)
})

function clearTargetName () {
  targetInput.name = ''
}

function convertRaToDeg (ra) {
  const isSidereal = props.objectType === 'sidereal'
  if (isSidereal && !Number(ra)) {
    targetList.value[activeTargetIndex.value].ra = raToDegrees(ra)
  }
}

function convertDecToDeg (dec) {
  const isSidereal = props.objectType === 'sidereal'
  if (isSidereal && !Number(dec)) {
    targetList.value[activeTargetIndex.value].dec = decToDegrees(dec)
  }
}

function updateTarget () {
  const isSidereal = props.objectType === 'sidereal'

  if (isSidereal && !targetInput.name && targetInput.ra && targetInput.dec) {
    isTargetConfirmed.value = true
  }

  targetList.value[activeTargetIndex.value].name = targetInput.name || (isSidereal ? `${targetInput.ra}_${targetInput.dec}` : '')
  targetList.value[activeTargetIndex.value].raInput = targetInput.ra
  targetList.value[activeTargetIndex.value].decInput = targetInput.dec
  emits('targetUpdated', {
    index: activeTargetIndex.value,
    name: targetList.value[activeTargetIndex.value].name,
    ra: targetList.value[activeTargetIndex.value].ra,
    dec: targetList.value[activeTargetIndex.value].dec,
    simbadResponse: isSidereal ? null : targetList.value[activeTargetIndex.value].simbadResponse
  })
}

function fetchSiderealTargetDetails (targetName) {
  fetch(configurationStore.targetNameUrl + `${targetName}?target_type=sidereal`)
    .then(response => response.json())
    .then(data => {
      if (data.ra && data.dec) {
        const ra = parseFloat(data.ra_d).toFixed(3)
        const dec = parseFloat(data.dec_d).toFixed(3)
        targetInput.ra = Number(ra)
        targetInput.dec = Number(dec)
        targetList.value[activeTargetIndex.value].name = targetInput.name
        targetList.value[activeTargetIndex.value].ra = Number(ra)
        targetList.value[activeTargetIndex.value].dec = Number(dec)
        targetError.value = ''
        isTargetConfirmed.value = true
      } else {
        targetError.value = 'Target not found, try another target.'
        targetInput.ra = ''
        targetInput.dec = ''
        isTargetConfirmed.value = false
      }
    })
    .catch(() => {
      targetError.value = 'Error fetching target details. Try again later.'
      targetInput.ra = ''
      targetInput.dec = ''
      isTargetConfirmed.value = false
    })
}

async function fetchNonSiderealTargetDetails (targetName) {
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + `get_ephemeris/?start_date=${props.startDate}&end_date=${props.endDate}`,
    method: 'GET',
    successCallback: (response) => {
      getNonSiderealAvailability(response, targetName)
    }
  })
}

const getNonSiderealAvailability = (ephemerides, target) => {
  const targetName = target.charAt(0).toUpperCase() + target.slice(1).toLowerCase()
  const targetEphemerides = ephemerides[targetName]
  if (!targetEphemerides) {
    targetError.value = 'No ephemeris data found for this target.'
  }

  const thresholdInDegrees = 60
  const isSchedulable = targetEphemerides.some(ephemeris => Number(ephemeris.elong) > thresholdInDegrees)
  if (isSchedulable) {
    targetError.value = ''
    getNonSiderealRequestBodyDetails(targetName)
  } else {
    targetError.value = `${targetName} is not schedulable for the selected date range.`
    isTargetConfirmed.value = false
  }
}

const getNonSiderealRequestBodyDetails = async (target) => {
  await fetchApiCall({
    url: `https://simbad2k.lco.global/${target}?target_type=NON_SIDEREAL&scheme=MPC_MINOR_PLANET`,
    method: 'GET',
    successCallback: (response) => {
      targetList.value[activeTargetIndex.value].simbadResponse = response
      targetInput.simbadResponse = response
      targetList.value[activeTargetIndex.value].name = target
      isTargetConfirmed.value = true
      updateTarget()
      nextStep()
    }
  })
}

// Fetch RA and Dec based on the target name
function getTargetDetails () {
  const targetName = targetInput.name

  if (!targetName) {
    targetError.value = 'Please enter a target name.'
    return
  }
  if (props.objectType === 'sidereal') {
    fetchSiderealTargetDetails(targetName)
  } else if (props.objectType === 'nonsidereal') {
    fetchNonSiderealTargetDetails(targetName)
  }
}

// Add an exposure to the active target
const addExposure = () => {
  if (addExposuresEnabled.value) {
    const isSidereal = props.objectType === 'sidereal'
    targetList.value[activeTargetIndex.value].exposures.push({
      filter: settings.filter,
      filterName: filterList.value.find(f => f.code === settings.filter)?.name || '',
      exposureTime: settings.exposureTime,
      count: settings.count
    })
    settings.filter = ''
    settings.exposureTime = ''
    settings.count = ''
    emits('exposuresUpdated', targetList.value[activeTargetIndex.value].exposures)
    emits('targetUpdated', {
      name: targetList.value[activeTargetIndex.value].name,
      ra: isSidereal ? targetList.value[activeTargetIndex.value].ra : null,
      dec: isSidereal ? targetList.value[activeTargetIndex.value].dec : null,
      simbadResponse: isSidereal ? null : targetList.value[activeTargetIndex.value].simbadResponse
    })
  }
}

// Add a new target with empty exposure settings
const addAnotherTarget = () => {
  targetList.value.push({ name: '', exposures: [], ra: '', dec: '', simbadResponse: {} })
  targetInput.name = ''
  targetInput.ra = ''
  targetInput.dec = ''
  targetInput.simbadResponse = {}
  activeTargetIndex.value = targetList.value.length - 1
  isTargetConfirmed.value = false
  currentStep.value = 4
  emits('updateDisplay', currentStep.value)
}

const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
    emits('updateDisplay', currentStep.value)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    if (currentStep.value === 2 && hasManyProposals()) {
      currentStep.value = 1
    } else {
      currentStep.value--
    }
    emits('updateDisplay', currentStep.value)
  }
}

const disableNextStep = computed(() => {
  if (currentStep.value === 4) {
    return !targetInput.ra || !targetInput.dec
  } else if (currentStep.value === 5) {
    return !targetList.value[activeTargetIndex.value].exposures.length
  }
  return false
})

const buttonVisibility = computed(() => {
  return props.showProjectField && currentStep.value !== 5
})

function editTarget (index) {
  // Set the selected target as the active one for editing
  activeTargetIndex.value = index
  targetInput.name = targetList.value[index].name
  targetInput.ra = props.objectType === 'sidereal' ? targetList.value[index].raInput : ''
  targetInput.dec = props.objectType === 'sidereal' ? targetList.value[index].decInput : ''

  isTargetConfirmed.value = true
  targetError.value = ''
  currentStep.value = 4
  emits('updateDisplay', currentStep.value)
}

function deleteExposure (targetIndex, exposureIndex) {
  targetList.value[targetIndex].exposures.splice(exposureIndex, 1)
  // Check if the deleted exposure belongs to the active target, then emit updated exposures
  if (targetIndex === activeTargetIndex.value) {
    emits('exposuresUpdated', targetList.value[targetIndex].exposures)
  }
}

onMounted(async () => {
  filterList.value = await getFilterList()
})

</script>

<template>
    <div class="columns">
      <div class="column is-one-third">
      <!-- Render saved targets and exposures -->
      <div v-if="currentStep === 5 || props.target">
        <div
          v-for="(target, tIndex) in filteredTargets"
          :key="tIndex"
          class="highlight-box"
        >
          <FontAwesomeIcon icon="fa-regular fa-camera-retro" />
          {{ target.name || `${target.ra}_${target.dec}` }}
          <v-btn
            v-if="!props.target"
            @click="editTarget(tIndex)"
            color="indigo"
          >
            Change Target
          </v-btn>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Filter</th>
                <th>Exposure Time (s)</th>
                <th colspan="2">Count</th>
              </tr>
            </thead>
            <tbody>
          <tr v-for="(exposure, index) in target.exposures" :key="index" class="exposure-item">
              <td>{{ exposure.filterName }}</td><td>{{ exposure.exposureTime }}s</td><td> x {{ exposure.count }}</td>
            <td><a
              @click="deleteExposure(tIndex, index)"
              class="delete-exposure red"
            >
              <FontAwesomeIcon icon="fa-solid fa-trash-can" />
          </a></td>
        </tr>
        </tbody>
      </table>
        </div>
      </div>
      <!-- Target input -->
      <div v-if="showTitleField && currentStep === 4" class="input-wrapper">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
              <label for="target-list" class="label">Target</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input
                  id="target-list"
                  v-model="targetInput.name"
                  @blur="updateTarget()"
                  class="scheduling-inputs input"
                  placeholder="Enter target"
                />
                </div>
              </div>
            </div>
            <v-btn color="indigo" @click="() => { getTargetDetails(); updateTarget() }">Find Target</v-btn>
        </div>
        <p v-if="targetError" class="error-text">{{ targetError }}</p>
        <div class="field is-horizontal" v-if="props.objectType === 'sidereal'">
          <div class="field-label is-normal">
            <label class="label">RA</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input v-model="targetInput.ra" @input="() => { clearTargetName(); updateTarget() }" @blur="() => { convertRaToDeg(targetInput.ra) }" class="scheduling-inputs input"/>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal" v-if="props.objectType === 'sidereal'">
          <div class="field-label is-normal">
            <label class="label">Dec</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input v-model="targetInput.dec" @input="() => { clearTargetName(); updateTarget() }" @blur="() => { convertDecToDeg(targetInput.dec) }" class="scheduling-inputs input"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-one-third">

      <!-- Exposure settings -->
      <div v-if="props.target || currentStep === 5">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Filter</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control">
              <div class="select is-fullwidth">
                <select id="filter" v-model="settings.filter" :disabled="(!isTargetConfirmed && props.showProjectField && targetInput.name)">
                  <option disabled value="">Choose a filter for {{ targetList[activeTargetIndex].name }}</option>
                    <option v-for="filter in filterList" :key="filter.code" :value="filter.code">
                      {{ filter.name }}
                    </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Exposure</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <p class="control is-expanded">
              <input id="exposureTime" type="number" min="1" class="input" v-model="settings.exposureTime" placeholder="Seconds">
            </p>
            <p class="help is-danger" v-if="!isExposureTimeValid">{{ exposureError }}</p>
          </div>
          <div class="times">
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </div>
          <div class="field is-narrow">
            <p class="control is-expanded">
              <input id="exposureCount" type="number" class="input" v-model="settings.count" min="1" placeholder="Count">
            </p>
          </div>
        </div>
      </div>
      <!-- Add exposure button -->
      <v-btn @click="addExposure" color="indigo" :disabled="!addExposuresEnabled" class="add-exposure">Add Exposure</v-btn>
      <v-btn v-if="props.showTitleField && props.canAddAnotherTarget" @click="addAnotherTarget" color="indigo" :disabled="!addTargetEnabled" class="add-target">Add Another Target</v-btn>
      </div>
    </div>
    <v-btn color="indigo" @click="previousStep" v-if="currentStep > 1">Previous step</v-btn>
    <v-btn color="indigo" class="nextstep" @click="nextStep" v-if="buttonVisibility" :disabled="disableNextStep">Next step</v-btn>
    </div>
</template>

<style scoped>
  .nextstep {
  margin-top: 0;
  margin-left: 1em;
  vertical-align: middle;
}

</style>
