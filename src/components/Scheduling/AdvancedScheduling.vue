<script setup>
import { ref } from 'vue'

const projectName = ref('')
const nameEntered = ref(false)

const saveProjectName = () => {
  if (projectName.value.trim() !== '') {
    nameEntered.value = true
  }
}

const editProjectName = () => {
  nameEntered.value = false
}

</script>

<template>
    <h2>Photon Ranch Scheduling Observation</h2>
    <div class="project-name" v-if="!nameEntered">
        <p class="p-text">Project Name:</p>
        <input type="text" v-model="projectName" placeholder="" class="scheduling-inputs">
        <v-btn  @click="saveProjectName" color="indigo">next</v-btn>
    </div>
    <div v-else-if="nameEntered">
        <div class="project-name">
            <p class="p-text">{{ projectName }}</p>
            <span class="material-icons icon" color="indigo" @click="editProjectName">edit</span>
        </div>
    </div>
</template>

<style scoped>
.project-name {
    margin: 1em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
.p-text {
    margin-right: 1em;
    font-size: 1.2em;
    cursor: default;
}
.scheduling-inputs {
    padding: 0.5em;
    box-sizing: border-box;
    border: 1px solid gray;
    border-radius: 0.2em;
}
.icon {
    font-size: 1.5em;
    cursor: pointer;
}
</style>
