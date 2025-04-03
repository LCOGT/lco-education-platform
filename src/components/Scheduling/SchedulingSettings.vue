<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted } from 'vue'
import { useConfigurationStore } from '../../stores/configuration.js'
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

const targetList = ref([{ name: '', exposures: [], ra: '', dec: '' }])
const activeTargetIndex = ref(0)
const targetError = ref('')
const isTargetConfirmed = ref(false)
const filterList = ref([])
const currentStep = ref(1)

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

function clearTargetName () {
  targetInput.name = ''
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
        console.log('targetList', targetList.value)
        targetError.value = ''
        isTargetConfirmed.value = true
        // handleTargetChange()
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
// Add this alongside your existing reactive definitions
const targetInput = reactive({
  name: '',
  ra: '',
  dec: ''
})

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
  currentStep.value = 1
}

// Function to display exposures for a target as a concatenated string
const formatExposures = (exposures) => {
  return exposures.map(exposure => `${exposure.filterName} - ${exposure.exposureTime}s x ${exposure.count}`).join(', ')
}

const nextStep = () => {
  if (currentStep.value === 1) {
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    currentStep.value = 3
  }
  emits('updateDisplay', currentStep.value)
}

const previousStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  } else if (currentStep.value === 3) {
    currentStep.value = 2
  }
  emits('updateDisplay', currentStep.value)
}

const disableNextStep = computed(() => {
  if (currentStep.value === 1) {
    return !targetInput.ra || !targetInput.dec
  } else if (currentStep.value === 2) {
    return !targetList.value[activeTargetIndex.value].exposures.length
  }
  return false
})

const buttonVisibility = computed(() => {
  return props.showProjectField && currentStep.value !== 3
})

onMounted(async () => {
  filterList.value = await getFilterList()
})

</script>

<template>
    <div class="columns">
      <div class="column is-one-third">
      <!-- Render saved targets and exposures -->
      <div v-if="(targetList.length > 1 && currentStep === 2)">
        <div v-for="(target, index) in targetList" :key="index">
          <div v-if="index !== activeTargetIndex && target.exposures.length > 0">

            {{ target.name || `${target.ra}_${target.dec}` }}: {{ formatExposures(target.exposures) }}
          </div>
        </div>
      </div>

      <!-- Target input -->
      <div v-if="showTitleField && currentStep === 1" class="input-wrapper">
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
                <input type="number" v-model="targetInput.ra" @input="clearTargetName" class="scheduling-inputs input"/>
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
                <input type="number" v-model="targetInput.dec" @input="clearTargetName" class="scheduling-inputs input"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-one-third">
      <!-- Render saved exposures for the active target -->
      <div v-if="(targetList[activeTargetIndex].exposures.length > 0 && currentStep === 2) || (props.target && targetList[activeTargetIndex].exposures.length > 0)">
        <div class="highlight-box">
          <FontAwesomeIcon icon="fa-regular fa-camera-retro" />
          {{ targetList[activeTargetIndex].name || props.target }}: {{ formatExposures(targetList[activeTargetIndex].exposures) }}
        </div>
      </div>

      <!-- Exposure settings -->
      <div v-if="props.target || currentStep === 2">
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
      <!-- Add another target button -->
    </div>
    <v-btn color="indigo" @click="previousStep" v-if="currentStep !==1">Go back</v-btn>
    <v-btn color="indigo" @click="nextStep" v-if="buttonVisibility" :disabled="disableNextStep">Next step</v-btn>
    </div>
</template>
