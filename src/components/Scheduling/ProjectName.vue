<script setup>
import { ref, defineEmits } from 'vue'

const projectName = ref('')
const emits = defineEmits(['nameEntered'])

const saveProjectName = () => {
  if (projectName.value.trim() !== '') {
    emits('nameEntered', projectName.value)
  }
}

</script>

<template>
    <div>
        <p class="p-text">Project Name:</p>
        <input v-model="projectName" placeholder="Enter project name" />
        <v-btn color="indigo" :disabled="!projectName" @click="saveProjectName">Save</v-btn>
    </div>
</template>
