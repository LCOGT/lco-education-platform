<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted } from 'vue'
import { useConfigurationStore } from '../../stores/configuration.js'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { getFilterList } from '../../utils/populateInstrumentsUtils.js'
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
  }
})

const emits = defineEmits(['exposuresUpdated', 'targetUpdated', 'updateDisplay'])

const configurationStore = useConfigurationStore()
const proposalStore = useProposalStore()

const hasManyProposals = () => {
  return proposalStore.proposalsWithNormalTimeAllocation.length > 1
}

const targetList = ref([{ name: '', exposures: [], ra: '', dec: '' }])
const activeTargetIndex = ref(0)
const targetError = ref('')
const isTargetConfirmed = ref(false)
const filterList = ref([])
const currentStep = ref(2)

const targetInput = reactive({
  name: '',
  ra: '',
  dec: ''
})

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

const exposureEnabled = computed(() => {
  return !props.showTitleField || (targetInput.ra !== '' && targetInput.dec !== '')
})

const addExposuresEnabled = computed(() => settings.filter && settings.exposureTime && settings.count)
const addTargetEnabled = computed(() => targetList.value[activeTargetIndex.value]?.exposures.length > 0)

const filteredTargets = computed(() => {
  return targetList.value.filter(target => target.exposures.length > 0)
})

function clearTargetName () {
  targetInput.name = ''
}

function updateTarget () {
  emits('targetUpdated', {
    index: activeTargetIndex.value,
    name: targetInput.name || `${targetInput.ra}_${targetInput.dec}`,
    ra: targetInput.ra,
    dec: targetInput.dec
  })
}

// Fetch RA and Dec based on the target name
function getRaDecFromTargetName () {
  const targetName = targetInput.name

  if (!targetName) {
    targetError.value = 'Please enter a target name.'
    return
  }

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

// Add an exposure to the active target
const addExposure = () => {
  if (addExposuresEnabled.value) {
    // Commit the current input values to the targetList entry,
    // ensuring RA/Dec are stored as numbers
    targetList.value[activeTargetIndex.value].name = props.target || targetInput.name || `${targetInput.ra}_${targetInput.dec}`
    targetList.value[activeTargetIndex.value].ra = targetInput.ra !== '' ? Number(targetInput.ra) : null
    targetList.value[activeTargetIndex.value].dec = targetInput.dec !== '' ? Number(targetInput.dec) : null
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
      ra: targetList.value[activeTargetIndex.value].ra,
      dec: targetList.value[activeTargetIndex.value].dec
    })
  }
}

// Add a new target with empty exposure settings
const addTarget = () => {
  targetList.value.push({ name: '', exposures: [], ra: '', dec: '' })
  targetInput.name = ''
  targetInput.ra = ''
  targetInput.dec = ''
  activeTargetIndex.value = targetList.value.length - 1
  isTargetConfirmed.value = false
  currentStep.value = 2
}

// Function to display exposures for a target as a concatenated string
const formatExposures = (exposures) => {
  return exposures.map(exposure => `${exposure.filterName} - ${exposure.exposureTime}s x ${exposure.count}`).join(', ')
}

const nextStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    currentStep.value = 4
  }
  emits('updateDisplay', currentStep.value)
}

const previousStep = () => {
  if (currentStep.value === 2 && hasManyProposals()) {
    currentStep.value = 1
  } else if (currentStep.value === 3) {
    currentStep.value = 2
  } else if (currentStep.value === 4) {
    currentStep.value = 3
  }
  emits('updateDisplay', currentStep.value)
}

const disableNextStep = computed(() => {
  if (currentStep.value === 2) {
    return !targetInput.ra || !targetInput.dec
  } else if (currentStep.value === 3) {
    return !targetList.value[activeTargetIndex.value].exposures.length
  }
  return false
})

const buttonVisibility = computed(() => {
  return props.showProjectField && currentStep.value !== 4
})

function editTarget (index) {
  // Set the selected target as the active one for editing
  activeTargetIndex.value = index
  // Copy the target's current values into targetInput so the form is pre-filled.
  targetInput.name = targetList.value[index].name
  targetInput.ra = targetList.value[index].ra
  targetInput.dec = targetList.value[index].dec
  isTargetConfirmed.value = true
  targetError.value = ''
  // Moving back to step one so user can edit target
  currentStep.value = 2
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
      <div v-if="currentStep === 3 || props.target">
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
      <div v-if="showTitleField && currentStep === 2" class="input-wrapper">
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
            <v-btn color="indigo" @click="getRaDecFromTargetName">Find Target</v-btn>
        </div>
        <p v-if="targetError" class="error-text">{{ targetError }}</p>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">RA</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input type="number" v-model="targetInput.ra" @input="() => { clearTargetName(); updateTarget() }" class="scheduling-inputs input"/>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Dec</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input type="number" v-model="targetInput.dec" @input="() => { clearTargetName(); updateTarget() }" class="scheduling-inputs input"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-one-third">

      <!-- Exposure settings -->
      <div v-if="props.target || currentStep === 3">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Filter</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control" :class="{ disabled: !exposureEnabled }">
              <div class="select is-fullwidth">
                <select id="filter" v-model="settings.filter" :disabled="(!isTargetConfirmed && props.showProjectField && targetInput.name) || !exposureEnabled">
                  <option disabled value="">Choose a filter</option>
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
              <input id="exposureTime" type="number" min="1" class="input" v-model="settings.exposureTime" :disabled="!exposureEnabled" placeholder="Seconds">
            </p>
            <p class="help is-danger" v-if="!isExposureTimeValid">{{ exposureError }}</p>
          </div>
          <div class="times">
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </div>
          <div class="field is-narrow">
            <p class="control is-expanded">
              <input id="exposureCount" type="number" class="input" v-model="settings.count" :disabled="!exposureEnabled" min="1" placeholder="Count">
            </p>
          </div>
        </div>
      </div>
      <!-- Add exposure button -->
      <v-btn @click="addExposure" color="indigo" :disabled="!addExposuresEnabled" class="add-exposure">Add Exposure</v-btn>
      <v-btn v-if="props.showTitleField" @click="addTarget" color="indigo" :disabled="!addTargetEnabled" class="add-target">Add Another Target</v-btn>
      </div>
    </div>
    <v-btn color="indigo" @click="nextStep" v-if="buttonVisibility" :disabled="disableNextStep">Next step</v-btn>
    </div>
</template>
