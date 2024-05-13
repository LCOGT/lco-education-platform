<script setup>
import { ref, reactive, defineEmits, computed } from 'vue'

const emits = defineEmits(['telescopeAdded'])

const telescopeAndDate = reactive({
  telescope: '',
  startDate: null,
  endDate: null
})

const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

const telescopeFieldsComplete = computed(() => {
  return telescopeAndDate.telescope === '' || telescopeAndDate.telescope === 'Select telescope' ||
  telescopeAndDate.startDate === null ||
  telescopeAndDate.endDate === null
})

const saveTelescopeAndDateRange = () => {
  if (!telescopeFieldsComplete.value) {
    emits('telescopeAdded', telescopeAndDate)
  }
}
const toggleStartDatePicker = () => {
  showStartDatePicker.value = !showStartDatePicker.value
}

const toggleEndDatePicker = () => {
  showEndDatePicker.value = !showEndDatePicker.value
}

const onStartDateSelected = (date) => {
  telescopeAndDate.startDate.value = date
  showStartDatePicker.value = false
}

const onEndDateSelected = (date) => {
  telescopeAndDate.endDate.value = date
  showEndDatePicker.value = false
}
</script>

<template>
    <div>
      <label for="telescope">Telescope</label>
      <select v-model="telescopeAndDate.telescope" class="scheduling-inputs">
        <option disabled value="">Select telescope</option>
        <option value="Mountain Ranch">Mountain Ranch</option>
        <option value="Luther College">Luther College</option>
        <option value="Apache Ridge">Apache Ridge</option>
        <option value="Eltham College">Eltham College</option>
      </select>
      <div @click="toggleStartDatePicker" class="input-wrapper">
        <input readonly type="text" :value="telescopeAndDate.startDate ? telescopeAndDate.startDate.toDateString() : 'Start Date'" class="scheduling-inputs" />
        <v-date-picker v-show="showStartDatePicker" v-model="telescopeAndDate.startDate" @change="onStartDateSelected"/>
      </div>
      <div @click="toggleEndDatePicker" class="input-wrapper">
        <input readonly type="text" :value="telescopeAndDate.endDate ? telescopeAndDate.endDate.toDateString() : 'End Date'" class="scheduling-inputs" />
        <v-date-picker v-show="showEndDatePicker" v-model="telescopeAndDate.endDate" @change="onEndDateSelected"/>
      </div>
      <v-btn color="indigo" :disabled="!telescopeAndDate.telescope || !telescopeAndDate.startDate || !telescopeAndDate.endDate" @click="saveTelescopeAndDateRange">Save</v-btn>
    </div>
</template>
