<script setup>
import { ref, defineEmits } from 'vue'

const emits = defineEmits(['telescopeAdded'])

const telescope = ref('')

const saveTelescope = () => {
  if (telescope.value !== '') {
    emits('telescopeAdded', telescope.value)
  }
}
</script>

<template>
    <div>
      <label for="telescope">telescope</label>
      <select v-model="telescope" class="scheduling-inputs">
        <option disabled value="">Select telescope</option>
        <option value="Mountain Ranch">Mountain Ranch</option>
        <option value="Luther College">Luther College</option>
        <option value="Apache Ridge">Apache Ridge</option>
        <option value="Eltham College">Eltham College</option>
      </select>
      <v-btn color="indigo" :disabled="!telescope" @click="saveTelescope" >Save</v-btn>
    </div>
  </template>
