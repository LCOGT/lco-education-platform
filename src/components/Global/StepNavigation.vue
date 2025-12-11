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
  bottom: 4%;
  z-index: 101;
  max-width: 45%;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.25rem;
}

</style>
