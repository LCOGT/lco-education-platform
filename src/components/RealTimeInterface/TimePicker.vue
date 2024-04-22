<script setup>
import { ref } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const date = ref();
</script>

<template>
    <div class="datepicker">
      <Datepicker v-model="date" class="date"/>
    </div>
</template>

<style scoped>
.datepicker {
    margin-left: 5em;
    max-width: 5%;
}
</style>
  