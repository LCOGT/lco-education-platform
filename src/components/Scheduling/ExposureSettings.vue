<script setup>
import { reactive, defineEmits, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emits = defineEmits(['settingsAdded'])

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

const settingsFieldsComplete = computed(() => {
  return settings.filter === '' || settings.filter === 'Choose a filter' ||
  settings.exposureTime.trim() === '' ||
  settings.count.trim() === ''
})

const saveSettings = () => {
  if (!settingsFieldsComplete.value) {
    emits('settingsAdded', { ...settings })
    settings.filter = ''
    settings.exposureTime = ''
    settings.count = ''
  }
}

</script>

<template>
 <div class="field is-horizontal">
  <div class="field-label is-normal">
    <label for="filter">Filter</label>
  </div>
  <div class="field-body">
    <div class="field is-narrow">
      <div class="control">
        <div class="select is-fullwidth">
          <select v-model="settings.filter" class="scheduling-inputs">
            <option disabled value="">Choose a filter</option>
            <option value="Blue">Blue</option>
            <option value="Green (V)">Green (V)</option>
            <option value="Red">Red</option>
            <option value="H-Alpha">H-Alpha</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="field is-horizontal">
  <div class="field-label is-normal">
    <label class="label">Exposures</label>
  </div>
  <div class="field-body">
      <p class="control is-expanded has-icons-left">
        <input type="text" v-model="settings.exposureTime" placeholder="Exp time" class="input">
        <span class="icon is-small is-left">
          <FontAwesomeIcon icon="fa-solid fa-clock" class="blue" />
        </span>
      </p>
      <p><FontAwesomeIcon icon="fa-solid fa-xmark" class="blue" /></p>
      <p class="control">
        <input type="text" v-model="settings.count" placeholder="count" class="input">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
        <span class="icon is-small is-right">
          <i class="fas fa-check"></i>
        </span>
      </p>
  </div>
</div>
<button class="red-bg button" :disabled="settingsFieldsComplete" @click="saveSettings" >Save</button>
  </template>
