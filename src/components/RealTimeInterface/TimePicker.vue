<script setup>
import { ref } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const date = ref();
</script>

<template>
    <div>
      <Datepicker v-model="date" />
    </div>
  </template>
  