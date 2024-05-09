<script setup>
import { reactive, defineEmits, computed } from 'vue'

const emits = defineEmits(['settingsAdded'])

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

const isSaveDisabled = computed(() => {
  return settings.filter === '' || settings.filter === 'Choose a filter' ||
  settings.exposureTime.trim() === '' ||
  settings.count.trim() === ''
})

const saveSettings = () => {
  if (!isSaveDisabled.value) {
    emits('settingsAdded', { ...settings })
    settings.filter = ''
    settings.exposureTime = ''
    settings.count = ''
  }
}

</script>

<template>
    <div>
      <label for="filter">Filter</label>
      <select v-model="settings.filter" class="scheduling-inputs">
        <option disabled value="">Choose a filter</option>
        <option value="Blue">Blue</option>
        <option value="Green (V)">Green (V)</option>
        <option value="Red">Red</option>
        <option value="H-Alpha">H-Alpha</option>
      </select>
      <input type="text" v-model="settings.exposureTime" placeholder="Exp time" class="scheduling-inputs">
      <input type="text" v-model="settings.count" placeholder="count" class="scheduling-inputs">
      <v-btn color="indigo" :disabled="isSaveDisabled" @click="saveSettings" >Save</v-btn>
    </div>
  </template>
