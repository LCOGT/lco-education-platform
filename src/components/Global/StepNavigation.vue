<script setup>
import { defineProps, watch } from 'vue'

const props = defineProps({
  disableNextStepBtn: {
    type: Boolean,
    default: false,
    required: true
  },
  showPrevious: {
    type: Boolean,
    default: false,
    required: true
  },
  showNext: {
    type: Boolean,
    default: false,
    required: true
  }
})

</script>

<template>
  <div class="step-btns footer-left">
    <v-btn
      color="indigo"
      @click="$emit('previous')"
      v-if="props.showPrevious"
    >
      Previous step
    </v-btn>
    <v-btn
      color="indigo"
      :disabled="props.disableNextStepBtn"
      @click="$emit('next')"
    >
      Next step
    </v-btn>
  </div>
</template>

<style scoped>
.step-btns {
  display: flex;
  gap: 1em;
}
.footer-left {
  position: fixed;
  left: 1.5rem;
  bottom: 1.5rem;
  /* z-index: 101; */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: none;
  box-shadow: none;
}

</style>
