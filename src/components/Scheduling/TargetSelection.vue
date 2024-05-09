<script setup>
import { ref, defineEmits } from 'vue'

const newTargetName = ref('')

const emits = defineEmits(['targetAdded'])

const saveTarget = () => {
  if (newTargetName.value.trim() !== '') {
    emits('targetAdded', newTargetName.value.trim())
    console.log('Target added:', newTargetName.value.trim())
    newTargetName.value = ''
  }
}
</script>

<template>
    <div>
        <p class="p-text">Target:</p>
        <input v-model="newTargetName" placeholder="Enter target name" />
        <v-btn color="indigo" :disabled="!newTargetName" @click="saveTarget">Save</v-btn>
    </div>
</template>
