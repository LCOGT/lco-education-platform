<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal'
  }
})
const emit = defineEmits(['close'])

</script>
<template>
    <div :class="['modal', { 'is-active': isOpen }]">
      <div class="modal-background" @click="() => emit('close')"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ title }}</p>
          <button class="delete" aria-label="close" @click="() => emit('close')"></button>
        </header>
        <section class="modal-card-body">
          <slot></slot>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="() => emit('close')">Close</button>
        </footer>
      </div>
    </div>
  </template>

  <style scoped>
  .modal-card {
    max-width: 600px;
    width: 90%;
  }
  </style>
