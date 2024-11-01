<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted } from 'vue'
import { useConfigurationStore } from '../../stores/configuration.js'
import { fetchApiCall } from '../../utils/api.js'

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
  }
})

const emits = defineEmits(['exposuresUpdated', 'targetUpdated'])

const configurationStore = useConfigurationStore()

const projectName = ref('')
const targetList = ref([{ name: '', exposures: [], ra: '', dec: '' }])
const activeTargetIndex = ref(0)
const targetError = ref('')
const isTargetConfirmed = ref(false)
const filterList = ref([])

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

const getFilterList = async () => {
  await fetchApiCall({
    url: configurationStore.observationPortalUrl + 'instruments',
    method: 'GET',
    successCallback: (data) => {
      Object.values(data).forEach(instrument => {
        // Checks if the instrument has a "class" of "0m4" and contains filters in optical_elements
        if (instrument.class === '0m4' && instrument.optical_elements.filters) {
          const schedulableFilters = instrument.optical_elements.filters
            .filter(filter => filter.schedulable)
            .map(filter => ({ name: filter.name, code: filter.code }))
          filterList.value.push(...schedulableFilters)
        }
      })
    },
    failCallback: (error) => { console.error('API failed with error', error) }
  })
}

// State for enabling/disabling fields
const targetEnabled = computed(() => {
  return props.showProjectField ? projectName.value.trim() !== '' : true
})

const exposureEnabled = computed(() => {
  return !props.showTitleField || targetList.value[activeTargetIndex.value]?.ra !== '' || targetList.value[activeTargetIndex.value]?.dec !== ''
})

const addExposuresEnabled = computed(() => settings.filter && settings.exposureTime && settings.count)
const addTargetEnabled = computed(() => targetList.value[activeTargetIndex.value]?.exposures.length > 0)

// Fetch RA and Dec based on the target name
function getRaDecFromTargetName () {
  const targetName = targetList.value[activeTargetIndex.value].name.trim()

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
        targetList.value[activeTargetIndex.value].ra = Number(ra) / 15
        targetList.value[activeTargetIndex.value].dec = Number(dec)
        targetError.value = ''
        isTargetConfirmed.value = true
        handleTargetChange()
      } else {
        targetError.value = 'Target not found, try another target.'
        targetList.value[activeTargetIndex.value].ra = ''
        targetList.value[activeTargetIndex.value].dec = ''
        isTargetConfirmed.value = false
      }
    })
    .catch(() => {
      targetError.value = 'Error fetching target details. Try again later.'
      targetList.value[activeTargetIndex.value].ra = ''
      targetList.value[activeTargetIndex.value].dec = ''
      isTargetConfirmed.value = false
    })
}

// Add a new exposure to the current target
const addExposure = () => {
  if (addExposuresEnabled.value) {
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
  }
}

// Add a new target with empty exposure settings
const addTarget = () => {
  targetList.value.push({ name: '', exposures: [], ra: '', dec: '' })
  activeTargetIndex.value = targetList.value.length - 1
  isTargetConfirmed.value = false
}

const handleTargetChange = () => {
  const targetData = {
    name: targetList.value[activeTargetIndex.value].name,
    ra: targetList.value[activeTargetIndex.value].ra,
    dec: targetList.value[activeTargetIndex.value].dec
  }
  emits('targetUpdated', targetData)
}

// Function to display exposures for a target as a concatenated string
const formatExposures = (exposures) => {
  return exposures.map(exposure => `${exposure.filterName} - ${exposure.exposureTime}s x ${exposure.count}`).join(', ')
}

onMounted(() => {
  getFilterList()
})

</script>

<template>
    <div class="container">
      <div v-if="showProjectField" class="input-wrapper">
        <label for="project-name">Project Name:</label>
        <input id="project-name" v-model="projectName" class="scheduling-inputs" placeholder="Enter project name" />
      </div>
      <!-- Render saved targets and exposures -->
      <div v-if="targetList.length > 1">
        <div v-for="(target, index) in targetList" :key="index">
          <div v-if="index !== activeTargetIndex && target.exposures.length > 0">
            {{ target.name }}: {{ formatExposures(target.exposures) }}
          </div>
        </div>
      </div>
      <!-- Render saved exposures for the active target -->
      <div v-if="targetList[activeTargetIndex].exposures.length > 0">
        <div>
          {{ targetList[activeTargetIndex].name || props.target }}: {{ formatExposures(targetList[activeTargetIndex].exposures) }}
        </div>
      </div>
      <!-- Target input -->
      <div v-if="showTitleField" class="input-wrapper">
        <label for="target-list">Target:</label>
        <input
          id="target-list"
          v-model="targetList[activeTargetIndex].name"
          @blur="getRaDecFromTargetName"
          :disabled="!targetEnabled"
          :readonly="isTargetConfirmed"
          class="scheduling-inputs"
          placeholder="Enter target"
        />
        <p v-if="targetError" class="error-text">{{ targetError }}</p>
        <label>RA:</label>
        <input type="text" v-model="targetList[activeTargetIndex].ra" class="scheduling-inputs" readonly disabled/>
        <label>Dec:</label>
        <input type="text" v-model="targetList[activeTargetIndex].dec" class="scheduling-inputs" readonly disabled/>
      </div>
      <!-- Exposure settings -->
      <div class="exposure-settings" :class="{ disabled: !exposureEnabled }">
        <div class="select is-fullwidth">
          <select id="filter" v-model="settings.filter" :disabled="(!isTargetConfirmed && props.showProjectField) || !exposureEnabled">
            <option disabled value="">Choose a filter</option>
              <option v-for="filter in filterList" :key="filter.code" :value="filter.code">
                {{ filter.name }}
              </option>
          </select>
        </div>
        <div class="field is-horizontal">
          <label>Exposure Time</label>
          <input type="text" v-model="settings.exposureTime" :disabled="!exposureEnabled" placeholder="Exp time" />
          <label>Count</label>
          <input type="text" v-model="settings.count" :disabled="!exposureEnabled" placeholder="Count" />
        </div>
      </div>
      <!-- Add exposure button -->
      <v-btn @click="addExposure" color="indigo" :disabled="!addExposuresEnabled" class="add-exposure">Add Exposure</v-btn>
      <!-- Add another target button -->
      <v-btn v-if="props.showTitleField" @click="addTarget" color="indigo" :disabled="!addTargetEnabled" class="add-target">Add Another Target</v-btn>
    </div>
</template>
