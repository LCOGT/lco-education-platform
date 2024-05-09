<script setup>
import { ref, defineEmits } from 'vue'

const projectName = ref('')
const emits = defineEmits(['nameEntered'])

const saveProjectName = () => {
  if (projectName.value.trim() !== '') {
    console.log('project name entered', projectName.value)
    emits('nameEntered', projectName.value)
  }
}

</script>

<template>
    <div class="input-wrapper project-wrapper">
        <p class="p-text">Project Name:</p>
        <input v-model="projectName" placeholder="Enter project name" />
        <v-btn color="indigo" :disabled="!projectName" @click="saveProjectName">Save</v-btn>
    </div>
</template>
