<script setup>
import SchedulingSettings from './SchedulingSettings.vue'
import Calendar from './Calendar.vue'

</script>

<template>
  <h2>Photon Ranch</h2>
  <h4>Scheduling Observations</h4>
  <SchedulingSettings :show-project-field="true"/>
  <Calendar />
</template>

<style scoped>
h2 {
  margin-top: 1em;
}
.input-wrapper {
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
</style>
